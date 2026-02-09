import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Monitor,
  Cpu,
  BookOpen,
} from 'lucide-react';
import {
  $session,
  $user,
  $isUserLoading,
  $isOffline,
  logout,
} from '../stores/user-store';
import { SettingsDialog } from './modals/settings-dialog';
import { MyCoursesDialog } from './my-courses-dialog';

export function UserNav() {
  const session = useStore($session);
  const user = useStore($user);
  const isLoading = useStore($isUserLoading);
  const isOffline = useStore($isOffline);
  const [showSettings, setShowSettings] = useState(false);
  const [showMyCourses, setShowMyCourses] = useState(false);

  useEffect(() => {
    // Session is now fetched automatically via nanoquery
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-1 rounded-xl animate-pulse">
        <div className="h-9 w-9 bg-zinc-800 rounded-xl" />
        <div className="hidden sm:flex flex-col gap-1">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-2 w-12 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-xs">
        <User className="w-3.5 h-3.5" />
        <span>Guest</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="cursor-pointer flex items-center gap-3 p-1 rounded-xl hover:bg-zinc-800/40 transition-all focus:outline-none group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-zinc-100 group-hover:text-rust transition-colors">
                {user.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium opacity-80">
                Online
              </span>
            </div>
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover border border-zinc-800 group-hover:border-rust/30 transition-all shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-rust/20 flex items-center justify-center text-sm font-bold text-rust border border-rust/10">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-950 rounded-full" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[200px] bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            sideOffset={8}
            align="end"
          >
            <div className="px-3 py-2 border-b border-zinc-800 mb-2">
              <p className="text-xs font-bold text-zinc-100">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>

            {!isOffline && (
              <DropdownMenu.Item
                onClick={() => setShowMyCourses(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white cursor-pointer outline-none transition-colors group"
              >
                <BookOpen className="w-4 h-4 text-zinc-500 group-hover:text-rust" />
                My Courses
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white cursor-pointer outline-none transition-colors group"
            >
              <Settings className="w-4 h-4 text-zinc-500 group-hover:text-rust" />
              Settings
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white cursor-pointer outline-none transition-colors group"
            >
              <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400" />
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}

      {showMyCourses && session?.session.token && (
        <MyCoursesDialog
          token={session.session.token}
          onClose={() => setShowMyCourses(false)}
        />
      )}
    </>
  );
}
