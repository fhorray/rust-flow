
import React from 'react';
import { useStore } from '@nanostores/react';
import { SkillTree } from '../components/skill-tree';
import {
  $exerciseGroups,
  $results,
  $selectedExercise,
  $courseConfig,
  $progress,
} from '../stores/course-store';
import { $router } from '../stores/router';
import { $user } from '../stores/user-store';
import { AchievementModal } from '../components/modals/achievement-modal';

export function MapView() {
  const exerciseGroups = useStore($exerciseGroups);
  const results = useStore($results);
  const selectedExercise = useStore($selectedExercise);
  const config = useStore($courseConfig);
  const progress = useStore($progress);
  const user = useStore($user);

  const [notification, setNotification] = React.useState<{ icon?: string; title: string; message: string } | null>(null);

  const prevAchievementsRef = React.useRef<string[]>([]);
  const prevCompletedModulesRef = React.useRef<string[]>([]);
  const initializedRef = React.useRef(false);

  // Initialize refs to avoid spam on load
  React.useEffect(() => {
    if (progress && !initializedRef.current && Object.keys(exerciseGroups).length > 0) {
      prevAchievementsRef.current = progress.achievements || [];

      const completed: string[] = [];
      Object.keys(exerciseGroups).forEach(modName => {
        const exercises = exerciseGroups[modName] || [];
        if (exercises.length > 0 && exercises.every(ex => results[ex.id] === 'pass')) {
          completed.push(modName);
        }
      });
      prevCompletedModulesRef.current = completed;

      initializedRef.current = true;
    }
  }, [progress, exerciseGroups, results]);

  // Check for updates
  React.useEffect(() => {
    if (!progress || !config || !initializedRef.current) return;

    // 1. Achievements
    const currentAch = progress.achievements || [];
    const newAchIds = currentAch.filter(id => !prevAchievementsRef.current.includes(id));

    if (newAchIds.length > 0) {
      const achDef = config.achievements?.find((a: any) => a.id === newAchIds[0]);
      if (achDef) {
        setNotification({
          icon: achDef.icon,
          title: `Achievement Unlocked: ${achDef.name}`,
          message: achDef.description
        });
      }
      prevAchievementsRef.current = currentAch;
    }

    // 2. Module Completion
    const currentCompletedMods: string[] = [];
    Object.keys(exerciseGroups).forEach(modName => {
      const exercises = exerciseGroups[modName] || [];
      if (exercises.length === 0) return;
      const allPassed = exercises.every(ex => results[ex.id] === 'pass');
      if (allPassed) currentCompletedMods.push(modName);
    });

    const newCompletedMods = currentCompletedMods.filter(m => !prevCompletedModulesRef.current.includes(m));
    if (newCompletedMods.length > 0) {
      const modName = newCompletedMods[0]!;
      const ex = exerciseGroups[modName]?.[0];

      if (ex?.completionMessage) {
        const msg = ex.completionMessage.replace(/{{user.name}}/g, user?.name || 'Student');
        setNotification({
          icon: ex.moduleIcon || 'CheckCircle',
          title: `Module Completed: ${ex.moduleTitle || modName}`,
          message: msg
        });
      }
      prevCompletedModulesRef.current = currentCompletedMods;
    }
  }, [progress, config, exerciseGroups, results, user]);

  return (
    <div className="w-full h-full bg-zinc-950 flex-1 overflow-auto">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rust via-amber-400 to-rust bg-clip-text text-transparent">
            Progress Map
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Visualize your learning journey and conquer new skills
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 md:p-6 shadow-2xl">
          <SkillTree
            exerciseGroups={exerciseGroups}
            results={results}
            selectedExerciseId={selectedExercise?.id}
            onSelectExercise={(ex) => {
              $router.open(`/studio/${ex.id}`);
            }}
            config={config}
          />
        </div>
      </div>

      {notification && (
        <AchievementModal
          isOpen={!!notification}
          onClose={() => setNotification(null)}
          icon={notification.icon}
          title={notification.title}
          message={notification.message}
        />
      )}
    </div>
  );
}
