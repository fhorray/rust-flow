import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import mermaid from 'mermaid';
import { Button } from '@progy/ui/button';

interface ExerciseFlow {
  id: string;
  name: string;
  path: string;
}

interface ModuleFlow {
  id: string;
  title: string;
  exercises: ExerciseFlow[];
}

export function GraphView() {
  const [modules, setModules] = useState<ModuleFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const fetchFlow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/instructor/flow');
      const data = await res.json();
      if (data.success) {
        setModules(data.modules);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch course flow');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlow();
  }, []);

  const generateMermaidCode = () => {
    let code = 'flowchart LR\n';

    // Add custom styling
    code += '  classDef module fill:#1e1e2e,stroke:#313244,stroke-width:2px,color:#cdd6f4,rx:10,ry:10;\n';
    code += '  classDef exercise fill:#313244,stroke:#45475a,stroke-width:1px,color:#a6adc8,rx:5,ry:5;\n';
    code += '  classDef active fill:#f38ba8,stroke:#f38ba8,color:#1e1e2e,font-weight:bold;\n';

    modules.forEach((mod, modIdx) => {
      const modId = `mod_${modIdx}`;
      code += `  subgraph ${modId} ["${mod.title}"]\n`;
      mod.exercises.forEach((ex, exIdx) => {
        const exId = `ex_${modIdx}_${exIdx}`;
        code += `    ${exId}["${ex.name}"]\n`;
        code += `    class ${exId} exercise;\n`;

        // Link exercises within module
        if (exIdx > 0) {
          const prevExId = `ex_${modIdx}_${exIdx - 1}`;
          code += `    ${prevExId} --> ${exId}\n`;
        }
      });
      code += '  end\n';
      code += `  class ${modId} module;\n`;

      // Link modules
      if (modIdx > 0) {
        const prevModLastExIdx = modules[modIdx - 1]!.exercises.length - 1;
        if (prevModLastExIdx >= 0) {
          const prevExId = `ex_${modIdx - 1}_${prevModLastExIdx}`;
          const currentExId = `ex_${modIdx}_0`;
          if (mod.exercises.length > 0) {
            code += `  ${prevExId} ==> ${currentExId}\n`;
          }
        }
      }
    });

    return code;
  };

  useEffect(() => {
    if (!loading && !error && elementRef.current) {
      elementRef.current.removeAttribute('data-processed');
      const render = async () => {
        try {
          await mermaid.run({
            nodes: [elementRef.current!],
          });
        } catch (e) {
          console.error('[GraphView] Mermaid render failed:', e);
        }
      };
      const timer = setTimeout(render, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, error, modules]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">Generating course graph...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500/50" />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Graph Rendering Error</h3>
          <p className="text-sm text-zinc-400 max-w-md">{error}</p>
        </div>
        <Button onClick={fetchFlow} variant="outline" className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950/50">
      <div className="flex-1 overflow-auto p-12 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex justify-center min-w-max">
          <div ref={elementRef} className="mermaid">
            {generateMermaidCode()}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
        <span>Course Dependency Graph</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-800 border border-zinc-700 rounded-sm" /> Module
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-700 rounded-sm" /> Exercise
          </div>
        </div>
      </div>
    </div>
  );
}
