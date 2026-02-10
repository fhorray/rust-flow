import React from 'react';
import { useStore } from '@nanostores/react';
import { Settings, Cpu, Terminal, Shield, Key } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { $ideSettings } from '../../stores/editor-store';

export function IDESettings() {
  const settings = useStore($ideSettings);

  const handleChange = (key: string, value: string) => {
    $ideSettings.setKey(key as any, value);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/50 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 py-12">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              IDE Settings
            </h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              Global Editor Preferences & AI Keys
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* AI Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={12} />
              AI Configuration
            </h3>

            <div className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <Key size={10} /> OpenAI API Key
                </label>
                <Input
                  type="password"
                  value={settings.openAIKey || ''}
                  onChange={(e) => handleChange('openAIKey', e.target.value)}
                  placeholder="sk-..."
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <Key size={10} /> Grok API Key
                </label>
                <Input
                  type="password"
                  value={settings.grokKey || ''}
                  onChange={(e) => handleChange('grokKey', e.target.value)}
                  placeholder="xai-..."
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
              </div>

              <p className="text-[10px] text-zinc-600 italic px-1">
                These keys are stored locally in your browser and are never sent
                to our servers.
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
                  onChange={(e) => handleChange('ideCommand', e.target.value)}
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
