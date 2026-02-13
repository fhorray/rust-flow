'use client';

import { useStore } from '@nanostores/react';
import { Flame, Layout, Map, Share2, Zap, X } from 'lucide-react';
import { useState } from 'react';
import { $progress } from '../stores/course-store';
import { Tabs, TabsList, TabsTrigger } from '@progy/ui/tabs';
import { UserNav } from './user-nav';
import { $router } from '@/stores/router';
import { BellIcon } from 'lucide-react';
import { Button } from '@progy/ui/button';
import { ScrollArea } from '@progy/ui/scroll-area';
import {
  $hasUnread,
  $unreadNotifications,
  markAllAsRead,
} from '../stores/notification-store';

export type ViewMode = 'editor' | 'map' | 'git';

export function Navbar() {
  const router = useStore($router);
  const progress = useStore($progress);

  const activeRoute = router?.route || 'home';
  const currentTab = activeRoute.startsWith('editor') ? 'editor' : activeRoute;

  const unreadNotifications = useStore($unreadNotifications);
  const hasUnread = useStore($hasUnread);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-rust/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-rust to-orange-500 p-2 rounded-lg shadow-lg shadow-rust/10">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-tight leading-none">
                Prog
                <span className="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">
                  y
                </span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-semibold tracking-wide mt-0.5">
                LEARN BY DOING
              </p>
            </div>
          </a>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-zinc-800" />

          {/* Navigation Tabs */}
          <div className="hidden md:block">
            <Tabs
              value={currentTab}
              onValueChange={(v) => {
                if (v === 'editor') $router.open('/studio');
                if (v === 'map') $router.open('/map');
                if (v === 'git') $router.open('/git');
              }}
            >
              <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
                <TabsTrigger
                  value="editor"
                  className="text-[11px] font-bold px-3 gap-1.5 h-8 rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 hover:text-zinc-300 transition-colors border-none"
                >
                  <Layout className="w-3.5 h-3.5" />
                  Editor
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="text-[11px] font-bold px-3 gap-1.5 h-8 rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 hover:text-zinc-300 transition-colors border-none"
                >
                  <Map className="w-3.5 h-3.5" />
                  Course Map
                </TabsTrigger>
                <TabsTrigger
                  value="git"
                  className="text-[11px] font-bold px-3 gap-1.5 h-8 rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 hover:text-zinc-300 transition-colors border-none"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Sync
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Right: Stats + Actions */}
        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          {progress && (
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
              <Flame
                className={`w-3.5 h-3.5 ${progress.stats.currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-zinc-600'}`}
              />
              <span className="text-[11px] font-bold text-zinc-300 tabular-nums">
                {progress.stats.currentStreak}
              </span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-zinc-500 hover:text-zinc-100 h-8 w-8 hover:bg-zinc-800/50 rounded-lg"
            >
              <BellIcon className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rust rounded-full animate-pulse" />
              )}
            </Button>

            {showNotifications && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                {/* Dropdown */}
                <div className="absolute top-10 right-0 w-[320px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-100">
                      Notifications
                    </span>
                    <div className="flex items-center gap-2">
                      {hasUnread && (
                        <button
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ScrollArea className="max-h-[360px]">
                    {unreadNotifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <BellIcon className="w-8 h-8 mx-auto mb-3 text-zinc-800" />
                        <p className="text-xs text-zinc-600 font-medium">
                          No new notifications
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-800/50">
                        {unreadNotifications.map((n) => (
                          <button
                            key={n.id}
                            className="w-full text-left p-4 flex flex-col gap-1.5 hover:bg-zinc-800/50 transition-colors"
                            onClick={() => {
                              if (n.type === 'tutor' && n.metadata?.exerciseId) {
                                $router.open(`/studio/${n.metadata.exerciseId}`);
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.type === 'tutor' ? 'bg-rust' : 'bg-blue-400'}`}
                              />
                              <span className="font-semibold text-xs text-zinc-200">
                                {n.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 leading-relaxed pl-3.5">
                              {n.message}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </>
            )}
          </div>

          <div className="h-5 w-px bg-zinc-800 mx-1 hidden sm:block" />

          <UserNav />
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-zinc-800/60 px-2 py-1.5">
        <Tabs
          value={currentTab}
          onValueChange={(v) => {
            if (v === 'editor') $router.open('/studio');
            if (v === 'map') $router.open('/map');
            if (v === 'git') $router.open('/git');
          }}
        >
          <TabsList className="w-full bg-transparent border-none h-9 p-0 gap-1 justify-around">
            <TabsTrigger
              value="editor"
              className="text-[11px] font-bold px-3 gap-1.5 h-8 flex-1 rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-100 text-zinc-500 border-none"
            >
              <Layout className="w-3.5 h-3.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="text-[11px] font-bold px-3 gap-1.5 h-8 flex-1 rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-100 text-zinc-500 border-none"
            >
              <Map className="w-3.5 h-3.5" />
              Map
            </TabsTrigger>
            <TabsTrigger
              value="git"
              className="text-[11px] font-bold px-3 gap-1.5 h-8 flex-1 rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-100 text-zinc-500 border-none"
            >
              <Share2 className="w-3.5 h-3.5" />
              Sync
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </nav>
  );
}
