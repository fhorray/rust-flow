import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from './ui/dialog';
import { X, Monitor, Cpu, Key, Save, Check, Settings } from 'lucide-react';
import {
  $user,
  $localSettings,
  fetchLocalSettings,
  updateLocalSettings,
  updateMetadata,
} from '../stores/user-store';
import { Button } from './ui/button';
import { Label } from './ui/label';

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const user = useStore($user);
  const localSettings = useStore($localSettings);

  const [ide, setIde] = useState('vs-code');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchLocalSettings();
    if (user?.metadata) {
      try {
        const meta = JSON.parse(user.metadata);
        if (meta.ide) setIde(meta.ide);
      } catch (e) {}
    }
  }, [user]);

  useEffect(() => {
    if (localSettings.openaiKey) setOpenaiKey(localSettings.openaiKey);
    if (localSettings.ide) setIde(localSettings.ide);
  }, [localSettings]);

  const handleSave = async () => {
    setIsSaving(true);

    // 1. Save IDE to cloud metadata
    await updateMetadata({ ide });

    // 2. Save OpenAI Key and IDE to local config
    await updateLocalSettings({ openaiKey, ide });

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border-none"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row justify-between items-center mb-8">
          <DialogTitle className="text-xl font-black text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-rust" />
            Settings
          </DialogTitle>
          <DialogClose asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-8">
          {/* IDE Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-200">
                Integrated IDE
              </h3>
            </div>
            <p className="text-xs text-zinc-500 -mt-2">
              Choose which editor you're using for a better experience.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'vs-code', name: 'VS Code' },
                { id: 'cursor', name: 'Cursor' },
                { id: 'zed', name: 'Zed' },
                { id: 'antigravity', name: 'Antigravity' },
                { id: 'vim', name: 'Vim/Neovim' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIde(item.id)}
                  className={`p-3 text-xs font-semibold rounded-xl border transition-all text-left flex items-center justify-between
                      ${
                        ide === item.id
                          ? 'bg-rust/10 border-rust text-white'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                >
                  {item.name}
                  {ide === item.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* AI Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-200">
                AI Tutor Configuration
              </h3>
            </div>
            <p className="text-xs text-zinc-500 -mt-2">
              This key is saved ONLY in your local{' '}
              <code className="bg-zinc-800 px-1 rounded">.progy/</code> folder.
            </p>

            <div className="space-y-2">
              <Label
                htmlFor="openai"
                className="text-[10px] uppercase font-black text-zinc-600 tracking-widest ml-1"
              >
                OpenAI API Key
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  id="openai"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-rust transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 bg-rust hover:bg-rust/90 h-11 rounded-xl font-bold"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : showSuccess ? (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Saved!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
