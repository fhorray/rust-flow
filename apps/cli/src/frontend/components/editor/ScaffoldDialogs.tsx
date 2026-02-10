import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type ModuleInfo = { name: string; path: string; title: string };

// ─── Dialog Backdrop (shared) ───────────────────────────────────────────────

function DialogBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

// ─── New Module Dialog ──────────────────────────────────────────────────────

export function NewModuleDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/instructor/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'module', title: title.trim(), message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated();
        onClose();
      } else {
        setError(data.error || 'Failed to create module');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DialogBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100">New Module</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Module Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Variables & Types"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Welcome Message</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Let's learn about variables!"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
            <p className="text-[11px] text-zinc-600 mt-1">Shown to students at the start of this module</p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Module'}
          </button>
        </div>
      </div>
    </DialogBackdrop>
  );
}

// ─── Rename Dialog ──────────────────────────────────────────────────────────

export function RenameDialog({ path, onClose, onRenamed }: { path: string; onClose: () => void; onRenamed: () => void }) {
  const [newName, setNewName] = useState(path.split('/').pop() || '');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState('');

  const handleRename = async () => {
    if (!newName.trim()) { setError('Name is required'); return; }
    if (newName === (path.split('/').pop() || '')) { onClose(); return; }

    setIsRenaming(true);
    setError('');

    const parentDir = path.split('/').slice(0, -1).join('/');
    const newPath = parentDir ? `${parentDir}/${newName}` : newName;

    try {
      const res = await fetch(`/instructor/fs?path=${encodeURIComponent(path)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPath }),
      });
      const data = await res.json();
      if (data.success) {
        onRenamed();
        onClose();
      } else {
        setError(data.error || 'Failed to rename');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <DialogBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100">Rename Item</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">New Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={isRenaming || !newName.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isRenaming ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </DialogBackdrop>
  );
}

// ─── New Exercise Dialog ────────────────────────────────────────────────────

export function NewExerciseDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [modulePath, setModulePath] = useState('');
  const [fileExtension, setFileExtension] = useState('rs');
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/instructor/modules')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.modules.length > 0) {
          setModules(data.modules);
          setModulePath(data.modules[0].path);
        }
      })
      .catch(() => setError('Failed to load modules'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!modulePath) { setError('Select a module'); return; }
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/instructor/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'exercise',
          title: title.trim(),
          modulePath,
          fileExtension,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated();
        onClose();
      } else {
        setError(data.error || 'Failed to create exercise');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DialogBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100">New Exercise</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-zinc-500 text-sm">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-zinc-400 text-sm mb-2">No modules found</p>
            <p className="text-zinc-600 text-xs">Create a module first before adding exercises</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Module *</label>
              <select
                value={modulePath}
                onChange={(e) => setModulePath(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                {modules.map((m) => (
                  <option key={m.path} value={m.path}>
                    {m.title} ({m.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Exercise Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hello World"
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <p className="text-[11px] text-zinc-600 mt-1">This title goes into info.toml and the student sidebar</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Starter File Extension</label>
              <input
                type="text"
                value={fileExtension}
                onChange={(e) => setFileExtension(e.target.value.replace(/^\./, '').replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="rs, py, js, ts, sql, go, c, java..."
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
              />
              <p className="text-[11px] text-zinc-600 mt-1">
                Creates {fileExtension === 'rs' ? 'exercise' : 'main'}.{fileExtension || 'ext'} + README.md
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !title.trim() || !modulePath || modules.length === 0}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Exercise'}
          </button>
        </div>
      </div>
    </DialogBackdrop>
  );
}

// ─── Delete Confirmation Dialog ─────────────────────────────────────────────

const PROTECTED_PATHS = ['course.json', 'progy.toml', 'Dockerfile', 'docker-compose.yml'];

export function DeleteDialog({ path, onClose, onDeleted }: { path: string; onClose: () => void; onDeleted: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const filename = path.split('/').pop() || path;
  const isProtected = PROTECTED_PATHS.some(p => path.endsWith(p));

  const handleDelete = async () => {
    if (isProtected) return;
    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`/instructor/fs?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onDeleted();
        onClose();
      } else {
        setError(data.error || 'Failed to delete');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogBackdrop onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100">Delete {filename}?</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        {isProtected ? (
          <p className="text-sm text-amber-400 bg-amber-500/10 px-3 py-3 rounded-lg mb-4">
            ⚠️ <strong>{filename}</strong> is a protected file and cannot be deleted.
          </p>
        ) : (
          <p className="text-sm text-zinc-400 mb-4">
            Are you sure you want to delete <strong className="text-zinc-200">{filename}</strong>? This action cannot be undone.
          </p>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          {!isProtected && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </DialogBackdrop>
  );
}
