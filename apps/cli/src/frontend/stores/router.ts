
import { createRouter } from '@nanostores/router';

export const $router = createRouter({
  home: '/',
  editor: '/editor',
  editorModule: '/editor/:moduleId',
  editorExercise: '/editor/:moduleId/:exerciseId',
  map: '/map',
  git: '/git',
});
