# ☁️ Cloud Integration & Real-World Deployment Feature

> **Status**: Planned for future manual implementation.
> **Goal**: Bridge the gap between "Hello World" exercises and production-grade DevOps skills.

## 🎯 Concept

Students shouldn't just run tests on `localhost`. They should deploy their code to the real world (e.g., Cloudflare Workers, Fly.io, AWS Lambda) as part of the course definition.

## 🏗️ Technical Implementation

### 1. Deployment Hooks

The `course.json` schema needs to support a deployment lifecycle, similar to CI/CD pipelines.

```json
{
  "commands": {
    "test": "bun test",
    "deploy": "wrangler deploy --dry-run --outdir dist",
    "verify_deploy": "curl -f https://student-app.workers.dev/health"
  }
}
```

### 2. Workflow State Machine

1.  **Test Phase**: Student passes all unit tests (`prog` runner).
2.  **Deploy Phase**: UI shows "Deploy" button (unlocked).
    - Backend executes the `deploy` command.
    - Requires capturing/streaming stdout to the user.
3.  **Verification Phase**:
    - After deployment, the backend runs `verify_deploy`.
    - This ensures the _deployed_ version actually works (e.g., checking an HTTP endpoint).

### 3. Environment Management

- **Secrets**: The platform needs a secure way to inject API keys (e.g., `CLOUDFLARE_API_TOKEN`) into the runner process without exposing them to the frontend.
- **Templates**: Instructors provide `wrangler.toml` templates that auto-populate with the student's specific project ID.

## 🧩 Why this solves a problem

Most coding tutorials stop at "it runs on my machine". This feature creates a verifiable "Portfolio of Work" where students can show off live URLs, proving they have full-stack deployment skills.
