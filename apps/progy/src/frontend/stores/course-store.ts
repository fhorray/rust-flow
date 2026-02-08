import { atom, map, computed } from 'nanostores';
import type { Exercise, GroupedExercises, TestStatus, Progress } from '../types';
import { createFetcherStore, mutateCache } from './query-client';

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
// ... (rest of file)

import { callAi } from '../lib/ai-client';
import { $activeContentTab, setActiveContentTab, showPremiumGate } from './ui-store';
import { $user, $isOffline, $localSettings } from './user-store';

export const $isAiLocked = computed([$user, $isOffline, $localSettings], (user, isOffline, settings) => {
  // If Pro, never locked
  if (user?.subscription === 'pro') return false;

  // If has local key for selected provider, never locked
  const provider = settings.aiProvider || 'openai';
  const hasKey = (provider === 'openai' && settings.openaiKey) ||
    (provider === 'anthropic' && settings.anthropicKey) ||
    (provider === 'google' && settings.geminiKey) ||
    (provider === 'xai' && settings.xaiKey);

  if (hasKey) return false;

  // Otherwise, if Free or Offline, it's locked
  return user?.subscription === 'free' || isOffline || !user;
});

export const getAiHint = async () => {
  const selected = $selectedExercise.get();
  const desc = $descriptionQuery.get();
  if (!selected) return;

  if ($isAiLocked.get()) {
    showPremiumGate();
    return;
  }

  $isAiLoading.set(true);
  $aiResponse.set(null);
  try {
    const data = await callAi({
      endpoint: 'hint',
      context: {
        exerciseName: selected.friendlyName || selected.name,
        code: desc.data?.code || '',
        error: $friendlyOutput.get() || $output.get()
      }
    });
    if (data.hint) $aiResponse.set(data.hint);
  } catch (err: any) {
    $aiResponse.set(`Error: ${err.message || 'Failed to get AI hint.'}`);
  } finally {
    $isAiLoading.set(false);
  }
};

export const explainExercise = async () => {
  const selected = $selectedExercise.get();
  const desc = $descriptionQuery.get();
  const currentAi = $aiResponse.get();

  // Guard: Don't generate if already loading or if we already have a full response for this exercise
  if (!selected || $isAiLoading.get() || (currentAi && !currentAi.startsWith('Error:'))) return;

  if ($isAiLocked.get()) {
    showPremiumGate();
    return;
  }

  $isAiLoading.set(true);
  $aiResponse.set(''); // Start with empty string for streaming
  try {
    await callAi({
      endpoint: 'explain',
      context: {
        exerciseName: selected.friendlyName || selected.name,
        instructions: desc.data?.markdown || undefined,
        code: desc.data?.code || '',
      },
      onChunk: (chunk) => {
        const current = $aiResponse.get() || '';
        let newContent = current + chunk;

        // Fallback for JSON wrapper (older backend versions)
        if (newContent.startsWith('{"explanation":"')) {
          newContent = newContent.replace('{"explanation":"', '');
          // Basic unescape for streaming (handle quotes and newlines)
          newContent = newContent.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }

        $aiResponse.set(newContent);

        // Auto-switch to AI tab on first chunk
        if (!current || current === '') {
          setActiveContentTab('ai');
        }
      }
    });

    // Final comprehensive cleanup
    let final = $aiResponse.get() || '';
    if (final.startsWith('{"explanation":"')) {
      final = final.replace('{"explanation":"', '');
    }
    if (final.endsWith('"}')) {
      final = final.substring(0, final.length - 2);
    }

    // Unescape common JSON characters
    final = final
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r');

    $aiResponse.set(final.trim());
    setActiveContentTab('ai');

    // If result tab "description" is active, maybe we want to switch to the new AI tab?
    // We'll handle tab switching in the component if needed.
  } catch (err: any) {
    $aiResponse.set(`Error: ${err.message || 'Failed to get explanation.'}`);
  } finally {
    $isAiLoading.set(false);
  }
};

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
  // Always reset AI state on selection change
  $aiResponse.set(null);
  $isAiLoading.set(false);

  if (!exercise) {
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
  $activeContentTab.set('output');
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

    if (data.success) {
      if (data.progress) {
        mutateCache('/api/progress', data.progress);
      } else {
        fetchProgress();
      }
    }
  } catch (err) {
    $output.set('Failed to run tests.');
    $results.setKey(selected.id, 'fail');
  } finally {
    $isRunning.set(false);
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
