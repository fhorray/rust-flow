import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Save, Info, ListOrdered, BookOpen, GripVertical, Pencil, Check, X, Loader2, Smile, Award } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { updateTabContent, type EditorTab, loadFileTree } from '../../stores/editor-store';

interface ModuleSettingsProps {
  tab: EditorTab;
}

interface ExerciseItem {
  name: string;
  title?: string;
  tags?: string[];
  difficulty?: string;
  xp?: number;
}

// ─── Sortable Item ──────────────────────────────────────────────────────────

function SortableItem({ item, onRename, onUpdateMeta }: {
  item: ExerciseItem;
  onRename: (oldName: string, newName: string) => void;
  onUpdateMeta: (meta: Partial<ExerciseItem>) => void;
}) {
  const { id } = { id: item.name };
  const name = item.name;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(name);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tags, setTags] = useState(item.tags?.join(', ') || '');
  const [diff, setDiff] = useState(item.difficulty || 'medium');
  const [xp, setXp] = useState(item.xp?.toString() || '');

  // Strip prefix for display (01_hello -> hello)
  const displayName = name.replace(/^\d+_/, '');

  const handleNameSave = () => {
    if (editName.trim() && editName !== displayName) {
      const prefix = name.match(/^\d+_/)?.[0] || '';
      onRename(name, prefix + editName);
    }
    setIsEditingName(false);
  };

  const handleMetaSave = () => {
    onUpdateMeta({
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      difficulty: diff,
      xp: xp ? parseInt(xp) : undefined
    });
    setIsExpanded(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col bg-zinc-900/50 rounded-lg group border border-transparent hover:border-zinc-800 transition-all"
    >
      <div className="flex items-center gap-3 p-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400">
          <GripVertical size={16} />
        </div>

        <span className="text-[10px] font-mono text-zinc-700 select-none">
          {name.split('_')[0]}
        </span>

        {isEditingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-orange-500"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
            />
            <button onClick={handleNameSave} className="p-1 hover:bg-zinc-700 rounded text-emerald-500"><Check size={14} /></button>
            <button onClick={() => setIsEditingName(false)} className="p-1 hover:bg-zinc-700 rounded text-red-500"><X size={14} /></button>
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              <span className="text-xs text-zinc-400 group-hover:text-white transition-colors font-medium">
                {displayName}
              </span>
              {(item.tags?.length || item.difficulty || item.xp) && (
                <div className="flex gap-2 mt-1">
                  {item.tags?.map(t => <span key={t} className="text-[9px] px-1 bg-zinc-800 rounded text-zinc-500">{t}</span>)}
                  {item.difficulty && <span className="text-[9px] px-1 bg-zinc-800 rounded text-blue-500">{item.difficulty}</span>}
                </div>
              )}
            </div>

            <button
              onClick={() => { setEditName(displayName); setIsEditingName(true); }}
              className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700 transition-all ${isExpanded ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Settings size={12} />
            </button>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold">Tags</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300" placeholder="sql, easy" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold">Difficulty</label>
            <select value={diff} onChange={e => setDiff(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold">XP Override</label>
            <div className="flex gap-2">
              <input value={xp} onChange={e => setXp(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300" placeholder="Default" />
              <button onClick={handleMetaSave} className="bg-orange-600 hover:bg-orange-500 text-white rounded px-2 py-1 text-xs">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Module Settings ────────────────────────────────────────────────────────

export function ModuleSettings({ tab }: ModuleSettingsProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const modulePath = tab.path.substring(0, tab.path.lastIndexOf('/')); // Remove /info.toml

  // Load Metadata (info.toml)
  useEffect(() => {
    const titleMatch = tab.content.match(/title\s*=\s*"([^"]+)"/);
    const messageMatch = tab.content.match(/message\s*=\s*"([^"]+)"/);
    const iconMatch = tab.content.match(/icon\s*=\s*"([^"]+)"/);
    const completionMatch = tab.content.match(/completion_message\s*=\s*"([^"]+)"/);

    setTitle(titleMatch ? titleMatch[1]! : '');
    setMessage(messageMatch ? messageMatch[1]! : '');
    setIcon(iconMatch ? iconMatch[1]! : '');
    setCompletionMessage(completionMatch ? completionMatch[1]! : '');
  }, [tab.content]);

  // Load Exercises (Dir listing)
  const loadExercises = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch(`/instructor/fs?path=${encodeURIComponent(modulePath)}&type=dir`);
      const data = await res.json();
      if (data.success) {
        // Filter only numeric prefixed folders
        const list = data.data
          .filter((f: any) => f.type === 'dir' && /^\d{2}_/.test(f.name))
          .map((f: any) => ({
            name: f.name,
            title: f.title,
            tags: f.tags,
            difficulty: f.difficulty,
            xp: f.xp
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setExercises(list);
      }
    } catch (e) {
      console.error('Failed to load exercises', e);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [modulePath]);

  // Handle Metadata Save
  const handleSave = () => {
    let newContent = tab.content;

    const updateField = (key: string, val: string) => {
      const regex = new RegExp(`${key}\\s*=\\s*"[^"]*"`);
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, `${key} = "${val}"`);
      } else if (newContent.includes('[module]')) {
        newContent = newContent.replace('[module]', `[module]\n${key} = "${val}"`);
      } else {
        // Fallback if [module] missing (rare)
        newContent += `\n${key} = "${val}"`;
      }
    };

    updateField('title', title);
    updateField('message', message);
    if (icon) updateField('icon', icon);
    if (completionMessage) updateField('completion_message', completionMessage);

    updateTabContent(tab.path, newContent);
    setIsDirty(false);
  };

  const handleChange = (type: 'title' | 'message' | 'icon' | 'completion', val: string) => {
    if (type === 'title') setTitle(val);
    if (type === 'message') setMessage(val);
    if (type === 'icon') setIcon(val);
    if (type === 'completion') setCompletionMessage(val);
    setIsDirty(true);
  };

  const IconPreview = (LucideIcons as any)[icon] || LucideIcons.Box;

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setIsReordering(true);
      const oldIndex = exercises.findIndex(e => e.name === active.id);
      const newIndex = exercises.findIndex(e => e.name === over!.id);

      // Calculate new order locally
      const newOrder = arrayMove(exercises, oldIndex, newIndex);
      setExercises(newOrder);

      // Send to backend
      try {
        const res = await fetch('/instructor/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentPath: modulePath,
            order: newOrder.map(e => e.name)
          }),
        });
        const data = await res.json();
        if (data.success) {
          // Reload to get fresh names (01_, 02_ etc might have changed)
          await loadExercises();
          loadFileTree(); // refresh sidebar too
        }
      } catch (e) {
        console.error('Reorder failed', e);
        loadExercises(); // revert
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleRename = async (oldName: string, newName: string) => {
    try {
      const res = await fetch(`/instructor/fs?path=${encodeURIComponent(modulePath + '/' + oldName)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPath: modulePath + '/' + newName })
      });
      if (res.ok) {
        await loadExercises();
        loadFileTree();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMeta = async (exerciseName: string, meta: Partial<ExerciseItem>) => {
    try {
      const res = await fetch('/instructor/exercise-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePath,
          exerciseName,
          metadata: meta
        })
      });
      if (res.ok) {
        await loadExercises();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/50">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Module Settings</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Configure module metadata and ordering</p>
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className={`gap-2 font-bold px-4 ${isDirty ? 'bg-orange-600 hover:bg-orange-500' : 'bg-zinc-800'}`}
            >
              <Save size={14} />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Metadata Fields */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Info size={12} />
              Module Title
            </label>
            <Input
              value={title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Enter module title..."
              className="bg-zinc-900/50 border-zinc-800 text-sm h-11 focus:ring-orange-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={12} />
              Welcome Message
            </label>
            <textarea
              value={message}
              onChange={e => handleChange('message', e.target.value)}
              placeholder="Welcome student to this module..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zinc-700 transition-all text-zinc-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Smile size={12} />
                Module Icon (Lucide Name)
              </label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 shrink-0">
                  <IconPreview size={20} />
                </div>
                <Input
                  value={icon}
                  onChange={e => handleChange('icon', e.target.value)}
                  placeholder="e.g. Database, Server, Code..."
                  className="bg-zinc-900/50 border-zinc-800 text-sm h-10 focus:ring-orange-500/20 flex-1"
                />
              </div>
              <p className="text-[10px] text-zinc-600">
                Use any icon name from <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">Lucide React</a>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Award size={12} />
                Completion Message
              </label>
              <textarea
                value={completionMessage}
                onChange={e => handleChange('completion', e.target.value)}
                placeholder="Congratulations! You completed this module."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md p-2 text-sm h-[88px] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zinc-700 transition-all text-zinc-300 resize-none"
              />
              <p className="text-[10px] text-zinc-600">
                Supports markdown and {'{{user.name}}'} placeholder.
              </p>
            </div>
          </div>

          {/* Exercise Reordering */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <ListOrdered size={12} />
                Exercise List
              </label>
              {isReordering && <span className="text-xs text-orange-500 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Saving order...</span>}
            </div>

            {isLoadingList ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-zinc-600" /></div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={exercises.map(e => e.name)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="bg-zinc-900/30 rounded-xl border border-zinc-900 p-2 space-y-1">
                    {exercises.length === 0 ? (
                      <div className="p-4 text-center text-zinc-600 text-xs italic">
                        No exercises found. Create one in the sidebar.
                      </div>
                    ) : (
                      exercises.map((ex) => (
                        <SortableItem
                          key={ex.name}
                          item={ex}
                          onRename={handleRename}
                          onUpdateMeta={(meta) => handleUpdateMeta(ex.name, meta)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <p className="text-[10px] text-zinc-600 italic">
              Drag and drop to reorder. The prefix (01_, 02_) will be updated automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
