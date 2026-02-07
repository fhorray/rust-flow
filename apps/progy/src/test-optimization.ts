import { CourseLoader } from "./course-loader";

async function testOptimization() {
  process.env.PROGY_API_URL = "http://127.0.0.1:8787";
  console.log("--- Testing Optimized Resolution ---");

  const testCases = [
    { input: "rust", note: "Should have branch: main" },
    { input: "https://github.com/user/repo#feat/new-course", note: "Should have branch: feat/new-course" },
    { input: "https://github.com/user/no-branch.git", note: "Should have no branch" },
  ];

  for (const { input, note } of testCases) {
    try {
      const { url, branch } = await CourseLoader.resolveSource(input);
      console.log(`Input: '${input}' (${note})`);
      console.log(`  -> URL: ${url}`);
      console.log(`  -> Branch: ${branch || "default"}`);
    } catch (e: any) {
      console.error(`❌ Failed: ${e.message}`);
    }
  }
}

testOptimization().catch(console.error);
