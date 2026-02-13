import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@progy/ui/dialog';
import { X, Monitor, Cpu, Key, Save, Check, Settings, Play } from 'lucide-react';
import {
  $user,
  $settings,
  fetchLocalSettings,
  updateLocalSettings,
  updateMetadata,
  type LocalSettings
} from '../../stores/user-store';
import { $courseConfig } from '../../stores/course-store';
import { Button } from '@progy/ui/button';
import { Label } from '@progy/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@progy/ui/tabs';

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const user = useStore($user);
  // We use the persistent atom directly for initialization to prevent flicker
  const [draft, setDraft] = useState<LocalSettings>(() => $settings.get());

  const [tab, setTab] = useState('ide');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync with backend on mount, but don't overwrite draft if user is editing?
  // Actually, we trust local persistent state first. Backend sync updates the atom.
  // We can subscribe to atom updates if we want "live" updates from other tabs, 
  // but for a modal, initializing once is usually stable enough.
  useEffect(() => {
    fetchLocalSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    // 1. Save IDE to cloud metadata
    if (draft.ide) {
      await updateMetadata({ ide: draft.ide });
    }

    // 2. Save all settings using the unified action
    await updateLocalSettings(draft);

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 800);
  };

  const update = (key: keyof LocalSettings, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full !max-w-xl bg-zinc-900/95 backdrop-blur-md p-0 overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]"
      >
        <DialogHeader className="px-6 py-4 border-b border-zinc-800 flex flex-row justify-between items-center bg-zinc-900/50">
          <DialogTitle className="text-lg font-bold flex items-center gap-2.5 text-zinc-100">
            <Settings className="w-5 h-5 text-zinc-500" />
            Settings
          </DialogTitle>
          <DialogClose asChild>
            <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-2">
            <TabsList className="w-full grid grid-cols-3 bg-zinc-950/50 p-1 border border-zinc-800/50 rounded-lg">
              <TabsTrigger value="ide" className="text-xs font-medium">Editor</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs font-medium">AI Tutor</TabsTrigger>
              <TabsTrigger value="runner" className="text-xs font-medium">Runner</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">

            {/* IDE TAB */}
            <TabsContent value="ide" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Interface Preference</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vs-code', name: 'VS Code' },
                    { id: 'cursor', name: 'Cursor' },
                    { id: 'zed', name: 'Zed' },
                    { id: 'vim', name: 'Vim Mode' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => update('ide', item.id)}
                      className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between
                        ${draft.ide === item.id
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-200 shadow-sm'
                          : 'bg-zinc-800/30 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                    >
                      {item.name}
                      {draft.ide === item.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* AI TAB */}
            <TabsContent value="ai" className="mt-0 space-y-5 focus-visible:outline-none">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">AI Model</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'openai', name: 'OpenAI', model: 'gpt-4o' },
                    { id: 'anthropic', name: 'Anthropic', model: 'sonnet-3.5' },
                    { id: 'google', name: 'Google', model: 'gemini-pro' },
                    { id: 'xai', name: 'xAI', model: 'grok-beta' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        update('aiProvider', p.id);
                        update('aiModel', p.model);
                      }}
                      className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-all text-left flex items-center gap-2
                           ${draft.aiProvider === p.id
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-200 shadow-sm'
                          : 'bg-zinc-800/30 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${draft.aiProvider === p.id ? 'bg-purple-400' : 'bg-zinc-600'}`} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Key className="w-4 h-4" />
                  <Label htmlFor="apiKey" className="text-xs uppercase font-bold tracking-wider">
                    API Key
                  </Label>
                </div>

                <input
                  id="apiKey"
                  type="password"
                  value={
                    draft.aiProvider === 'openai' ? (draft.openaiKey || '') :
                      draft.aiProvider === 'anthropic' ? (draft.anthropicKey || '') :
                        draft.aiProvider === 'google' ? (draft.geminiKey || '') :
                          draft.aiProvider === 'xai' ? (draft.xaiKey || '') : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    const provider = draft.aiProvider || 'openai';
                    if (provider === 'openai') update('openaiKey', val);
                    else if (provider === 'anthropic') update('anthropicKey', val);
                    else if (provider === 'google') update('geminiKey', val);
                    else if (provider === 'xai') update('xaiKey', val);
                  }}
                  placeholder={`sk-...`}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                />
                <p className="text-[10px] text-zinc-600 px-1">
                  Your key is stored locally in <code className="text-zinc-500">.progy/config.json</code>
                </p>
              </div>
            </TabsContent>

            {/* RUNNER TAB */}
            <TabsContent value="runner" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Play className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Execution Environment</span>
                </div>

                {$courseConfig.get()?.runners && $courseConfig.get().runners.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {$courseConfig.get().runners.map((runner: any) => {
                      const isSelected = (draft.runnerId || $courseConfig.get().runners[0].id) === runner.id;
                      return (
                        <button
                          key={runner.id}
                          onClick={() => update('runnerId', runner.id)}
                          className={`px-3 py-3 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between
                                ${isSelected
                              ? 'bg-green-500/10 border-green-500/50 text-green-200 shadow-sm'
                              : 'bg-zinc-800/30 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                            }`}
                        >
                          <div>
                            <div className="font-bold text-sm mb-0.5">{runner.name || runner.id}</div>
                            <div className="text-[10px] opacity-60 font-mono uppercase bg-black/20 inline-block px-1.5 py-0.5 rounded border border-white/5">
                              {runner.type}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-green-400" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800 text-center text-xs text-zinc-500">
                    No additional runners configured for this course.
                  </div>
                )}
                <p className="text-[10px] text-zinc-600 px-1">
                  Defines where your code runs when you click "Run Tests".
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-9 px-4 text-xs hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-9 px-6 bg-zinc-100 text-zinc-900 hover:bg-white border-0 font-bold text-xs shadow-lg shadow-zinc-900/20"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
            ) : showSuccess ? (
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Saved
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
