import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";

export class GitService {
  constructor(private env: CloudflareBindings) { }

  private get db() {
    return drizzle(this.env.DB);
  }

  async getCredentials(userId: string) {
    const githubAccount = await this.db.select()
      .from(schema.accounts)
      .where(and(
        eq(schema.accounts.userId, userId),
        eq(schema.accounts.providerId, "github")
      ))
      .get();

    if (!githubAccount || !githubAccount.accessToken) {
      throw new Error("No GitHub connection found");
    }

    if (githubAccount.accessTokenExpiresAt && new Date() > githubAccount.accessTokenExpiresAt) {
      throw new Error("GitHub token expired");
    }

    return {
      user: githubAccount.accountId,
      token: githubAccount.accessToken
    };
  }

  async ensureRepo(userId: string, courseId: string) {
    const credentials = await this.getCredentials(userId);
    const token = credentials.token;
    const repoName = `progy-${courseId}`;

    // 1. Check if repo exists
    const checkRes = await fetch(`https://api.github.com/user/repos?per_page=100&type=owner`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "Progy-CLI"
      }
    });

    if (!checkRes.ok) {
      throw new Error("Failed to list repos from GitHub");
    }

    const repos = await checkRes.json() as any[];
    const existing = repos.find((r: any) => r.name === repoName);

    if (existing) {
      return {
        repoUrl: existing.clone_url,
        htmlUrl: existing.html_url,
        isNew: false
      };
    }

    // 2. Create if not exists
    const createRes = await fetch(`https://api.github.com/user/repos`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "Progy-CLI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: repoName,
        private: true,
        description: `Progy Course Progress for ${courseId}`,
        auto_init: true
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create repository: ${err}`);
    }

    const newRepo = await createRes.json() as any;
    return {
      repoUrl: newRepo.clone_url,
      htmlUrl: newRepo.html_url,
      isNew: true
    };
  }
}
