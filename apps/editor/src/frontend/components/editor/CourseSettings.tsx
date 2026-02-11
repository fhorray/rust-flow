import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Save,
  Info,
  Zap,
  Terminal,
  Database,
  Pencil,
  Image,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { updateTabContent, type EditorTab } from '../../stores/editor-store';

interface CourseSettingsProps {
  tab: EditorTab;
}

export function CourseSettings({ tab }: CourseSettingsProps) {
  const [config, setConfig] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    try {
      setConfig(JSON.parse(tab.content));
    } catch (e) {
      console.error('[CourseSettings] JSON parse error:', e);
    }
  }, [tab.content]);

  const handleChange = (path: string, val: any) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let current = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]!];
    }
    current[parts[parts.length - 1]!] = val;

    setConfig(newConfig);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateTabContent(tab.path, JSON.stringify(config, null, 2));
    setIsDirty(false);
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1MB Limit
    if (file.size > 1 * 1024 * 1024) {
      alert('File is too large (max 1MB)');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/instructor/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        handleChange('branding.coverImage', data.path);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  if (!config) return null;

  return (
    <div className="h-full flex flex-col bg-zinc-950/50">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 py-12">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Course Settings
            </h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              Global Metadata & Infrastructure
            </p>
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className={`gap-2 font-bold px-4 ${isDirty ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-800'}`}
            >
              <Save size={14} />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Info size={12} />
              Course Name
            </label>
            <Input
              value={config.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-zinc-900/50 border-zinc-800 text-sm h-11 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              Description
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md p-3 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-zinc-700 transition-all text-zinc-300"
            />
          </div>

          <div className="pt-4 space-y-4 border-t border-zinc-900">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} />
              Runner Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-1.5">
                  <Terminal size={10} /> Type
                </label>
                <Input
                  value={config.runner?.type || ''}
                  onChange={(e) => handleChange('runner.type', e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-1.5">
                  <Database size={10} /> Docker Image
                </label>
                <Input
                  value={config.runner?.image || ''}
                  onChange={(e) => handleChange('runner.image', e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4 border-t border-zinc-900">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={12} />
              Branding & Progression
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-1.5">
                  <Image size="10" /> Cover Image Path
                </label>
                <div className="flex gap-2">
                  <Input
                    value={config.branding?.coverImage || ''}
                    onChange={(e) => handleChange('branding.coverImage', e.target.value)}
                    className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 border-zinc-800 hover:bg-zinc-800 gap-2 whitespace-nowrap"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    type="button"
                  >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={12} />}
                    {isUploading ? 'Uploading...' : 'Select'}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Primary Color</label>
                <Input
                  value={config.branding?.primaryColor || ''}
                  onChange={(e) => handleChange('branding.primaryColor', e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-xs h-9"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Layout</label>
                <select
                  value={config.branding?.layout || 'grid'}
                  onChange={(e) => handleChange('branding.layout', e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md px-3 text-xs h-9 text-zinc-300"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Progression Mode</label>
                <select
                  value={config.progression?.mode || 'open'}
                  onChange={(e) => handleChange('progression.mode', e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md px-3 text-xs h-9 text-zinc-300"
                >
                  <option value="open">Open</option>
                  <option value="sequential">Sequential</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
