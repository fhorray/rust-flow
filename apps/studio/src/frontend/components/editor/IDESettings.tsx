import React from 'react';
import { useStore } from '@nanostores/react';
import { Settings, Cpu, Terminal, Key } from 'lucide-react';
import { Input } from '@progy/ui/input';
import { $ideSettings, type ModelProvider } from '../../stores/editor-store';

const MODEL_PROVIDERS: {
  value: ModelProvider;
  label: string;
  placeholder: string;
}[] = [
    { value: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
    { value: 'grok', label: 'Grok', placeholder: 'xai-...' },
    { value: 'claude', label: 'Claude', placeholder: 'sk-ant-...' },
    { value: 'gemini', label: 'Gemini', placeholder: 'AIza...' },
  ];

export function IDESettings() {
  const settings = useStore($ideSettings);
  const activeProvider = (settings.modelProvider || 'openai') as ModelProvider;
  const activePlaceholder =
    MODEL_PROVIDERS.find((p) => p.value === activeProvider)?.placeholder ?? '';

  return (
    <div className="h-full flex flex-col bg-zinc-950/50 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 py-12">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Studio Settings
            </h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              Global Editor Preferences & AI Configuration
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* AI Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={12} />
              AI Provider
            </h3>

            <div className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
              {/* Model Provider Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  Model
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MODEL_PROVIDERS.map((provider) => (
                    <button
                      key={provider.value}
                      onClick={() =>
                        $ideSettings.setKey('modelProvider', provider.value)
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${activeProvider === provider.value
                        ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                    >
                      {provider.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Key Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <Key size={10} /> Secret Key
                </label>
                <Input
                  type="password"
                  value={settings.secretKey || ''}
                  onChange={(e) =>
                    $ideSettings.setKey('secretKey', e.target.value)
                  }
                  placeholder={activePlaceholder}
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
              </div>

              <p className="text-[10px] text-zinc-600 italic px-1">
                Your key is stored locally in your browser and is never sent to
                our servers.
              </p>
            </div>
          </div>

          {/* IDE Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={12} />
              Editor Environment
            </h3>

            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  External IDE Command
                </label>
                <Input
                  value={settings.ideCommand || 'code'}
                  onChange={(e) =>
                    $ideSettings.setKey('ideCommand', e.target.value)
                  }
                  placeholder="e.g. code, cursor, nvim"
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
                <p className="text-[10px] text-zinc-500 italic">
                  Command used to open files in your external IDE (default:
                  'code')
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
