import { useStore } from '@nanostores/react';
import { Flame, Layout, Map, Share2, Zap } from 'lucide-react';
import { useState } from 'react';
import {
  $progress,
} from '../stores/course-store';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { UserNav } from './user-nav';
import { $router } from '@/stores/router';
// TYPES
export type ViewMode = 'editor' | 'map' | 'git';



export function Navbar() {
  const router = useStore($router);
  const progress = useStore($progress);

  // Local States


  // Determine active tab
  const activeRoute = router?.route || 'home';
  const currentTab = activeRoute.startsWith('editor') ? 'editor' : activeRoute;

  return (
    <nav className="border-b border-zinc-800/50 p-4 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-rust blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-rust via-orange-500 to-rust-dark p-2.5 rounded-xl shadow-2xl">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Prog
              <span className="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">
                y
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium -mt-0.5">
              Learn by Doing
            </p>
          </div>

          <div className="ml-4 self-center">
            <Tabs
              value={currentTab}
              onValueChange={(v) => {
                if (v === 'editor') $router.open('/editor');
                if (v === 'map') $router.open('/map');
                if (v === 'git') $router.open('/git');
              }}
            >
              <TabsList className="bg-zinc-900 border border-zinc-800 h-8 p-0.5">
                <TabsTrigger
                  value="editor"
                  className="text-[10px] font-black px-3 gap-1.5 h-7 data-[state=active]:bg-zinc-800"
                >
                  <Layout className="w-3 h-3" />
                  EDITOR
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="text-[10px] font-black px-3 gap-1.5 h-7 data-[state=active]:bg-zinc-800"
                >
                  <Map className="w-3 h-3" />
                  COURSE MAP
                </TabsTrigger>
                <TabsTrigger
                  value="git"
                  className="text-[10px] font-black px-3 gap-1.5 h-7 data-[state=active]:bg-zinc-800"
                >
                  <Share2 className="w-3 h-3" />
                  SYNC (GIT)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak - Kept in Header */}
          {progress && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-top-2 duration-500">
              <Flame
                className={`w-4 h-4 ${progress.stats.currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-600'}`}
              />
              <span className="text-xs font-bold text-orange-200 tabular-nums">
                {progress.stats.currentStreak}
              </span>
            </div>
          )}

          <div className="h-6 w-[1px] bg-zinc-800/50 mx-1" />

          <UserNav />
        </div>
      </div>
    </nav >
  );
}
