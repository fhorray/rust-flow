import { useStore } from '@nanostores/react';
import { Flame, Layout, Map, Pencil, Share2, Zap } from 'lucide-react';
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
// TYPES
export type ViewMode = 'editor' | 'map' | 'git';

export function Navbar() {
  const router = useStore($router);
  const progress = useStore($progress);

  // Local States

  // Determine active tab
  const activeRoute = router?.route || 'home';
  const currentTab = activeRoute.startsWith('editor') ? 'editor' : activeRoute;

  const unreadNotifications = useStore($unreadNotifications);
  const hasUnread = useStore($hasUnread);
  const [showNotifications, setShowNotifications] = useState(false);

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

          <div className="flex items-center gap-2 relative">
            {/* Notifications Bell */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-zinc-400 hover:text-zinc-100 h-8 w-8 hover:bg-zinc-800/50"
            >
              <BellIcon className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rust rounded-full border-2 border-zinc-900 animate-pulse" />
              )}
            </Button>

            {/* Manual Dropdown */}
            {showNotifications && (
              <div className="absolute top-10 right-0 w-[280px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-100">
                    Notifications
                  </span>
                  {hasUnread && (
                    <button
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {unreadNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 italic">
                      All good here!
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/50">
                      {unreadNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 flex flex-col items-start gap-1 cursor-pointer hover:bg-zinc-800 transition-colors"
                          onClick={() => {
                            if (n.type === 'tutor' && n.metadata?.exerciseId) {
                              $router.open(`/editor/${n.metadata.exerciseId}`);
                            }
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${n.type === 'tutor' ? 'bg-rust' : 'bg-blue-400'}`}
                            />
                            <span className="font-bold text-[11px] text-zinc-100">
                              {n.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-zinc-800/50 mx-1" />

          <UserNav />
        </div>
      </div>
    </nav>
  );
}
