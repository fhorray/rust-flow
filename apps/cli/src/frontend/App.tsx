import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Loader2 } from 'lucide-react';

// Views
import { MapView } from './views/map-view';
import { EditorView } from './views/editor-view';
import { GitView } from './views/git-view';

// Stores & Actions
import {
  $selectedExercise,
  $exerciseGroups,
  $error,
  setSelectedExercise,
} from './stores/course-store';
import { $router } from './stores/router';
import { ChallengeGenerator } from './components/modals/challenge-generator-modal';
import { Navbar } from './components/navbar';
import { fetchLocalSettings } from './stores/user-store';
import { SecurityBanner } from './components/security-banner';
import { cn } from './lib/utils';

export function App() {
  // Initial settings load
  useEffect(() => {
    fetchLocalSettings();
  }, []);

  const selectedExercise = useStore($selectedExercise);
  const exerciseGroups = useStore($exerciseGroups);
  const error = useStore($error);
  const router = useStore($router);

  // Router-based rendering
  console.log('[App] Current Route:', router?.route);
  if (router?.route === 'editor') {
    console.log('[App] Params:', router.params);
  }

  let content;
  if (!router) {
    return <span>404 - Not found!</span>;
  } else if (router.route === 'home' || router.route === 'editor') {
    content = <EditorView />;
  } else if (router.route === 'editorModule') {
    content = <EditorView moduleId={router.params.moduleId} />;
  } else if (router.route === 'editorExercise') {
    content = (
      <EditorView
        exerciseId={router.params.exerciseId}
        moduleId={router.params.moduleId}
      />
    );
  } else if (router.route === 'git') {
    content = <GitView />;
  } else if (router.route === 'map') {
    content = <MapView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100 flex flex-col font-sans selection:bg-rust/30">
      {/* SECURITY BNANNER */}
      <SecurityBanner />
      <Navbar />

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center text-xs text-red-400">
          {error}
        </div>
      )}

      <main
        className={cn('flex-1 w-full overflow-hidden flex', {
          // TODO
        })}
      >
        {content}
      </main>
    </div>
  );
}
