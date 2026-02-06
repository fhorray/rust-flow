import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!, // Fallback for local generation
    databaseId: '1917a7dd-630d-4f20-bad7-789bc45f0c26',
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
