import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import { X, Monitor, Cpu, Key, Save, Check, Settings } from 'lucide-react';
import {
  $user,
  $localSettings,
  fetchLocalSettings,
  updateLocalSettings,
  updateMetadata,
} from '../../stores/user-store';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const user = useStore($user);
  const localSettings = useStore($localSettings);

  const [ide, setIde] = useState('vs-code');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [xaiKey, setXaiKey] = useState('');
  const [aiProvider, setAiProvider] = useState('openai');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchLocalSettings();
    if (user?.metadata) {
      try {
        const meta = JSON.parse(user.metadata);
        if (meta.ide) setIde(meta.ide);
      } catch (e) { }
    }
  }, [user]);

  useEffect(() => {
    if (localSettings.openaiKey) setOpenaiKey(localSettings.openaiKey);
    if (localSettings.anthropicKey) setAnthropicKey(localSettings.anthropicKey);
    if (localSettings.geminiKey) setGeminiKey(localSettings.geminiKey);
    if (localSettings.xaiKey) setXaiKey(localSettings.xaiKey);
    if (localSettings.ide) setIde(localSettings.ide);
    if (localSettings.aiProvider) setAiProvider(localSettings.aiProvider);
    if (localSettings.aiModel) setAiModel(localSettings.aiModel);
  }, [localSettings]);

  const handleSave = async () => {
    setIsSaving(true);

    // 1. Save IDE to cloud metadata
    await updateMetadata({ ide });

    // 2. Save keys and settings to local config
    await updateLocalSettings({
      openaiKey,
      anthropicKey,
      geminiKey,
      xaiKey,
      ide,
      aiProvider,
      aiModel
    });

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
        className="w-full max-w-lg bg-zinc-900 p-8 rounded-3xl border-none"
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
                      ${ide === item.id
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
              Configure your AI provider. Keys are stored locally in <code className="bg-zinc-800 px-1 rounded">.progy/</code>.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'openai', name: 'OpenAI', model: 'gpt-4o-mini' },
                  { id: 'anthropic', name: 'Anthropic', model: 'claude-sonnet-4-5' },
                  { id: 'google', name: 'Google', model: 'gemini-3-flash-preview' },
                  { id: 'xai', name: 'xAI', model: 'grok-4-1-fast-reasoning' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setAiProvider(p.id);
                      setAiModel(p.model);
                    }}
                    className={`p-2.5 text-xs font-semibold rounded-xl border transition-all text-left flex items-center gap-2
                       ${aiProvider === p.id
                        ? 'bg-rust/10 border-rust text-white'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${aiProvider === p.id ? 'bg-rust' : 'bg-zinc-700'}`} />
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[9px] opacity-70 font-mono mt-0.5">{p.model}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="apiKey"
                  className="text-[10px] uppercase font-black text-zinc-600 tracking-widest ml-1"
                >
                  {aiProvider === 'openai' ? 'OpenAI API Key' :
                    aiProvider === 'anthropic' ? 'Anthropic API Key' :
                      aiProvider === 'google' ? 'Google API Key' :
                        aiProvider === 'xai' ? 'xAI API Key' : 'API Key'}
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    id="apiKey"
                    type="password"
                    value={
                      aiProvider === 'openai' ? openaiKey :
                        aiProvider === 'anthropic' ? anthropicKey :
                          aiProvider === 'google' ? geminiKey :
                            aiProvider === 'xai' ? xaiKey : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (aiProvider === 'openai') setOpenaiKey(val);
                      else if (aiProvider === 'anthropic') setAnthropicKey(val);
                      else if (aiProvider === 'google') setGeminiKey(val);
                      else if (aiProvider === 'xai') setXaiKey(val);
                    }}
                    placeholder={`sk-...`}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-rust transition-colors"
                  />
                </div>
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
