import { atom, map } from 'nanostores';

// ─── Types ──────────────────────────────────────────────────────────────────

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  isExpanded?: boolean;
  title?: string;
  moduleIcon?: string;
  tags?: string[];
  difficulty?: string;
  xp?: number;
};

export type EditorTab = {
  path: string;
  content: string;
  isDirty: boolean;
  type: 'markdown' | 'config' | 'code' | 'quiz' | 'settings';
};

// ─── Atoms ──────────────────────────────────────────────────────────────────

export const $fileTree = atom<FileNode[]>([]);
export const $activeTabPath = atom<string | null>(null);
export const $openTabs = map<Record<string, EditorTab>>({});
export const $isEditorMode = atom<boolean>(false);
export const $isSaving = atom<boolean>(false);

// ─── Helpers ────────────────────────────────────────────────────────────────

function detectFileType(path: string): EditorTab['type'] {
  if (path.endsWith('.md')) return 'markdown';
  if (path.endsWith('quiz.json')) return 'quiz';
  if (path.endsWith('.json') || path.endsWith('.toml')) return 'config';
  return 'code';
}

// ─── Actions ────────────────────────────────────────────────────────────────

export async function loadFileTree(path: string = '.') {
  try {
    const res = await fetch(`/instructor/fs?path=${encodeURIComponent(path)}&type=dir`);
    const data = await res.json();
    if (data.success) {
      $fileTree.set(data.data);
    }
  } catch (e) {
    console.error('[EditorStore] Failed to load file tree:', e);
  }
}

export async function openFile(file: FileNode) {
  const tabs = $openTabs.get();

  if (!tabs[file.path]) {
    try {
      const res = await fetch(`/instructor/fs?path=${encodeURIComponent(file.path)}`);
      const data = await res.json();
      if (data.success) {
        $openTabs.setKey(file.path, {
          path: file.path,
          content: data.content,
          isDirty: false,
          type: detectFileType(file.path),
        });
        $activeTabPath.set(file.path);
      }
    } catch (e) {
      console.error('[EditorStore] Failed to open file:', e);
    }
  } else {
    $activeTabPath.set(file.path);
  }
}

export async function openModuleSettings(path: string, name: string) {
  const tabs = $openTabs.get();
  const settingsPath = (path === '.' || path === '') ? 'course.json' : `${path}/info.toml`;

  if (!tabs[settingsPath]) {
    try {
      const res = await fetch(`/instructor/fs?path=${encodeURIComponent(settingsPath)}`);
      const data = await res.json();
      if (data.success) {
        $openTabs.setKey(settingsPath, {
          path: settingsPath,
          content: data.content,
          isDirty: false,
          type: 'settings',
        });
        $activeTabPath.set(settingsPath);
      }
    } catch (e) {
      // If info.toml doesn't exist, we can't open settings yet? 
      // Or we create it? For now, just log.
      console.error('[EditorStore] Failed to open module settings:', e);
    }
  } else {
    $activeTabPath.set(settingsPath);
  }
}

export function updateTabContent(path: string, content: string) {
  const tabs = $openTabs.get();
  if (tabs[path]) {
    $openTabs.setKey(path, { ...tabs[path], content, isDirty: true });
  }
}

export function closeTab(path: string) {
  const tabs = { ...$openTabs.get() };
  delete tabs[path];
  $openTabs.set(tabs);

  if ($activeTabPath.get() === path) {
    const remaining = Object.keys(tabs);
    $activeTabPath.set(remaining.length > 0 ? remaining[remaining.length - 1]! : null);
  }
}

export async function saveFile(path: string) {
  const tabs = $openTabs.get();
  const tab = tabs[path];
  if (!tab || !tab.isDirty) return;

  $isSaving.set(true);
  try {
    const res = await fetch(`/instructor/fs?path=${encodeURIComponent(path)}`, {
      method: 'PUT',
      body: JSON.stringify({ content: tab.content }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) {
      $openTabs.setKey(path, { ...tab, isDirty: false });
    }
  } catch (e) {
    console.error('[EditorStore] Failed to save file:', e);
  } finally {
    $isSaving.set(false);
  }
}

export async function saveActiveFile() {
  const path = $activeTabPath.get();
  if (path) await saveFile(path);
}

export async function saveAllFiles() {
  const tabs = $openTabs.get();
  const dirtyPaths = Object.keys(tabs).filter(p => tabs[p]?.isDirty);
  for (const path of dirtyPaths) {
    await saveFile(path);
  }
}
