import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { tool } from 'ai';
import { z } from 'zod';

export interface AIConfig {
  provider?: 'openai' | 'anthropic' | 'google' | 'xai' | 'ollama';
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface AIContext {
  courseName: string;
  exerciseName: string;
  instructions?: string;
  code?: string;
  error?: string;
  lastOutput?: string;
}

export function getModel(config: AIConfig) {
  if (!config.provider || !config.apiKey) {
    throw new Error("AI provider or API key missing in request");
  }

  const options = {
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  };

  switch (config.provider) {
    case "openai": {
      const provider = createOpenAI(options);
      return provider(config.model || "gpt-4o-mini");
    }
    case "anthropic": {
      const provider = createAnthropic(options);
      return provider(config.model || "claude-sonnet-4-5");
    }
    case "google": {
      const provider = createGoogleGenerativeAI(options);
      return provider(config.model || "gemini-3-flash-preview");
    }
    case "xai": {
      const provider = createXai(options);
      return provider(config.model || "grok-4-1-fast-reasoning");
    }
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

export function constructSystemPrompt(context: AIContext) {
  return `You are Progy, a high-performance coding mentor for the ${context.courseName} course.
Your goal is to guide the student through Exercise: "${context.exerciseName}".

${context.instructions ? `### Exercise Instructions:\n${context.instructions}\n` : ""}
### Student's Current Code:
\`\`\`
${context.code || "No code provided yet."}
\`\`\`

${context.error ? `### Last Error / Test Failure:\n${context.error}\n` : ""}
${context.lastOutput ? `### Last Runner Output:\n${context.lastOutput}\n` : ""}

**Guidelines:**
1. Be concise and encouraging.
2. Use Socratic questioning: guide them to the answer rather than giving the code immediately.
3. If giving code, explain the concepts behind it.
4. Focus on best practices for the language being taught.
5. If the student is stuck on a compiler error, explain what the error means in simple terms.`;
}

export function constructExplanationPrompt(context: AIContext) {
  return `You are Progy, an expert coding instructor.
Your goal is to explain the core concepts of the current exercise "${context.exerciseName}" in the course "${context.courseName}".

${context.instructions ? `### Exercise Instructions:\n${context.instructions}\n` : ""}

### Student's Code Context:
\`\`\`
${context.code || "No code provided yet."}
\`\`\`

**Guidelines:**
1. Explain the "WHY" and "HOW" of the concepts used.
2. Do NOT give the solution code directly.
3. Use analogies if helpful.
4. Keep the explanation concise but comprehensive enough to clarify the topic.
5. If the code uses specific syntax/keywords, explain what they do.`;
}
export function constructGeneratePrompt(prompt: string, difficulty: string) {
  return `You are Progy, a challenge generator. Create a coding exercise based on this user request: "${prompt}".
Difficulty Level: ${difficulty}

Return a JSON object with the following structure:
{
  "title": "Exercise Title",
  "description": "Short explanation of the challenge",
  "code": "// The initial code for the student to fix or complete",
  "hint": "A single helpful hint",
  "filename": "exercise.rs" (or appropriate extension)
}

Ensure the code has at least one logical or syntax error for the student to fix, consistent with the difficulty.
Return ONLY the JSON object, no other text.`;
}

export function createTutorTools(context: AIContext) {
  return {
    getExerciseContext: tool({
      description: 'Get the current student code, instructions, and error for the exercise',
      inputSchema: z.object({}),
      execute: async () => ({
        code: context.code,
        instructions: context.instructions,
        error: context.error,
        lastOutput: context.lastOutput,
      })
    }),
    fetchCourseRoadmap: tool({
      description: 'Fetch the course roadmap to see upcoming lessons and concepts',
      inputSchema: z.object({}),
      execute: async () => {
        return `Current: ${context.courseName} > ${context.exerciseName}. Upcoming: More advanced patterns in ${context.courseName}.`;
      }
    }),
    recommendExercise: tool({
      description: 'Recommend a specific sub-topic or micro-lesson to the student',
      inputSchema: z.object({
        topic: z.string().describe('The topic the student is struggling with'),
        reason: z.string().describe('Why this specific topic is recommended'),
      }),
      execute: async ({ topic, reason }: { topic: string; reason: string }) => ({
        topic,
        reason,
        status: 'recommended'
      })
    })
  };
}
