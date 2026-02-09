
import React from 'react';
import { useStore } from '@nanostores/react';
import { SkillTree } from '../components/skill-tree';
import {
  $exerciseGroups,
  $results,
  $selectedExercise,
} from '../stores/course-store';
import { $router } from '../stores/router';

export function MapView() {
  const exerciseGroups = useStore($exerciseGroups);
  const results = useStore($results);
  const selectedExercise = useStore($selectedExercise);

  return (
    <div className="w-full h-full bg-zinc-950/50 flex-1">
      <SkillTree
        exerciseGroups={exerciseGroups}
        results={results}
        selectedExerciseId={selectedExercise?.id}
        onSelectExercise={(ex) => {
          $router.open(`/editor/${ex.id}`);
        }}
      />
    </div>
  );
}
