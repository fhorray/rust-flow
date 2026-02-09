
import React from 'react';
import { GitPanel } from '../components/git-panel';

export function GitView() {
  return (
    <div className="w-full h-full bg-zinc-950/50 flex-1 flex flex-col items-center justify-center p-8">
      <div className="container mx-auto h-full max-h-[800px]">
        <GitPanel />
      </div>
    </div>
  );
}
