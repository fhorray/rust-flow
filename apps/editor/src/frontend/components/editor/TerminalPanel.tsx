import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Play, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';

interface TerminalPanelProps {
  onClose: () => void;
  runCommand?: string;
  canRun?: boolean;
}

export function TerminalPanel({
  onClose,
  runCommand,
  canRun,
}: TerminalPanelProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const run = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput((prev) => [
      ...prev,
      `\n> Running: ${runCommand || 'npm test'}\n`,
    ]);

    try {
      // In a real implementation, we would use a WebSocket or EventSource
      // For now, we simulate a POST request that streams or returns JSON
      const res = await fetch('/instructor/run', {
        method: 'POST',
        body: JSON.stringify({ command: runCommand }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (data.success) {
        setOutput((prev) => [...prev, data.output]);
      } else {
        setOutput((prev) => [...prev, `Error: ${data.error}`]);
      }
    } catch (e: any) {
      setOutput((prev) => [
        ...prev,
        `[Terminal] Failed to execute: ${e.message}`,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const clear = () => setOutput([]);

  return (
    <div
      className={`flex flex-col bg-black border-t border-zinc-800 transition-all ${isMaximized ? 'h-full' : 'h-64'}`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-orange-500" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Run Output
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={run}
            disabled={isRunning || !canRun}
            title={!canRun ? 'Select an exercise file to run' : 'Run exercise'}
            className="p-1 px-2 rounded hover:bg-zinc-800 text-emerald-500 disabled:opacity-30 disabled:grayscale flex items-center gap-1.5 transition-colors"
          >
            <Play size={12} fill="currentColor" />
            <span className="text-[10px] font-bold">RUN</span>
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          <button
            onClick={clear}
            title="Clear terminal"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            title="Close terminal"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed selection:bg-orange-500/30"
      >
        {output.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-700 text-sm italic">
              Terminal ready. Click RUN to execute course commands.
            </p>
          </div>
        ) : (
          <pre className="text-zinc-300 whitespace-pre-wrap">
            {output.join('\n')}
          </pre>
        )}
      </div>
    </div>
  );
}
