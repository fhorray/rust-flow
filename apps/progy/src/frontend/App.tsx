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
import { PremiumGateModal } from './components/premium-gate-modal';

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
  explainExercise,
  getAiHint,
  setSelectedExercise,
} from './stores/course-store';
import { $viewMode, setViewMode, $isPremiumGateOpen } from './stores/ui-store';
import { ChallengeGenerator } from './components/challenge-generator';
import { Navbar } from './components/navbar';
import { UserNav } from './components/user-nav';
import { fetchLocalSettings } from './stores/user-store';
import { SecurityBanner } from './components/security-banner';
import { GitPanel } from './components/git-panel';

export function App() {
  // Initial settings load
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
  const isPremiumGateOpen = useStore($isPremiumGateOpen);

  const [showChallengeGenerator, setShowChallengeGenerator] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<any>(null);

  // ... (existing effects)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100 flex flex-col font-sans selection:bg-rust/30">
      <SecurityBanner />
      <Navbar
        onGenerateChallenge={() => setShowChallengeGenerator(true)}
      />

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center text-xs text-red-400">
          {error}
        </div>
      )}

      <main
        className={`flex-1 w-full overflow-hidden flex ${viewMode === 'editor' ? 'container mx-auto py-6' : ''}`}
      >
        {viewMode === 'map' ? (
          // ... (map view)
          <div className="w-full h-full bg-zinc-950/50 flex-1">
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
        ) : viewMode === 'git' ? (
          <div className="w-full h-full bg-zinc-950/50 flex-1 flex flex-col items-center justify-center p-8">
            <div className="container mx-auto h-full max-h-[800px]">
              <GitPanel />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] flex-1">
            <Sidebar />

            <section className="lg:col-span-9 flex flex-col gap-4 h-full min-h-0">
              <ExerciseCard
                isRunning={isRunning}
                isAiLoading={isAiLoading}
                hasOutput={!!output}
                onRunTests={runTests}
                onExplain={explainExercise}
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

      <PremiumGateModal />
    </div>
  );
}
