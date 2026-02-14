import { WorkflowEntrypoint } from 'cloudflare:workers';
import type { WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateText } from 'ai';
import { getModel } from '../lib/ai';
import { unzipSync } from 'fflate';
import { workflowLogger } from './utils';

type CourseGuardParams = {
  versionId: string;
  packageName: string;
  version: string;
  guardSnapshot?: Record<string, string>;
};

export class CourseGuardWorkflow extends WorkflowEntrypoint<CloudflareBindings, CourseGuardParams> {
  async run(event: WorkflowEvent<CourseGuardParams>, step: WorkflowStep): Promise<void> {
    const { versionId, packageName, version } = event.payload;
    const db = drizzle(this.env.DB);
    const logger = workflowLogger(step, 'CourseGuard');

    // 0. Fetch Artifact & Prepare Filtered Context
    const { filteredFiles, totalFilesCount } = await step.do('Unzip & Filter Artifact', async () => {
      // 1. Fast Path: Client-Provided Snapshot
      if (event.payload.guardSnapshot && Object.keys(event.payload.guardSnapshot).length > 0) {
        return {
          filteredFiles: event.payload.guardSnapshot,
          totalFilesCount: Object.keys(event.payload.guardSnapshot).length
        };
      }

      // 2. Slow Path: Download & Unzip (Legacy/Fallback)
      const versionData = await db.select({
        storageKey: schema.registryVersions.storageKey
      })
        .from(schema.registryVersions)
        .where(eq(schema.registryVersions.id, versionId))
        .get();

      if (!versionData?.storageKey) throw new Error('Artifact storage key not found');

      const obj = await this.env.R2.get(versionData.storageKey);
      if (!obj) throw new Error('Artifact not found in R2');

      const buffer = await obj.arrayBuffer();
      const files = unzipSync(new Uint8Array(buffer));
      const binaryExtensions = [
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
        '.mp4', '.mov', '.avi', '.mp3', '.wav',
        '.zip', '.gz', '.tar', '.pdf', '.bin', '.exe', '.dll', '.so', '.wasm'
      ];
      const excludedFolders = ['assets/', 'images/', 'public/', 'node_modules/', '.git/', '.progy/'];

      const filtered: Record<string, string> = {};
      let count = 0;

      for (const key of Object.keys(files)) {
        count++;

        // Ignore directories (keys ending in / or with 0 length content)
        if (key.endsWith('/') || files[key].length === 0) continue;

        const isExcluded = excludedFolders.some(folder => key.startsWith(folder)) ||
          binaryExtensions.some(ext => key.toLowerCase().endsWith(ext));

        if (!isExcluded) {
          try {
            const content = new TextDecoder().decode(files[key]);
            // Only add if it's likely text
            if (!content.includes('\u0000')) {
              filtered[key] = content.slice(0, 50000); // 50KB limit per file
            }
          } catch (e) {
            // Ignore decoding errors
          }
        }
      }


      return {
        filteredFiles: filtered,
        totalFilesCount: count
      };
    });

    await logger.info(`Unzipped ${totalFilesCount} files, filtered ${Object.keys(filteredFiles).length} for analysis`);

    // 1. Static Analysis
    const securityResult = await step.do('Security Scan', async () => {
      // Prioritize files that look like scripts or config
      const suspiciousExtensions = ['.sh', '.py', '.js', '.bat', 'Dockerfile', '.yml', '.yaml'];

      const allFiles = Object.keys(filteredFiles).filter(key =>
        !key.endsWith('course.json') && !key.endsWith('progy.toml')
      );

      // Sort: Suspicious files first, then the rest
      const sortedFiles = allFiles.sort((a, b) => {
        const aSusp = suspiciousExtensions.some(ext => a.toLowerCase().endsWith(ext)) ? 0 : 1;
        const bSusp = suspiciousExtensions.some(ext => b.toLowerCase().endsWith(ext)) ? 0 : 1;
        return aSusp - bSusp;
      });

      if (sortedFiles.length === 0) {
        return { passed: true, reason: 'No scripts to scan' };
      }

      // Take a larger sample (up to 20 files) prioritizing the suspicious ones
      const sample = sortedFiles.slice(0, 20);
      let contextFiles = "";
      for (const key of sample) {
        contextFiles += `\n--- FILE: ${key} ---\n${filteredFiles[key]}\n`;
      }


      const model = getModel({ provider: 'openai', apiKey: this.env.OPENAI_API_KEY });
      const { text } = await generateText({
        model,
        system: `You are a security auditor for an educational coding platform. 
        Your goal is to detect MALICIOUS intent or CRITICAL risks that could harm a STUDENT'S local machine or Docker environment.
        
        ALLOWED (Educational Context):
        - Hardcoded database credentials (e.g., DB_USER, DB_PASS) for local exercises.
        - Simplified SQL interactions for learning purposes.
        - Local network calls expected for the course.

        FORBIDDEN (Actual Risks):
        - Remote Code Execution (RCE) on the student's host machine (outside Docker).
        - Malicious data exfiltration (sending user files to external servers).
        - Exploits that target the student's personal files or system settings.
        - Intentional malware or clear backdoor attempts.

        Respond with 'SAFE' if the code is acceptable for a student to run.
        Respond with 'DANGEROUS: <reason>' ONLY if there is a real threat to the student.`,
        prompt: contextFiles,
      });

      const passed = text.trim().startsWith('SAFE');
      const guardResult = { passed, reason: text };

      // Store AI result in the new 'guard' field
      await db.update(schema.registryVersions)
        .set({ guard: JSON.stringify(guardResult) })
        .where(eq(schema.registryVersions.id, versionId));

      return guardResult;
    });

    await logger.info(`AI detection result: ${securityResult.reason}`);

    if (!securityResult.passed) {
      await logger.error(`Failed Security Scan: ${securityResult.reason}`);
      await step.do('Reject - Security', async () => {
        // Mark version as rejected
        await db.update(schema.registryVersions)
          .set({ status: 'rejected', statusMessage: `Security: ${securityResult.reason}` })
          .where(eq(schema.registryVersions.id, versionId));

        // CRITICAL: Mark PACKAGE as private if AI scan fails
        const version = await db.select({ packageId: schema.registryVersions.packageId })
          .from(schema.registryVersions)
          .where(eq(schema.registryVersions.id, versionId))
          .get();

        if (version?.packageId) {
          await db.update(schema.registryPackages)
            .set({ isPublic: false })
            .where(eq(schema.registryPackages.id, version.packageId));
        }
      });
      return;
    }


    // We do not do the schema validation here because the pack command will do it

    // 2. Final Approval
    await step.do('Finalize Approval', async () => {
      await db.update(schema.registryVersions)
        .set({ status: 'active', statusMessage: 'All checks passed' })
        .where(eq(schema.registryVersions.id, versionId));
    });

    await logger.info(`Successfully approved ${packageName}@${version}`);

    // 3. Notify Channel
    await step.do('Notify Channel', async () => {
      // Check if it's the first version
      const pkgRow = await db.select({ id: schema.registryPackages.id })
        .from(schema.registryPackages)
        .where(eq(schema.registryPackages.name, packageName))
        .get();

      if (!pkgRow) return;

      const versions = await db.select({ id: schema.registryVersions.id })
        .from(schema.registryVersions)
        .where(eq(schema.registryVersions.packageId, pkgRow.id))
        .all();

      // ONLY notify if it's NOT the first version
      if (versions.length <= 1) {
        await logger.info('Skipping notification for first publication');
        return;
      }

      const notificationId = crypto.randomUUID();
      const channelKey = `notifications:channels:course:${packageName}:${notificationId}`;
      const notification = {
        id: notificationId,
        title: `Course Updated: ${packageName}`,
        message: `Version ${version} is now available!`,
        createdAt: new Date().toISOString(),
      };

      await this.env.KV.put(channelKey, JSON.stringify(notification), {
        expirationTtl: 60 * 60 * 24 * 30
      });

      await logger.info(`Notification broadcasted for ${packageName}`);
    });
  }
}