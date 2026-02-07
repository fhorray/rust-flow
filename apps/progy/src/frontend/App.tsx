import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Loader2 } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

// Components
import { Sidebar } from './components/sidebar';
import { ExerciseCard } from './components/exercise-card';
import { ContentTabs } from './components/content-tabs';

import { ChallengeDisplay } from './components/challenge-display';
import { SetupView } from './components/setup-view';
import { SkillTree } from './components/skill-tree';

// Stores & Actions
import {
  $selectedExercise,
  $exerciseGroups,
  $exerciseGroupsQuery,
  $results,
  $progress,
  $setupReady,
  $error,
  $isRunning,
  $isAiLoading,
  $output,
  fetchExercises,
  fetchProgress,
  runTests,
  getAiHint,
  setSelectedExercise,
} from './stores/course-store';
import { $viewMode, setViewMode } from './stores/ui-store';
import { ChallengeGenerator } from './components/challenge-generator';
import { Navbar } from './components/navbar';
import { UserNav } from './components/user-nav';
import { fetchLocalSettings } from './stores/user-store';

export function App() {
  // ...
  useEffect(() => {
    fetchLocalSettings();
  }, []);
  const selectedExercise = useStore($selectedExercise);
  const exerciseGroups = useStore($exerciseGroups);
  const exerciseGroupsQuery = useStore($exerciseGroupsQuery);
  const results = useStore($results);
  const setupReady = useStore($setupReady);
  const error = useStore($error);
  const isRunning = useStore($isRunning);
  const isAiLoading = useStore($isAiLoading);
  const output = useStore($output);
  const viewMode = useStore($viewMode);

  const [showChallengeGenerator, setShowChallengeGenerator] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<any>(null);

  // Initial setup check
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch('/api/setup/status');
        const data = await res.json();
        $setupReady.set(data.success);
      } catch (e) {
        $setupReady.set(false);
      }
    };
    checkSetup();
  }, []);

  // Auto-select first exercise when groups are loaded
  useEffect(() => {
    if (Object.keys(exerciseGroups).length > 0 && !selectedExercise) {
      const modules = Object.keys(exerciseGroups);
      const firstModKey = modules[0];
      if (firstModKey) {
        const exercises = exerciseGroups[firstModKey];
        if (Array.isArray(exercises) && exercises.length > 0) {
          setSelectedExercise(exercises[0] || null);
        }
      }
    }
  }, [exerciseGroups, selectedExercise]);

  if (setupReady === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rust animate-spin" />
      </div>
    );
  }

  if (setupReady === false) {
    return <SetupView onCheckComplete={() => $setupReady.set(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100 flex flex-col font-sans selection:bg-rust/30">
      <Navbar onGenerateChallenge={() => setShowChallengeGenerator(true)} />

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center text-xs text-red-400">
          {error}
        </div>
      )}

      <main
        className={`flex-1 w-full overflow-hidden ${viewMode === 'map' ? '' : 'container mx-auto py-6'}`}
      >
        {viewMode === 'map' ? (
          <div className="w-full h-full bg-zinc-950/50">
            <SkillTree
              exerciseGroups={exerciseGroups}
              results={results}
              selectedExerciseId={selectedExercise?.id}
              onSelectExercise={(ex) => {
                setSelectedExercise(ex as any);
                setViewMode('editor');
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            <Sidebar />

            <section className="lg:col-span-9 flex flex-col gap-4 h-full min-h-0">
              <ExerciseCard
                isRunning={isRunning}
                isAiLoading={isAiLoading}
                hasOutput={!!output}
                onRunTests={runTests}
                onGetAiHint={getAiHint}
              />
              <ContentTabs />
            </section>
          </div>
        )}
      </main>

      {showChallengeGenerator && (
        <ChallengeGenerator
          onClose={() => setShowChallengeGenerator(false)}
          onChallengeGenerated={(challenge) => {
            setGeneratedChallenge(challenge);
            setShowChallengeGenerator(false);
            setSelectedExercise(null);
          }}
        />
      )}

      {generatedChallenge && !selectedExercise && (
        <ChallengeDisplay
          challenge={generatedChallenge}
          onClose={() => setGeneratedChallenge(null)}
        />
      )}
    </div>
  );
}
