import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import {
  $activeTabPath,
  $openTabs,
  $isSaving,
  saveActiveFile,
  saveAllFiles,
  closeTab,
  updateTabContent,
  loadFileTree,
  openModuleSettings,
  $courseConfig,
  openIDESettings,
} from '../../stores/editor-store';
import { FileTree } from './FileTree';
import { MarkdownEditor } from './MarkdownEditor';
import { MonacoEditor } from './MonacoEditor';
import { ConfigForm } from './ConfigForm';
import { QuizEditor } from './quiz-editor/QuizEditor';
import { GraphView } from './GraphView';
import { ModuleSettings } from './ModuleSettings';
import { CourseSettings } from './CourseSettings';
import { IDESettings } from './IDESettings';
import {
  X,
  Save,
  Pencil,
  CheckCircle,
  AlertTriangle,
  Shield,
  PanelLeftClose,
  PanelLeft,
  Network,
  Settings,
  Terminal,
  PlayIcon,
} from 'lucide-react';
import { TerminalPanel } from './TerminalPanel';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@progy/ui/resizable';
import { CommandPalette } from './CommandPalette';

// ─── Tiptap Editor Styles (injected once) ───────────────────────────────────

const TIPTAP_STYLES = `
.ProseMirror {
  outline: none;
  min-height: 400px;
  color: #d4d4d8;
  font-size: 14px;
  line-height: 1.75;
}
.ProseMirror > * + * {
  margin-top: 0.75em;
}

/* ─── Headings (match student renderer) ─── */
.ProseMirror h1 {
  font-size: 1.875rem;
  font-weight: 900;
  color: #ffffff;
  margin-top: 2.5em;
  margin-bottom: 1em;
  letter-spacing: -0.02em;
}
.ProseMirror h1:first-child {
  margin-top: 0;
}
.ProseMirror h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f4f4f5;
  margin-top: 2em;
  margin-bottom: 0.8em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid rgba(63, 63, 70, 0.5);
  letter-spacing: -0.02em;
}
.ProseMirror h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f4f4f5;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  letter-spacing: -0.02em;
}
.ProseMirror h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #e4e4e7;
  margin-top: 1em;
  margin-bottom: 0.4em;
}

/* ─── Text ─── */
.ProseMirror p {
  margin: 0.8em 0;
  line-height: 1.75;
}
.ProseMirror strong {
  font-weight: 700;
  color: #f0abfc;
}
.ProseMirror em {
  font-style: italic;
  color: #a1a1aa;
}

/* ─── Links ─── */
.ProseMirror a {
  color: #f97316;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(249, 115, 22, 0.3);
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, text-decoration-color 0.15s;
}
.ProseMirror a:hover {
  color: #fb923c;
  text-decoration-color: #f97316;
}

/* ─── Inline code ─── */
.ProseMirror code {
  background: rgba(63, 63, 70, 0.5);
  border: 1px solid rgba(63, 63, 70, 0.3);
  border-radius: 5px;
  padding: 2px 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  color: #f0abfc;
  white-space: nowrap;
}

/* ─── Code blocks ─── */
.ProseMirror pre {
  background: rgba(9, 9, 11, 0.8);
  border: 1px solid rgba(63, 63, 70, 0.5);
  border-radius: 8px;
  padding: 16px 20px;
  margin: 1.5em 0;
  overflow-x: auto;
}
.ProseMirror pre code {
  background: none;
  border: none;
  padding: 0;
  color: #e4e4e7;
  font-size: 13px;
  white-space: pre;
  line-height: 1.6;
}

/* ─── Blockquote ─── */
.ProseMirror blockquote {
  border-left: 4px solid #f97316;
  background: rgba(249, 115, 22, 0.05);
  padding: 12px 16px 12px 20px;
  margin: 1.5em 0;
  border-radius: 0 12px 12px 0;
  color: #a1a1aa;
  font-style: italic;
  line-height: 1.7;
}
.ProseMirror blockquote p {
  margin: 0.3em 0;
}

/* ─── Lists ─── */
.ProseMirror ul {
  list-style: disc;
  padding-left: 24px;
  margin: 1em 0;
}
.ProseMirror ol {
  list-style: decimal;
  padding-left: 24px;
  margin: 1em 0;
}
.ProseMirror li {
  margin: 0.4em 0;
  padding-left: 4px;
  color: #d4d4d8;
}
.ProseMirror li p {
  margin: 0.2em 0;
}
.ProseMirror li > ul,
.ProseMirror li > ol {
  margin: 0.3em 0;
}

/* ─── Horizontal Rule ─── */
.ProseMirror hr {
  border: none;
  border-top: 1px solid rgba(63, 63, 70, 0.5);
  margin: 2.5em 0;
}

/* ─── Tables ─── */
.ProseMirror table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 0.875em;
}
.ProseMirror th {
  background: rgba(63, 63, 70, 0.4);
  padding: 10px 16px;
  font-weight: 700;
  color: #f4f4f5;
  text-transform: uppercase;
  font-size: 0.75em;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(63, 63, 70, 0.8);
}
.ProseMirror td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(63, 63, 70, 0.3);
  color: #a1a1aa;
}

/* ─── Images ─── */
.ProseMirror img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}

/* ─── Task Lists ─── */
.ProseMirror ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}
.ProseMirror ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* ─── Placeholder ─── */
.ProseMirror p.is-editor-empty:first-child::before {
  color: #52525b;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
`;

