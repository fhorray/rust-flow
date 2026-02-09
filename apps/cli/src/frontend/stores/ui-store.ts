import { atom } from 'nanostores';

export type ContentTab = 'description' | 'output' | 'quiz' | 'ai';

export const $activeContentTab = atom<ContentTab>('description');

export const setActiveContentTab = (tab: ContentTab) => $activeContentTab.set(tab);

