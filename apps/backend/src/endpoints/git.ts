
import { Hono } from "hono";
import { authServer } from "../auth";
import { account } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { verifySession } from "../auth-utils";

const git = new Hono<{ Bindings: CloudflareBindings }>();

// GET /api/git/credentials
// Returns the GitHub access token for the authenticated user
git.get("/credentials", async (c) => {
  const session = await verifySession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = drizzle(c.env.DB);

  // Find GitHub account for this user
  const githubAccount = await db.select()
    .from(account)
    .where(and(
      eq(account.userId, session.user.id),
      eq(account.providerId, "github")
    ))
    .get();

  if (!githubAccount || !githubAccount.accessToken) {
    return c.json({ error: "No GitHub connection found. Please login again." }, 404);
  }

  // Basic check if token is expired (if expiresAt field is populated)
  if (githubAccount.accessTokenExpiresAt && new Date() > githubAccount.accessTokenExpiresAt) {
    return c.json({ error: "GitHub token expired. Please login again." }, 403);
  }

  return c.json({
    user: githubAccount.accountId, // GitHub User ID or Username check might be needed
    token: githubAccount.accessToken
  });
});

// POST /api/git/ensure-repo
// Ensures the course repository exists on GitHub
git.post("/ensure-repo", async (c) => {
  const session = await verifySession(c);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { courseId } = await c.req.json() as { courseId: string };
  if (!courseId) return c.json({ error: "Missing courseId" }, 400);

  const db = drizzle(c.env.DB);
  const githubAccount = await db.select()
    .from(account)
    .where(and(
      eq(account.userId, session.user.id),
      eq(account.providerId, "github")
    ))
    .get();

  if (!githubAccount || !githubAccount.accessToken) {
    return c.json({ error: "No GitHub connection found." }, 404);
  }

  const token = githubAccount.accessToken;
  const repoName = `progy-${courseId}`; // Standardize repo name: progy-rust-basics

  // 1. Check if repo exists
  const checkRes = await fetch(`https://api.github.com/user/repos?per_page=100&type=owner`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "Progy-CLI"
    }
  });

  if (!checkRes.ok) {
    console.error("[GIT-API] Failed to list repos", await checkRes.text());
    return c.json({ error: "Failed to communicate with GitHub" }, 502);
  }

  const repos = await checkRes.json() as any[];
  const existing = repos.find((r: any) => r.name === repoName);

  if (existing) {
    return c.json({
      repoUrl: existing.clone_url,
      htmlUrl: existing.html_url,
      isNew: false
    });
  }

  // 2. Create if not exists
  console.log(`[GIT-API] Creating repo: ${repoName} for user ${session.user.id}`);
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
      auto_init: true // Create with README so we can pull immediately
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error("[GIT-API] Create failed", err);
    return c.json({ error: `Failed to create repository: ${err}` }, 500);
  }

  const newRepo = await createRes.json() as any;
  return c.json({
    repoUrl: newRepo.clone_url,
    htmlUrl: newRepo.html_url,
    isNew: true
  });
});

export default git;
