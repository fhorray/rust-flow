import React, { useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { useStore } from '@nanostores/react';
import {
  $fileTree,
  openFile,
  saveActiveFile,
  saveAllFiles,
  type FileNode,
  openModuleSettings,
  openIDESettings,
} from '../../stores/editor-store';
import {
  File,
  Search,
  Settings,
  Save,
  Terminal,
  Command as CommandIcon,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const fileTree = useStore($fileTree);

  // Toggle with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { files, modules } = useMemo(() => {
    const getAllFiles = (nodes: FileNode[]): FileNode[] => {
      let files: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'file') {
          files.push(node);
        }
        if (node.children) {
          files = [...files, ...getAllFiles(node.children)];
        }
      }
      return files;
    };

    const allFiles = getAllFiles(fileTree);
    const allModules = fileTree.filter(
      (n) => n.type === 'dir' && /^\d{2}_/.test(n.name),
    );

    return { files: allFiles, modules: allModules };
  }, [fileTree]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-4"
      >
        <Command
          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[70vh]"
          loop
          label="Command Palette"
        >
          <div className="flex items-center border-b border-zinc-800 px-3 shrink-0">
            <Search className="w-5 h-5 text-zinc-500 mr-2" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search files..."
              className="flex-1 h-12 bg-transparent outline-none text-zinc-200 placeholder-zinc-500 text-sm font-medium"
            />
          </div>

          <Command.List className="flex-1 overflow-y-auto p-2 scroll-py-2">
            <Command.Empty className="py-6 text-center text-sm text-zinc-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Global Commands" className="mb-2">
              <div className="px-2 pb-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Global Commands
              </div>
              <Command.Item
                onSelect={() => runCommand(() => saveActiveFile())}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                <Save size={14} className="text-zinc-500" />
                <span>Save Active File</span>
                <kbd className="ml-auto text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-700">
                  Cmd+S
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => saveAllFiles())}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                <Save size={14} className="text-emerald-500" />
                <span>Save All Files</span>
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(() => openModuleSettings('.', 'Course Settings'))
                }
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                <Settings size={14} className="text-orange-500" />
                <span>Open Course Settings</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(openIDESettings)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                <Settings size={14} className="text-blue-500" />
                <span>Open Studio Settings (IDE)</span>
              </Command.Item>
            </Command.Group>

            {modules.length > 0 && (
              <>
                <Command.Separator className="h-px bg-zinc-800/50 my-2" />
                <Command.Group heading="Modules" className="mb-2">
                  <div className="px-2 pb-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Modules
                  </div>
                  {modules.map((module) => (
                    <Command.Item
                      key={module.path}
                      value={`module-${module.name}`}
                      onSelect={() =>
                        runCommand(() =>
                          openModuleSettings(module.path, module.name),
                        )
                      }
                      className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
                    >
                      <Settings size={14} className="text-zinc-500" />
                      <span>Configure {module.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}

            {files.length > 0 && (
              <>
                <Command.Separator className="h-px bg-zinc-800/50 my-2" />
                <Command.Group heading="Files" className="mb-2">
                  <div className="px-2 pb-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Files
                  </div>
                  {files.map((file) => (
                    <Command.Item
                      key={file.path}
                      value={file.path}
                      onSelect={() => runCommand(() => openFile(file))}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
                    >
                      <File size={14} className="text-zinc-500" />
                      <span>{file.name}</span>
                      <span className="ml-auto text-[10px] text-zinc-600 truncate max-w-[150px]">
                        {file.path}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>

          <div className="border-t border-zinc-800 px-3 py-2 flex items-center justify-between text-[10px] text-zinc-600 bg-zinc-900/50 shrink-0">
            <div className="flex items-center gap-2">
              <CommandIcon size={12} /> Progy Command Palette
            </div>
            <div>
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 mr-1">
                ↑↓
              </span>{' '}
              to navigate
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 mx-1">
                ↵
              </span>{' '}
              to select
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 ml-1">
                esc
              </span>{' '}
              to close
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
