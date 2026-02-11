import { WorkflowEntrypoint } from 'cloudflare:workers';
import type { WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { generateText } from 'ai';
import { getModel, createTutorTools, type AIContext } from '../lib/ai';

type TutorParams = {
  userId: string;
  courseId: string;
  exerciseId: string;
  context: AIContext;
};

export class TutorAgentWorkflow extends WorkflowEntrypoint<CloudflareBindings, TutorParams> {
  async run(event: WorkflowEvent<TutorParams>, step: WorkflowStep): Promise<void> {
    const { userId, courseId, exerciseId, context } = event.payload;
    const db = drizzle(this.env.DB);

    console.log(`[TutorAgent] Starting session for User:${userId} on ${courseId}/${exerciseId}`);

    // 1. Analyze Struggle
    const analysis = await step.do('Analyze Misconception', async () => {
      const model = getModel({ provider: 'openai', apiKey: this.env.OPENAI_API_KEY });
      const tools = createTutorTools(context);

      const { text, toolResults } = await generateText({
        model,
        system: "You are the Progy Tutor Agent. Analyze the student's code and error to identify the CORE misconception. Use the tools to explore context if needed.",
        prompt: `The student is stuck on ${exerciseId} in ${courseId}. Here is the context: ${JSON.stringify(context)}`,
        tools
      });

      return {
        misconception: text,
        toolsUsed: toolResults.map(r => r.toolName)
      };
    });

    // 2. Generate Micro-Lesson
    const lesson = await step.do('Generate Micro-Lesson', async () => {
      const model = getModel({ provider: 'openai', apiKey: this.env.OPENAI_API_KEY });

      const { text } = await generateText({
        model,
        system: "Generate a short, encouraging Markdown 'Micro-Lesson' that addresses the student's misconception without giving the final code.",
        prompt: `Misconception identified: ${analysis.misconception}. Context: ${JSON.stringify(context)}`,
      });

      return text;
    });

    // 3. Notify Student (Save to D1 for CLI to fetch)
    await step.do('Store Recommendation', async () => {
      // In a real app, we'd have a 'tutor_messages' table. 
      // For now, let's update user metadata or a specific table if it exists.
      // We'll update the courseProgress with a special 'tutorSuggestion' field.
      const syncId = `${userId}:${courseId}`;
      const progress = await db.select().from(schema.courseProgress).where(eq(schema.courseProgress.id, syncId)).get();

      if (progress) {
        const data = JSON.parse(progress.data);
        data.tutorSuggestion = {
          exerciseId,
          lesson,
          timestamp: new Date().toISOString()
        };

        await db.update(schema.courseProgress)
          .set({ data: JSON.stringify(data), updatedAt: new Date() })
          .where(eq(schema.courseProgress.id, syncId));
      }

      console.log(`[TutorAgent] Lesson stored for student on ${exerciseId}`);
    });
  }
}