// ─── Mode Switcher ──────────────────────────────────────────────────────────

function ModeSwitcher() {
  return (
    <div className="flex items-center bg-zinc-800/60 rounded-md p-0.5">
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-600/80 text-orange-100 text-[11px] font-medium">
        <Pencil size={11} />
        Editor
      </span>
    </div>
  );
}

// ─── Tab Bar ────────────────────────────────────────────────────────────────

function TabBar() {
  const activePath = useStore($activeTabPath);
  const openTabs = useStore($openTabs);
  const tabEntries = Object.values(openTabs);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
  } | null>(null);

  if (tabEntries.length === 0) return null;

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const closeOthers = (path: string) => {
    Object.values(openTabs).forEach((t) => {
      if (t.path !== path) closeTab(t.path);
    });
    setContextMenu(null);
  };

  const closeAll = () => {
    Object.values(openTabs).forEach((t) => closeTab(t.path));
    setContextMenu(null);
  };

  return (
    <>
      <div className="flex items-center border-b border-zinc-800/80 bg-zinc-900/50 overflow-x-auto no-scrollbar">
        {tabEntries.map((tab) => {
          const isActive = tab.path === activePath;
          const label =
            tab.type === 'settings'
              ? tab.path === 'course.json'
                ? 'Course Settings'
                : 'Module Settings'
              : tab.path.split('/').pop() || tab.path;

          return (
            <div
              key={tab.path}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-zinc-800/50 shrink-0 transition-colors ${isActive
                ? 'bg-zinc-800/60 text-zinc-100 border-b-2 border-b-orange-500'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border-b-2 border-b-transparent'
                }`}
              onClick={() => $activeTabPath.set(tab.path)}
              onContextMenu={(e) => handleContextMenu(e, tab.path)}
            >
              <span className="flex items-center gap-1.5">
                {tab.type === 'settings' && (
                  <Settings size={12} className="text-orange-500" />
                )}
                {label}
                {tab.isDirty && <span className="text-amber-400 ml-1">●</span>}
              </span>
              <button
                className="ml-1 p-0.5 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.path);
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
              onClick={() => closeTab(contextMenu.path)}
            >
              Close
            </button>
            <button
              className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
              onClick={() => closeOthers(contextMenu.path)}
            >
              Close Others
            </button>
            <button
              className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
              onClick={() => closeAll()}
            >
              Close All
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ─── EditorLayout ───────────────────────────────────────────────────────────

export function EditorLayout() {
  const activePath = useStore($activeTabPath);
  const openTabs = useStore($openTabs);
  const courseConfig = useStore($courseConfig);
  const isSaving = useStore($isSaving);
  const activeTab = activePath ? openTabs[activePath] : null;
  const [validating, setValidating] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message?: string;
    errors?: string[];
  } | null>(null);

  // Compute line count for active tab
  const lineCount = activeTab ? activeTab.content.split('\n').length : 0;
  const hasDirtyTabs = Object.values(openTabs).some((t) => t.isDirty);

  useEffect(() => {
    loadFileTree();
  }, []);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasDirtyTabs) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasDirtyTabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+E — toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Ctrl+S — save active file
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        saveActiveFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await fetch('/instructor/validate', { method: 'POST' });
      const data = await res.json();
      setValidationResult(data);
      if (data.success) {
        setTimeout(() => setValidationResult(null), 4000);
      }
    } catch (e: any) {
      setValidationResult({ success: false, errors: [e.message] });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
      <CommandPalette />
      {/* Inject Tiptap styles */}
      <style dangerouslySetInnerHTML={{ __html: TIPTAP_STYLES }} />

      {/* Header */}
      <header className="h-11 border-b border-zinc-800/80 flex items-center px-4 bg-zinc-950 shrink-0">
        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="p-1 mr-2 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title={
            sidebarCollapsed
              ? 'Show sidebar (Ctrl+Shift+E)'
              : 'Hide sidebar (Ctrl+Shift+E)'
          }
        >
          {sidebarCollapsed ? (
            <PanelLeft size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
        <span className="font-bold text-sm tracking-tight mr-4 flex items-center gap-2">
          <Terminal className="text-orange-500 w-4 h-4" />
          <span className="text-orange-500">Progy</span>{' '}
          <span className="text-zinc-400">Studio</span>
        </span>

        <ModeSwitcher />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={openIDESettings}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded text-xs font-medium transition-colors"
            title="Edit IDE Settings (API Keys, etc)"
          >
            <Settings size={12} className="text-blue-500" />
            Studio Settings
          </button>

          <button
            onClick={() => setShowGraph(!showGraph)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${showGraph
              ? 'bg-orange-600 hover:bg-orange-500 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
              }`}
            title="Course Dependency Graph"
          >
            <Network size={12} />
            {showGraph ? 'Close Flow' : 'Flow'}
          </button>

          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${showTerminal
              ? 'bg-zinc-800 text-white border border-orange-500/50'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
              }`}
          >
            <Terminal size={12} />
            Terminal
          </button>

          <button
            onClick={handleValidate}
            disabled={validating}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded text-xs font-medium transition-colors disabled:opacity-50"
            title="Validate course structure"
          >
            <Shield size={12} />
            {validating ? 'Validating...' : 'Validate'}
          </button>
          <button
            onClick={saveAllFiles}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            {isSaving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </header>

      {/* Main Layout — resizable panels */}
      <div className="flex-1 overflow-hidden">
        {showGraph ? (
          <GraphView />
        ) : (
          <ResizablePanelGroup orientation="horizontal">
            {/* Sidebar */}
            {!sidebarCollapsed && (
              <>
                <ResizablePanel defaultSize="18%" minSize="12%" maxSize="35%">
                  <div className="h-full bg-zinc-900/50 border-r border-zinc-800/80 overflow-hidden">
                    <FileTree />
                  </div>
                </ResizablePanel>
                <ResizableHandle className="w-1 bg-transparent hover:bg-orange-500/30 active:bg-orange-500/50 transition-colors cursor-col-resize" />
              </>
            )}

            {/* Editor Area */}
            <ResizablePanel>
              <div className="h-full flex flex-col min-w-0 overflow-hidden">
                <TabBar />
                <div className="flex-1 overflow-auto bg-zinc-900/30">
                  {activeTab ? (
                    activeTab.type === 'markdown' ? (
                      <MarkdownEditor
                        key={activeTab.path}
                        initialContent={activeTab.content}
                        path={activeTab.path}
                      />
                    ) : activeTab.type === 'quiz' ? (
                      <QuizEditor
                        key={activeTab.path}
                        initialContent={activeTab.content}
                        path={activeTab.path}
                      />
                    ) : activeTab.type === 'settings' ? (
                      activeTab.path === 'course.json' ? (
                        <CourseSettings key={activeTab.path} tab={activeTab} />
                      ) : (
                        <ModuleSettings key={activeTab.path} tab={activeTab} />
                      )
                    ) : activeTab.type === 'ide-settings' ? (
                      <IDESettings key="ide-settings" />
                    ) : (
                      <MonacoEditor
                        key={activeTab.path}
                        initialContent={activeTab.content}
                        path={activeTab.path}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-lg">
                        <Terminal className="w-8 h-8 text-zinc-700" />
                      </div>
                      <p className="text-sm">
                        Select a file from the explorer to start editing
                      </p>
                      <p className="text-xs text-zinc-700">
                        or press{' '}
                        <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
                          Cmd+K
                        </kbd>{' '}
                        to search
                      </p>
                    </div>
                  )}
                </div>

                {showTerminal && (
                  <TerminalPanel
                    onClose={() => setShowTerminal(false)}
                    canRun={
                      !!activePath &&
                      !!activePath.match(
                        /exercise\.(rs|ts|py|js|sql|go)$|main\.(rs|py|go)$|index\.(ts|js|js)$/i,
                      )
                    }
                    runCommand={(() => {
                      if (!courseConfig) return undefined;

                      try {
                        let cmd =
                          courseConfig?.runner?.command ||
                          courseConfig?.runner?.testCommand ||
                          'npm test';

                        // If it's an exercise file, handle placeholders
                        if (
                          activePath &&
                          activePath.match(
                            /exercise\.(rs|ts|py|js|sql|go)$|main\.(rs|py|go)$|index\.(ts|js|js)$/i,
                          )
                        ) {
                          const parts = activePath.split('/');
                          const exercisesDir =
                            courseConfig?.content?.exercises || 'content';
                          const exIdx = parts.indexOf(exercisesDir);

                          if (exIdx !== -1 && parts.length > exIdx + 1) {
                            // Full path from course root: content/01_mod/01_ex/file.rs
                            const fullExPath = parts.slice(exIdx).join('/');
                            // Just the exercise folder name
                            const exerciseFolder =
                              parts[exIdx + 2] || parts[exIdx + 1];

                            if (fullExPath) {
                              cmd = cmd.replace(
                                /{{exercise}}|{{id}}/g,
                                fullExPath,
                              );
                            }
                            if (exerciseFolder) {
                              cmd = cmd.replace(/{{name}}/g, exerciseFolder);
                            }
                          }
                        }
                        return cmd;
                      } catch {
                        return undefined;
                      }
                    })()}
                  />
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Status Bar */}
      <footer className="h-6 border-t border-zinc-800/80 flex items-center px-4 bg-zinc-900/50 shrink-0 text-[11px] text-zinc-500 gap-4">
        {activeTab ? (
          <>
            <span className="truncate max-w-[40%] font-mono">
              {activeTab.path}
            </span>
            <span>Ln {lineCount}</span>
            <span className="uppercase">{activeTab.type}</span>
            {activeTab.isDirty && (
              <span className="text-amber-400 font-medium">● Modified</span>
            )}
          </>
        ) : (
          <span>No file open</span>
        )}
        <span className="ml-auto text-zinc-600">
          Ctrl+Shift+E sidebar · Ctrl+S save
        </span>
      </footer>

      {/* Validation Results Toast */}
      {validationResult && (
        <div
          className={`fixed bottom-10 right-6 z-50 max-w-md rounded-xl border shadow-2xl p-4 ${validationResult.success
            ? 'bg-emerald-950/90 border-emerald-700/50'
            : 'bg-red-950/90 border-red-700/50'
            }`}
        >
          <div className="flex items-start gap-3">
            {validationResult.success ? (
              <CheckCircle
                size={18}
                className="text-emerald-400 shrink-0 mt-0.5"
              />
            ) : (
              <AlertTriangle
                size={18}
                className="text-red-400 shrink-0 mt-0.5"
              />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${validationResult.success ? 'text-emerald-300' : 'text-red-300'
                  }`}
              >
                {validationResult.success
                  ? 'Validation Passed!'
                  : 'Validation Failed'}
              </p>
              {validationResult.success && validationResult.message && (
                <p className="text-xs text-emerald-400/70 mt-1">
                  {validationResult.message}
                </p>
              )}
              {validationResult.errors &&
                validationResult.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validationResult.errors.map((err, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-300/80 leading-relaxed"
                      >
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <button
              onClick={() => setValidationResult(null)}
              className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
