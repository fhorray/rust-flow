import { atom, map, computed } from 'nanostores';
import type { Exercise, GroupedExercises, TestStatus, Progress } from '../types';
import { createFetcherStore, mutateCache } from './query-client';

// --- State Queries ---

export const $exerciseGroupsQuery = createFetcherStore<GroupedExercises>(['/exercises']);
export const $progressQuery = createFetcherStore<Progress>(['/progress']);

// Persist selected exercise to localStorage so it survives refreshes
export const $selectedExercise = persistentAtom<Exercise | null>('progy:selectedExercise', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Persist the expanded module in the sidebar
export const $expandedModule = persistentAtom<string | undefined>('progy:expandedModule', undefined);

// Reactive chain for exercise details (Description)
export const $descriptionQuery = createFetcherStore<{ code: string; markdown: string }>([
  '/exercises/code?path=',
  computed($selectedExercise, (ex) => ex?.path || null),
  '&markdownPath=',
  computed($selectedExercise, (ex) => ex?.markdownPath || null),
]);

// Reactive chain for quizzes
export const $quizQuery = createFetcherStore<any>([
  '/exercises/quiz?path=',
  computed($selectedExercise, (ex) => (ex?.hasQuiz ? ex.path : null)),
]);


// --- State Atoms (Local/UI) ---

/**
 * Computed property that returns the exercise groups.
 * @returns {GroupedExercises} The exercise groups.
 */
export const $results = map<Record<string, TestStatus>>({});

/**
 * Computed property that returns the setup ready state.
 * @returns {boolean | null} The setup ready state.
 */
export const $setupReady = atom<boolean | null>(null);

/**
 * Computed property that returns the error state.
 * @returns {string | null} The error state.
 */
export const $error = atom<string | null>(null);

/**
 * Computed property that returns the output state.
 * @returns {string} The output state.
 */
export const $output = atom<string>('');

/**
 * Computed property that returns the friendly output state.
 * @returns {string} The friendly output state.
 */
export const $friendlyOutput = atom<string>('');

/**
 * Computed property that returns the is running state.
 * @returns {boolean} The is running state.
 */
export const $isRunning = atom<boolean>(false);

/**
 * Computed property that returns the is AI loading state.
 * @returns {boolean} The is AI loading state.
 */
export const $isAiLoading = atom<boolean>(false);

/**
 * Computed property that returns the AI response state.
 * @returns {string | null} The AI response state.
 */
export const $aiResponse = atom<string | null>(null);

/**
 * Computed property that returns the show friendly state.
 * @returns {boolean} The show friendly state.
 */
export const $showFriendly = atom<boolean>(true);

// --- Computed Proxies (to maintain component compatibility) ---
import { callAi } from '../lib/ai-client';
import { $activeContentTab, setActiveContentTab } from './ui-store';
import { $user, $isOffline, $localSettings } from './user-store';
import { persistentAtom } from '@nanostores/persistent';

/**
 * Computed property that determines if AI features are locked.
 * 
 * @returns {boolean} True if AI features are locked, false otherwise.
 */
export const $isAiLocked = computed([$user, $isOffline, $localSettings], (user, isOffline, settings) => {
  // If Pro, never locked (includes AI access)
  if (user?.subscription === null || user?.subscription === '') return false;
  if (user?.subscription === 'pro') return false;

  // Check for API keys
  const hasKey = (settings.aiProvider === 'openai' && settings.openaiKey) ||
    (settings.aiProvider === 'anthropic' && settings.anthropicKey) ||
    (settings.aiProvider === 'google' && settings.geminiKey) ||
    (settings.aiProvider === 'xai' && settings.xaiKey) ||
    // Fallback if provider not set but key exists (legacy behavior robustness)
    (!settings.aiProvider && (settings.openaiKey || settings.anthropicKey || settings.geminiKey || settings.xaiKey));

  // Determine if user has Lifetime access
  const hasLifetime = user?.hasLifetime || user?.subscription === 'lifetime';

  // If user has Lifetime access, they MUST provide a key to unlock AI
  // Logic: Lifetime + Key = Unlocked
  if (hasLifetime && hasKey) return false;

  // Otherwise, if Free, Offline, or Lifetime-without-key, it's locked
  return true;
});

/**
 * Computes the AI interaction history.
 */
export type AiInteraction = {
  id: string;
  type: 'hint' | 'explain';
  content: string;
  timestamp: number;
  exerciseId: string;
};

export const $aiHistory = persistentAtom<AiInteraction[]>('progy:aiHistory', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * Gets an AI hint for the currently selected exercise.
 * @returns {Promise<void>} 
 */
export const getAiHint = async () => {
  const selected = $selectedExercise.get();
  const desc = $descriptionQuery.get();
  if (!selected) return;

  if ($isAiLocked.get()) {
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

    if (data.hint) {
      $aiResponse.set(data.hint);
      // Add to history
      const newInteraction: AiInteraction = {
        id: crypto.randomUUID(),
        type: 'hint',
        content: data.hint,
        timestamp: Date.now(),
        exerciseId: selected.id
      };
      $aiHistory.set([...$aiHistory.get(), newInteraction]);

      // Background Sync to GitHub
      syncAiToGithub(selected, 'hint', data.hint).catch(console.error);
    }
  } catch (err: any) {
    $aiResponse.set(`Error: ${err.message || 'Failed to get AI hint.'}`);
  } finally {
    $isAiLoading.set(false);
  }
};

/**
 * Explains the currently selected exercise using AI.
 * @returns {Promise<void>} 
 */
export const explainExercise = async () => {
  const selected = $selectedExercise.get();
  const desc = $descriptionQuery.get();
  const currentAi = $aiResponse.get();

  // Guard: Don't generate if already loading or if we already have a full response for this exercise
  if (!selected || $isAiLoading.get() || (currentAi && !currentAi.startsWith('Error:'))) return;

  if ($isAiLocked.get()) {
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

    final = final.trim();
    $aiResponse.set(final);
    setActiveContentTab('ai');

    // Add to history
    const newInteraction: AiInteraction = {
      id: crypto.randomUUID(),
      type: 'explain',
      content: final,
      timestamp: Date.now(),
      exerciseId: selected.id
    };
    $aiHistory.set([...$aiHistory.get(), newInteraction]);

    // Background Sync to GitHub
    syncAiToGithub(selected, 'explanation', final).catch(console.error);

  } catch (err: any) {
    $aiResponse.set(`Error: ${err.message || 'Failed to get explanation.'}`);
  } finally {
    $isAiLoading.set(false);
  }
};

/**
 * Syncs AI content to GitHub by saving a file and pushing it.
 */
async function syncAiToGithub(exercise: Exercise, type: 'hint' | 'explanation', content: string) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `progy-notes/${exercise.module}/${exercise.id}-${type}-${timestamp}.md`;

    const fileContent = `# AI ${type === 'hint' ? 'Hint' : 'Explanation'} - ${exercise.exerciseName}\n\n${content}`;

    // 1. Save File
    const saveRes = await fetch('/notes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filename, content: fileContent })
    });
    if (!saveRes.ok) throw new Error('Failed to save note');

    // 2. Commit
    const commitRes = await fetch('/local/git/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `docs: save AI ${type} for ${exercise.exerciseName}` })
    });
    if (!commitRes.ok) throw new Error('Failed to commit note');

    // 3. Sync (Push)
    const syncRes = await fetch('/local/git/sync', {
      method: 'POST'
    });
    if (!syncRes.ok) throw new Error('Failed to push note');

    console.log('[AI] Synced to GitHub:', filename);
  } catch (err) {
    console.error('[AI] GitHub Sync failed:', err);
  }
}

