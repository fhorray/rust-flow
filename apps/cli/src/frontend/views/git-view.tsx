
import React from 'react';
import { GitPanel } from '../components/git-panel';

export function GitView() {
  return (
    <div className="w-full h-full bg-zinc-950 flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="container mx-auto h-full max-w-7xl">
        <GitPanel />
      </div>
    </div>
  );
}
