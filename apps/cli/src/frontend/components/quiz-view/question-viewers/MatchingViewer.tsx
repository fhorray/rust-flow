import React from 'react';
import type { MatchingQuestion } from '../types';

interface MatchingViewerProps {
  q: MatchingQuestion;
  answer: Record<string, string>;
  isAnswered: boolean;
  onSelect: (val: Record<string, string>) => void;
}

export function MatchingViewer({
  q,
  answer,
  isAnswered,
  onSelect,
}: MatchingViewerProps) {
  const userPairs = (answer || {}) as Record<string, string>;

  const handleConnect = (left: string, right: string) => {
    if (isAnswered) return;
    onSelect({ ...userPairs, [left]: right });
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-2">
        <span className="text-xs text-zinc-500 uppercase font-bold block mb-2">
          Items
        </span>
        {q.pairs.map((pair, idx) => (
          <div
            key={idx}
            className="p-3 bg-zinc-800/50 border border-zinc-700 rounded text-sm text-zinc-200 h-12 flex items-center"
          >
            {pair.left}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <span className="text-xs text-zinc-500 uppercase font-bold block mb-2">
          Match
        </span>
        {q.pairs.map((pair, idx) => {
          const currentSelection = userPairs[pair.left] || '';

          return (
            <div key={idx} className="h-12 flex items-center">
              <select
                value={currentSelection}
                onChange={(e) => handleConnect(pair.left, e.target.value)}
                disabled={isAnswered}
                className={`w-full p-2 bg-zinc-900 border rounded text-sm focus:outline-none ${isAnswered
                  ? currentSelection === pair.right
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'border-red-500/50 text-red-400'
                  : 'border-zinc-700 text-zinc-300'
                  }`}
              >
                <option value="">Select match...</option>
                {q.pairs.map((p) => (
                  <option key={p.right} value={p.right}>
                    {p.right}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}