/**
 * Computed property that returns the exercise groups.
 * @returns {Record<string, Exercise[]>} The exercise groups.
 */
export const $exerciseGroups = computed($exerciseGroupsQuery, (q) => q.data || {});
/**
 * Computed property that returns the progress.
 * @returns {Progress | null} The progress.
 */
export const $progress = computed($progressQuery, (q) => q.data || null);
/**
 * Computed property that returns the description.
 * @returns {string | null} The description.
 */
export const $description = computed($descriptionQuery, (q) => q.data?.markdown || null);
/**
 * Computed property that returns the quiz data.
 * @returns {any | null} The quiz data.
 */
export const $quizData = computed($quizQuery, (q) => q.data || null);

/**
 * Computed property that returns the total number of exercises.
 * @returns {number} The total number of exercises.
 */
export const $totalExercises = computed($exerciseGroups, (groups) =>
  Object.values(groups).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0)
);

/**
 * Computed property that returns the number of completed exercises.
 * @returns {number} The number of completed exercises.
 */
export const $completedCount = computed($results, (results) =>
  Object.values(results).filter(s => s === 'pass').length
);

/**
 * Computed property that returns the progress percentage.
 * @returns {number} The progress percentage.
 */
export const $progressPercent = computed([$totalExercises, $completedCount], (total, completed) =>
  total > 0 ? Math.round((completed / total) * 100) : 0
);


// ======================================//
//          --- Basic Setters ---        //
// ======================================//

/**
 * Sets the setup ready state.
 * @param {boolean | null} ready - The setup ready state.
 */
export const setSetupReady = (ready: boolean | null) => $setupReady.set(ready);
/**
 * Sets the error state.
 * @param {string | null} err - The error state.
 */
export const setError = (err: string | null) => $error.set(err);
/**
 * Sets the friendly output state.
 * @param {boolean} show - The friendly output state.
 */
export const setShowFriendly = (show: boolean) => $showFriendly.set(show);
/**
 * Sets the results state.
 * @param {Record<string, TestStatus>} results - The results state.
 */
export const setResults = (results: Record<string, TestStatus>) => $results.set(results);

// --- Actions & Queries ---

/**
 * Sets the selected exercise.
 * @param {Exercise | null} exercise - The exercise to set.
 */
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

/**
 * Fetches the exercises.
 */
export const fetchExercises = () => $exerciseGroupsQuery.revalidate();
/**
 * Fetches the progress.
 */
export const fetchProgress = () => $progressQuery.revalidate();

/**
 * Runs the tests for the currently selected exercise.
 */
export const runTests = async () => {
  const selected = $selectedExercise.get();
  if (!selected) return;

  $isRunning.set(true);
  $activeContentTab.set('output');
  try {
    const res = await fetch('/exercises/run', {
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
        mutateCache('/progress', data.progress);
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


/**
 * Syncs the results with the progress.
 */
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

/**
 * Syncs the expanded module with the selected exercise.
 */
$selectedExercise.subscribe(exercise => {
  if (exercise && exercise.module) {
    $expandedModule.set(exercise.module);
  }
});
