import type { ServerType } from "../types";
import { getProgress, saveProgress, updateStreak, DEFAULT_PROGRESS } from "../helpers";

const getProgressHandler: ServerType<"/progress"> = async () => {
  try {
    return Response.json(await getProgress());
  } catch (e) {
    console.error(`[ERROR] getProgress failed: ${e}`);
    // Return default progress so frontend doesn't crash, but logged error on server
    return Response.json(JSON.parse(JSON.stringify(DEFAULT_PROGRESS)));
  }
};

const updateProgressHandler: ServerType<"/progress/update"> = async (req) => {
  try {
    const { type, id, success } = await req.json() as any;
    if (!id) return Response.json({ success: false, error: "Missing ID" });

    let progress = await getProgress();
    const now = new Date().toISOString();

    if (type === 'quiz' && success) {
      if (!progress.quizzes[id]) {
        progress.quizzes[id] = { passed: true, xpEarned: 10, completedAt: now };
        progress.stats.totalXp += 10;
        progress.stats = updateStreak(progress.stats);
        await saveProgress(progress);
      }
    }
    return Response.json({ success: true, progress });
  } catch (e) {
    return Response.json({ success: false, error: String(e) });
  }
};

export const progressRoutes = {
  "/progress": { GET: getProgressHandler },
  "/progress/update": { POST: updateProgressHandler }
};
