import React, { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { useForm, useStore } from '@progy/form/use-form';
import { InputField, SelectField } from '@progy/form/fields';
import { Checkbox } from '@progy/ui/checkbox';
import { Label } from '@progy/ui/label';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      id: '',
      name: '',
      progression: {
        mode: 'sequential',
        strict_module_order: true,
      },
      runner: {
        command: '',
        type: 'process',
      }
    } as CourseConfigData,
    onSubmit: async ({ value }: { value: CourseConfigData }) => {
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch('/instructor/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(value),
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
        }
    }
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  useEffect(() => {
    fetch('/instructor/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          form.reset(data.config);
        } else {
          setError(data.error || 'Failed to load config');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading configuration...
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
          <form.Field name="id">
            {() => <InputField label="Course ID" />}
          </form.Field>

          {/* Course Name */}
          <form.Field name="name">
            {() => <InputField label="Course Name" />}
          </form.Field>

          {/* Progression Section */}
          <div className="p-4 border border-zinc-700/40 rounded-lg bg-zinc-800/20">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Progression Rules
            </h3>

            <div className="mb-4">
              <form.Field name="progression.mode">
                {() => (
                    <SelectField
                        label="Mode"
                        options={[
                            { value: 'sequential', label: 'Sequential (Lock Next)' },
                            { value: 'open', label: 'Open Navigation' }
                        ]}
                    />
                )}
              </form.Field>
            </div>

            <div className="flex items-center gap-2">
                <form.Field name="progression.strict_module_order">
                    {(field: any) => (
                         <div className="flex items-center gap-2">
                            <Checkbox
                                id="strict_module_order"
                                checked={field.state.value as boolean}
                                onCheckedChange={(checked: boolean) => field.handleChange(checked)}
                                className="w-4 h-4 rounded text-blue-600 bg-zinc-800 border-zinc-600"
                            />
                            <Label htmlFor="strict_module_order" className="text-xs text-zinc-300">
                                Enforce strict module order
                            </Label>
                         </div>
                    )}
                </form.Field>
            </div>
          </div>

          {/* Runner Section */}
          <div className="p-4 border border-zinc-700/40 rounded-lg bg-zinc-800/20">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Runner Configuration
            </h3>

            <div className="mb-3">
              <form.Field name="runner.command">
                {() => <InputField label="Command" className="font-mono" />}
              </form.Field>
            </div>

            <div>
              <form.Field name="runner.type">
                {() => (
                    <SelectField
                        label="Type"
                        options={[
                            { value: 'process', label: 'Process' },
                            { value: 'docker-local', label: 'Docker (Local)' },
                            { value: 'docker-compose', label: 'Docker Compose' }
                        ]}
                    />
                )}
              </form.Field>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded transition-colors disabled:opacity-50 text-sm"
          >
            <Save size={14} />
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
