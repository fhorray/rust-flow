import { atom } from 'nanostores';

export type ViewMode = 'editor' | 'map';
export type SidebarTab = 'learning' | 'practice';
export type ContentTab = 'description' | 'output' | 'quiz';

export const $viewMode = atom<ViewMode>('editor');
export const $sidebarTab = atom<SidebarTab>('learning');
export const $activeContentTab = atom<ContentTab>('description');

// Actions
export const setViewMode = (mode: ViewMode) => $viewMode.set(mode);
export const setSidebarTab = (tab: SidebarTab) => $sidebarTab.set(tab);
export const setActiveContentTab = (tab: ContentTab) => $activeContentTab.set(tab);
