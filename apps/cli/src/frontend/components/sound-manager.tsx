import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import useSound from 'use-sound';
import { $isRunning, $results, $selectedExercise } from '../stores/course-store';


export function SoundManager() {
  const isRunning = useStore($isRunning);
  const selectedExercise = useStore($selectedExercise);
  const results = useStore($results);

  // Use refs to track previous state for edge detection
  const wasRunningRef = useRef(false);

  // Load sounds
  const [playSuccess] = useSound('/sounds/success-2.mp3', { volume: 0.4, interrupt: true });
  const [playError] = useSound('/sounds/error.mp3', { volume: 0.4, interrupt: true });

  useEffect(() => {
    // Detect transition from running(true) -> running(false)
    if (wasRunningRef.current && !isRunning) {
      if (selectedExercise) {
        // Check result of the current exercise
        const status = results[selectedExercise.id];

        if (status === 'pass') {
          playSuccess();
        } else if (status === 'fail') {
          playError();
        }
      }
    }

    // Update ref
    wasRunningRef.current = isRunning;
  }, [isRunning, selectedExercise, results, playSuccess, playError]);

  return null; // This component doesn't render anything
}
