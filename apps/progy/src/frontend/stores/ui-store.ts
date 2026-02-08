import { atom } from 'nanostores';

export type ViewMode = 'editor' | 'map' | 'git';
export type SidebarTab = 'learning' | 'practice';
export type ContentTab = 'description' | 'output' | 'quiz' | 'ai';

export const $viewMode = atom<ViewMode>('editor');
export const $sidebarTab = atom<SidebarTab>('learning');
export const $activeContentTab = atom<ContentTab>('description');
export const $isPremiumGateOpen = atom<boolean>(false);

// Actions
export const setViewMode = (mode: ViewMode) => $viewMode.set(mode);
export const setSidebarTab = (tab: SidebarTab) => $sidebarTab.set(tab);
export const setActiveContentTab = (tab: ContentTab) => $activeContentTab.set(tab);
export const showPremiumGate = () => $isPremiumGateOpen.set(true);
export const closePremiumGate = () => $isPremiumGateOpen.set(false);
