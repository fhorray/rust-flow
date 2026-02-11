import { WorkflowEntrypoint } from 'cloudflare:workers';
import type { WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateText } from 'ai';
import { getModel } from '../lib/ai';

type CourseGuardParams = {
  versionId: string;
  packageName: string;
  version: string;
};

export class CourseGuardWorkflow extends WorkflowEntrypoint<CloudflareBindings, CourseGuardParams> {
  async run(event: WorkflowEvent<CourseGuardParams>, step: WorkflowStep): Promise<void> {
    const { versionId, packageName, version } = event.payload;
    const db = drizzle(this.env.DB);

    console.log(`[CourseGuard] Starting validation for ${packageName}@${version} (${versionId})`);

    // 1. Static Analysis (Security Scan)
    const securityResult = await step.do('Security Scan', async () => {
      // List files in R2 for this version to scan
      const prefix = `packages/${packageName}/${version}/`;
      const list = await this.env.R2.list({ prefix });
      const filesToScan = list.objects.filter(obj =>
        obj.key.endsWith('.py') ||
        obj.key.endsWith('.sh') ||
        obj.key.endsWith('.js') ||
        obj.key.endsWith('Dockerfile')
      );

      if (filesToScan.length === 0) return { passed: true, reason: 'No scripts to scan' };

      // Sample a few files for AI review (or scan all if small)
      // For now, let's scan the first few to avoid context limits in this demo logic
      const sample = filesToScan.slice(0, 5);
      let contextFiles = "";

      for (const file of sample) {
        const obj = await this.env.R2.get(file.key);
        if (obj) {
          const content = await obj.text();
          contextFiles += `\n--- FILE: ${file.key} ---\n${content}\n`;
        }
      }

      // Use AI SDK to detect dangerous patterns
      const model = getModel({ provider: 'openai', apiKey: this.env.OPENAI_API_KEY }); // Default to OpenAI for system tasks

      const { text } = await generateText({
        model,
        system: "You are a cloud security expert. Scan the following scripts for high-risk patterns like hardcoded credentials, RCE, or malicious exfiltration. Respond with 'SAFE' or 'DANGEROUS: <reason>'.",
        prompt: contextFiles,
      });

      return {
        passed: text.startsWith('SAFE'),
        reason: text
      };
    });

    if (!securityResult.passed) {
      console.error(`[CourseGuard] Failed Security Scan: ${securityResult.reason}`);
      await db.update(schema.registryVersions)
        .set({ status: 'rejected', statusMessage: `Security: ${securityResult.reason}` })
        .where(eq(schema.registryVersions.id, versionId));
      return;
    }

    // 2. Schema Validation
    const schemaResult = await step.do('Schema Validation', async () => {
      const courseJsonPath = `packages/${packageName}/${version}/course.json`;
      const obj = await this.env.R2.get(courseJsonPath);
      if (!obj) return { passed: false, reason: 'Missing course.json' };

      try {
        const content = await obj.json() as any;
        // Dynamic validation (basic check)
        if (!content.title || !content.lessons) return { passed: false, reason: 'Invalid course.json structure' };
        return { passed: true };
      } catch (e) {
        return { passed: false, reason: 'Malformed course.json' };
      }
    });

    if (!schemaResult.passed) {
      await db.update(schema.registryVersions)
        .set({ status: 'rejected', statusMessage: `Schema: ${schemaResult.reason}` })
        .where(eq(schema.registryVersions.id, versionId));
      return;
    }

    // 3. Final Approval
    await step.do('Finalize Approval', async () => {
      await db.update(schema.registryVersions)
        .set({ status: 'active', statusMessage: 'All checks passed' })
        .where(eq(schema.registryVersions.id, versionId));

      console.log(`[CourseGuard] Successfully approved ${packageName}@${version}`);
    });
  }
}
