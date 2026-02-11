import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder, FolderOpen, File, ChevronRight, ChevronDown,
  FolderPlus, BookPlus, Trash2, Search, Settings,
  Edit, FileCode, FileJson, BookOpen, Terminal, Code2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { openFile, loadFileTree, type FileNode, $fileTree, openModuleSettings, $activeTabPath } from '../../stores/editor-store';
import { useStore } from '@nanostores/react';
import { NewModuleDialog, NewExerciseDialog, DeleteDialog, RenameDialog } from './ScaffoldDialogs';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getFileIcon = (node: FileNode, isOpen: boolean = false) => {
  const { name } = node;

  if (node.moduleIcon) {
      const Icon = (LucideIcons as any)[node.moduleIcon];
      if (Icon) return <Icon size={14} className="text-orange-400" />;
  }

  if (name.endsWith('.rs')) return <Code2 size={14} className="text-orange-500" />;
  if (name.endsWith('.py')) return <FileCode size={14} className="text-yellow-500" />;
  if (name.endsWith('.js') || name.endsWith('.ts')) return <FileCode size={14} className="text-blue-400" />;
  if (name.endsWith('.md')) return <BookOpen size={14} className="text-purple-400" />;
  if (name.endsWith('.json') || name.endsWith('.toml')) return <Settings size={14} className="text-zinc-500" />;
  if (name.endsWith('.sh') || name === 'Dockerfile') return <Terminal size={14} className="text-green-500" />;

  // Default Dir/File
  if (node.type === 'dir') {
     return isOpen ? <FolderOpen size={14} className="text-orange-400" /> : <Folder size={14} className="text-orange-400" />;
  }

  return <File size={14} className="text-zinc-500" />;
};

// ─── Context Menu ───────────────────────────────────────────────────────────

type ContextMenuPos = { x: number; y: number; path: string; name: string } | null;

function ContextMenu({ pos, onClose, onDelete, onRename }: {
  pos: NonNullable<ContextMenuPos>;
  onClose: () => void;
  onDelete: (path: string) => void;
  onRename: (path: string) => void;
}) {
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-800/50 mb-1">
        {pos.name}
      </div>
      <button
        className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRename(pos.path);
          onClose();
        }}
      >
        <Edit size={13} className="text-zinc-500" /> Rename
      </button>
      <button
        className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(pos.path);
          onClose();
        }}
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}

// ─── FileTreeNode ───────────────────────────────────────────────────────────

