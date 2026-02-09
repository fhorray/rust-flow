import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, BookOpen, Trophy, Clock, ChevronRight, Search } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $remoteApiUrl } from '../stores/user-store';

interface MyCoursesDialogProps {
  onClose: () => void;
  token: string;
}

interface CourseProgress {
  courseId: string;
  updatedAt: string;
  data: {
    stats: {
      totalXp: number;
      currentStreak: number;
    };
    exercises: Record<string, any>;
  };
}

interface RegistryCourse {
  repo: string;
  branch: string;
  path: string;
  description: string;
}

export function MyCoursesDialog({ onClose, token }: MyCoursesDialogProps) {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [registry, setRegistry] = useState<Record<string, RegistryCourse>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const remoteUrl = useStore($remoteApiUrl);

  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, registryRes, configRes] = await Promise.all([
          fetch(`${remoteUrl}/api/progress/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${remoteUrl}/registry`),
          fetch('/config'),
        ]);

        if (progressRes.ok && registryRes.ok && configRes.ok) {
          const progressData = await progressRes.json();
          const registryData = await registryRes.json();
          const configData = await configRes.json();

          setCourses(progressData);
          setRegistry(registryData.courses || {});
          setCurrentCourseId(configData.id || null);
        }
      } catch (e) {
        console.error('Failed to fetch my courses', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [remoteUrl, token]);

  const filteredCourses = courses.filter(
    (c) =>
      c.courseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registry[c.courseId]?.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleCourseClick = (courseId: string) => {
    const repo = registry[courseId]?.repo;
    if (repo) {
      window.open(repo, '_blank');
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rust/10 rounded-xl">
                <BookOpen className="w-5 h-5 text-rust" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-white tracking-tight">
                  My Learning Path
                </Dialog.Title>
                <Dialog.Description className="text-xs text-zinc-500 font-medium">
                  Track your progress across all Progy courses
                </Dialog.Description>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust/50 transition-all"
              />
            </div>

            {/* Course List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50"
                  />
                ))
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                  <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-zinc-400">
                    No courses found
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Start a new course to see it here!
                  </p>
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const isActive = course.courseId === currentCourseId;
                  const info = registry[course.courseId];
                  const completedCount = Object.values(
                    course.data.exercises,
                  ).filter((ex) => ex.status === 'pass').length;
                  const totalExercises = 10; // Placeholder, in a real scenario we'd get this from registry
                  const progress = Math.min(
                    100,
                    Math.round((completedCount / totalExercises) * 100),
                  );

                  return (
                    <div
                      key={course.courseId}
                      onClick={() => handleCourseClick(course.courseId)}
                      className={`
                        relative bg-zinc-900/50 border rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden group
                        ${
                          isActive
                            ? 'border-rust/50 shadow-[0_0_15px_-5px_rgba(206,65,43,0.3)] opacity-100'
                            : 'border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-700 hover:bg-zinc-900'
                        }
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-rust text-[10px] font-black uppercase text-white rounded-bl-xl tracking-wider z-10">
                          Active
                        </div>
                      )}

                      {/* Progress Line */}
                      <div
                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ${isActive ? 'bg-rust' : 'bg-zinc-700 group-hover:bg-rust/50'}`}
                        style={{ width: `${progress}%` }}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-sm font-black transition-colors uppercase tracking-tight ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}
                            >
                              {course.courseId}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.5 bg-zinc-950/50 rounded-md border border-zinc-800">
                              {completedCount} solved
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium line-clamp-1 mb-3 group-hover:text-zinc-400 transition-colors">
                            {info?.description ||
                              'Interactive programming course'}
                          </p>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Trophy
                                className={`w-3.5 h-3.5 ${isActive ? 'text-rust-light' : 'text-zinc-600 group-hover:text-rust-light/70'} transition-colors`}
                              />
                              <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                {course.data.stats.totalXp} XP
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock
                                className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-zinc-600 group-hover:text-orange-400/70'} transition-colors`}
                              />
                              <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                {new Date(
                                  course.updatedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-lg font-black italic ${isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}
                          >
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rust animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Cloud Sync Active
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-medium italic">
              Total XP:{' '}
              {courses.reduce((acc, c) => acc + (c.data.stats.totalXp || 0), 0)}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
