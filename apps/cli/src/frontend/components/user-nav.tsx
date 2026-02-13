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
  $isInstructor,
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

  const isInstructor = useStore($isInstructor);

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

  // Simplified Guest UI for Instructors (no dropdown, no settings)
  if (isInstructor || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-orange-500/80 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-black/50 overflow-hidden group">
        <div className="relative flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          <span>Guest</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="cursor-pointer flex items-center gap-3 p-1.5 rounded-xl hover:bg-zinc-800/50 transition-all focus:outline-none group active:scale-95 border border-transparent hover:border-zinc-800">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-zinc-100 group-hover:text-rust transition-colors">
                {user.name}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-medium">
                  Online
                </span>
              </div>
            </div>
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-zinc-800 group-hover:border-rust/50 transition-all shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rust/20 to-orange-500/20 flex items-center justify-center text-sm font-bold text-rust border-2 border-rust/20 shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full shadow-lg shadow-green-500/50" />
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[220px] bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
            sideOffset={12}
            align="end"
          >
            <div className="px-4 py-3 border-b border-zinc-800 mb-2">
              <p className="text-sm font-bold text-zinc-100 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
            </div>

            {!isOffline && (
              <DropdownMenu.Item
                onClick={() => setShowMyCourses(true)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white cursor-pointer outline-none transition-all group active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-zinc-500 group-hover:text-rust transition-colors" />
                <span className="font-medium">My Courses</span>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white cursor-pointer outline-none transition-all group active:scale-95"
            >
              <Settings className="w-4 h-4 text-zinc-500 group-hover:text-rust transition-colors" />
              <span className="font-medium">Settings</span>
            </DropdownMenu.Item>

            <div className="my-1 border-t border-zinc-800" />

            <DropdownMenu.Item
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 rounded-lg hover:bg-red-500/10 hover:text-red-400 cursor-pointer outline-none transition-all group active:scale-95"
            >
              <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
              <span className="font-medium">Logout</span>
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
