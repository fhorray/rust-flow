import { persistentAtom } from '@nanostores/persistent';

export type QuizSession = {
  currentQuestionIndex: number;
  answers: Record<number, any>;
  results: Record<number, { isAnswered: boolean; isCorrect: boolean }>;
  score: number;
  showSummary: boolean;
  completed?: boolean;
};

export type QuizSessionsState = Record<string, QuizSession>;

export const $quizSessions = persistentAtom<QuizSessionsState>('progy:quizSessions', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * Persists or updates a quiz session for a specific exercise.
 */
export const saveQuizSession = (exerciseId: string, session: QuizSession) => {
  const current = $quizSessions.get();
  $quizSessions.set({
    ...current,
    [exerciseId]: session,
  });
};

/**
 * Retrieves a quiz session for a specific exercise.
 */
export const getQuizSession = (exerciseId: string): QuizSession | null => {
  return $quizSessions.get()[exerciseId] || null;
};

/**
 * Resets a quiz session for a specific exercise.
 */
export const clearQuizSession = (exerciseId: string) => {
  const current = $quizSessions.get();
  if (current[exerciseId]) {
    const updated = { ...current };
    delete updated[exerciseId];
    $quizSessions.set(updated);
  }
};