function FileTreeNode({ node, level = 0, onContextMenu }: {
  node: FileNode;
  level?: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}) {
  const activePath = useStore($activeTabPath);
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-expand if active file is inside this folder (simple heuristic: path starts with)
  useEffect(() => {
    if (activePath && activePath.startsWith(node.path + '/') && !isOpen) {
      loadChildren(true);
    }
  }, [activePath]);

  const loadChildren = async (expand = false) => {
    if (children.length === 0) {
      setIsLoading(true);
      try {
        const res = await fetch(`/instructor/fs?path=${encodeURIComponent(node.path)}&type=dir`);
        const data = await res.json();
        if (data.success) {
          // Filter hidden files
          const visible = data.data.filter((f: any) =>
            f.name !== 'info.toml' &&
            f.name !== 'course.json' &&
            f.name !== '.DS_Store'
          );
          setChildren(visible);
        }
      } catch (e) {
        console.error('[FileTree] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    if (expand) setIsOpen(true);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'dir') {
      // Toggle logic
      if (!isOpen) {
        await loadChildren(true);
      } else {
        setIsOpen(false);
      }

      // If module folder, open settings
      if (/^\d{2}_/.test(node.name)) {
        openModuleSettings(node.path, node.name);
      }
    } else {
      openFile(node);
    }
  };

  const isModule = /^\d{2}_/.test(node.name) && node.type === 'dir';
  const isActive = activePath === node.path || (isModule && activePath === `${node.path}/info.toml`);

  return (
    <div>
      <div
        className={`flex items-center py-1 cursor-pointer text-sm select-none transition-all group relative
          ${isActive ? 'bg-orange-500/10 text-orange-200' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'}
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500" />}

        <span className="mr-1 w-4 flex items-center justify-center shrink-0 opacity-70">
          {node.type === 'dir' && (
            isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          )}
        </span>

        <span className="mr-2 shrink-0">
          {getFileIcon(node, isOpen)}
        </span>

        <span className="truncate flex-1">{node.name}</span>

        {/* Module Indicator */}
        {isModule && (
          <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings size={12} className="text-zinc-600 hover:text-orange-400" />
          </span>
        )}
      </div>

      {isOpen && (
        <div className="border-l border-zinc-800/50 ml-3">
           {isLoading ? (
             <div className="py-1 pl-6 text-xs text-zinc-600 italic">Loading...</div>
           ) : (
             children.map((child) => (
               <FileTreeNode
                 key={child.path}
                 node={child}
                 level={level + 1}
                 onContextMenu={onContextMenu}
               />
             ))
           )}
        </div>
      )}
    </div>
  );
}

// ─── FileTree ───────────────────────────────────────────────────────────────

export function FileTree() {
  const rootFiles = useStore($fileTree);
  const [contextMenu, setContextMenu] = useState<ContextMenuPos>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [showNewModule, setShowNewModule] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [treeVersion, setTreeVersion] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredFiles = rootFiles
    .filter(f => {
      const name = f.name.toLowerCase();
      // Hide root config files from tree to reduce clutter
      if (name === 'course.json' || name === '.progy' || name === 'info.toml') return false;
      if (!searchFilter) return true;
      return name.includes(searchFilter.toLowerCase());
    });

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path: node.path, name: node.name });
  }, []);

  const handleUpdate = useCallback(() => {
    loadFileTree();
    setTreeVersion(v => v + 1);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/20">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-1">
          Explorer
        </span>
        <button
          onClick={() => openModuleSettings('.', 'Course Settings')}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-orange-400 transition-colors"
          title="Course Settings"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={() => setShowNewModule(true)}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-blue-400 transition-colors"
          title="New Module"
        >
          <FolderPlus size={14} />
        </button>
        <button
          onClick={() => setShowNewExercise(true)}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-colors"
          title="New Exercise"
        >
          <BookPlus size={14} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="px-2 py-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 focus-within:border-orange-500/30 focus-within:ring-1 focus-within:ring-orange-500/30 transition-all">
          <Search size={12} className="text-zinc-600 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setSearchFilter(''); }}
            className="bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none w-full"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-zinc-600 hover:text-zinc-400"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-2" key={treeVersion}>
        {filteredFiles.length === 0 ? (
          <div className="px-4 py-8 text-center">
             <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-800">
               <Search size={14} className="text-zinc-700" />
             </div>
             <p className="text-xs text-zinc-600">{rootFiles.length === 0 ? 'Loading...' : 'No files found'}</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileTreeNode
              key={file.path}
              node={file}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <ContextMenu
            pos={contextMenu}
            onClose={() => setContextMenu(null)}
            onDelete={(path) => setDeleteTarget(path)}
            onRename={(path) => setRenameTarget(path)}
          />
        </>
      )}

      {/* Dialogs */}
      {showNewModule && (
        <NewModuleDialog
          onClose={() => setShowNewModule(false)}
          onCreated={handleUpdate}
        />
      )}
      {showNewExercise && (
        <NewExerciseDialog
          onClose={() => setShowNewExercise(false)}
          onCreated={handleUpdate}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          path={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleUpdate}
        />
      )}
       {renameTarget && (
        <RenameDialog
          path={renameTarget}
          onClose={() => setRenameTarget(null)}
          onRenamed={handleUpdate}
        />
      )}
    </div>
  );
}
