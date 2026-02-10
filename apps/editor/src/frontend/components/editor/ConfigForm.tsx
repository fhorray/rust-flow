import React, { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';

// ─── ConfigForm ─────────────────────────────────────────────────────────────
// Form-based editor for course.json configuration.

interface CourseConfigData {
  id: string;
  name: string;
  progression?: {
    mode?: 'sequential' | 'open';
    strict_module_order?: boolean;
  };
  runner?: {
    command?: string;
    args?: string[];
    type?: string;
  };
  content?: {
    exercises?: string;
    root?: string;
  };
  [key: string]: any;
}

export function ConfigForm() {
  const [config, setConfig] = useState<CourseConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/instructor/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.config);
        } else {
          setError(data.error || 'Failed to load config');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/instructor/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path: string, value: any) => {
    if (!config) return;
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(config));
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]!]) obj[keys[i]!] = {};
      obj = obj[keys[i]!];
    }
    obj[keys[keys.length - 1]!] = value;
    setConfig(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading configuration...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {error || 'No configuration found'}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={18} className="text-blue-400" />
          <h2 className="text-lg font-bold text-zinc-100">
            Course Configuration
          </h2>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs">
            Configuration saved successfully!
          </div>
        )}

        <div className="space-y-5">
          {/* Course ID */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Course ID
            </label>
            <input
              className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
              value={config.id || ''}
              onChange={(e) => updateField('id', e.target.value)}
            />
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Course Name
            </label>
            <input
              className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
              value={config.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          {/* Progression Section */}
          <div className="p-4 border border-zinc-700/40 rounded-lg bg-zinc-800/20">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Progression Rules
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Mode
              </label>
              <select
                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-3 py-2 text-sm text-zinc-200 outline-none"
                value={config.progression?.mode || 'sequential'}
                onChange={(e) =>
                  updateField('progression.mode', e.target.value)
                }
              >
                <option value="sequential">Sequential (Lock Next)</option>
                <option value="open">Open Navigation</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="strict_module_order"
                className="w-4 h-4 rounded text-blue-600 bg-zinc-800 border-zinc-600"
                checked={config.progression?.strict_module_order ?? true}
                onChange={(e) =>
                  updateField(
                    'progression.strict_module_order',
                    e.target.checked,
                  )
                }
              />
              <label
                htmlFor="strict_module_order"
                className="text-xs text-zinc-300"
              >
                Enforce strict module order
              </label>
            </div>
          </div>

          {/* Runner Section */}
          <div className="p-4 border border-zinc-700/40 rounded-lg bg-zinc-800/20">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Runner Configuration
            </h3>

            <div className="mb-3">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Command
              </label>
              <input
                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-3 py-2 text-sm text-zinc-200 font-mono focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                value={config.runner?.command || ''}
                onChange={(e) => updateField('runner.command', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Type
              </label>
              <select
                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-3 py-2 text-sm text-zinc-200 outline-none"
                value={config.runner?.type || 'process'}
                onChange={(e) => updateField('runner.type', e.target.value)}
              >
                <option value="process">Process</option>
                <option value="docker-local">Docker (Local)</option>
                <option value="docker-compose">Docker Compose</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded transition-colors disabled:opacity-50 text-sm"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
