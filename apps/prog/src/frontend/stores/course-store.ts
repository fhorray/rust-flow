import { atom, map, computed } from 'nanostores';
import type { Exercise, GroupedExercises, TestStatus, Progress } from '../types';
import { createFetcherStore } from './query-client';

// --- State Queries ---

export const $exerciseGroupsQuery = createFetcherStore<GroupedExercises>(['/api/exercises']);
export const $progressQuery = createFetcherStore<Progress>(['/api/progress']);

export const $selectedExercise = atom<Exercise | null>(null);

// Reactive chain for exercise details (Description)
export const $descriptionQuery = createFetcherStore<{ code: string; markdown: string }>([
  '/api/exercises/code?path=',
  computed($selectedExercise, (ex) => ex?.path || null),
  '&markdownPath=',
  computed($selectedExercise, (ex) => ex?.markdownPath || null),
]);

// Reactive chain for quizzes
export const $quizQuery = createFetcherStore<any>([
  '/api/exercises/quiz?path=',
  computed($selectedExercise, (ex) => (ex?.hasQuiz ? ex.path : null)),
]);

// --- State Atoms (Local/UI) ---

export const $results = map<Record<string, TestStatus>>({});
export const $setupReady = atom<boolean | null>(null);
export const $error = atom<string | null>(null);
export const $output = atom<string>('');
export const $friendlyOutput = atom<string>('');
export const $isRunning = atom<boolean>(false);
export const $isAiLoading = atom<boolean>(false);
export const $aiResponse = atom<string | null>(null);
export const $showFriendly = atom<boolean>(true);

// --- Computed Proxies (to maintain component compatibility) ---

export const $exerciseGroups = computed($exerciseGroupsQuery, (q) => q.data || {});
export const $progress = computed($progressQuery, (q) => q.data || null);
export const $description = computed($descriptionQuery, (q) => q.data?.markdown || null);
export const $quizData = computed($quizQuery, (q) => q.data || null);

export const $totalExercises = computed($exerciseGroups, (groups) =>
  Object.values(groups).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0)
);

export const $completedCount = computed($results, (results) =>
  Object.values(results).filter(s => s === 'pass').length
);

export const $progressPercent = computed([$totalExercises, $completedCount], (total, completed) =>
  total > 0 ? Math.round((completed / total) * 100) : 0
);

// --- Basic Setters ---

export const setSetupReady = (ready: boolean | null) => $setupReady.set(ready);
export const setError = (err: string | null) => $error.set(err);
export const setShowFriendly = (show: boolean) => $showFriendly.set(show);
export const setResults = (results: Record<string, TestStatus>) => $results.set(results);

// --- Actions & Queries ---

export const setSelectedExercise = (exercise: Exercise | null) => {
  $selectedExercise.set(exercise);
  // No imperative fetch needed! The queries will react to $selectedExercise.
  if (!exercise) {
    $aiResponse.set(null);
    $output.set('');
    $friendlyOutput.set('');
  }
};

export const fetchExercises = () => $exerciseGroupsQuery.revalidate();
export const fetchProgress = () => $progressQuery.revalidate();

export const runTests = async () => {
  const selected = $selectedExercise.get();
  if (!selected) return;

  $isRunning.set(true);
  try {
    const res = await fetch('/api/exercises/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseName: selected.exerciseName,
        id: selected.id,
        module: selected.module,
      }),
    });
    const data = await res.json();
    $output.set(data.rawOutput || data.output || '');
    $friendlyOutput.set(data.friendlyOutput || '');
    const status: TestStatus = data.success ? 'pass' : 'fail';
    $results.setKey(selected.id, status);
    if (data.success) fetchProgress();
  } catch (err) {
    $output.set('Failed to run tests.');
    $results.setKey(selected.id, 'fail');
  } finally {
    $isRunning.set(false);
  }
};

export const getAiHint = async () => {
  const selected = $selectedExercise.get();
  if (!selected) return;

  $isAiLoading.set(true);
  try {
    const res = await fetch('/api/ai/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '', error: $output.get() }),
    });
    const data = await res.json();
    $aiResponse.set(data.hint);
  } catch (err) {
    $aiResponse.set('Failed to get AI hint.');
  } finally {
    $isAiLoading.set(false);
  }
};

// Sync Results with Progress when loaded
$progress.subscribe(progress => {
  if (progress && progress.exercises) {
    const newResults: Record<string, TestStatus> = {};
    for (const [id, data] of Object.entries(progress.exercises)) {
      newResults[id] = data.status;
    }
    // Only update if different to avoid cycles/jitter? 
    // Map set is cheap.
    $results.set(newResults);
  }
});
