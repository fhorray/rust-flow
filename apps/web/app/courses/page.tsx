'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lib/auth-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Badge } from 'components/ui/badge';
import {
  Search,
  BookOpen,
  Terminal,
  ChevronRight,
  Loader2,
  Globe,
  Ghost,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  latestVersion: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const { data: session } = authClient.useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev'}/registry`,
      );
      if (res.ok) {
        const data = (await res.json()) as { courses: Course[] };
        setCourses(data.courses);
      }
    } catch (e) {
      console.error('Failed to fetch courses', e);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 bg-background/60 backdrop-blur-xl border border-white/5 px-6 h-16 rounded-full flex items-center justify-between shadow-2xl">
        <Link
          href="/"
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
            <Terminal className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">progy</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors italic"
          >
            Dashboard
          </Link>

          {session?.user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-1 pr-4 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-black uppercase italic tracking-widest text-foreground group-hover:text-primary transition-colors">
                {session.user.name?.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="h-8 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 px-2">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 border-primary/20 text-primary py-1 px-4 backdrop-blur-md bg-primary/5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase"
            >
              COMMUNITY REGISTRY
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-[0.9]">
              Explore{' '}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                Courses.
              </span>
            </h1>
            <p className="mt-6 text-muted-foreground text-base italic leading-relaxed opacity-70">
              Discover high-intensity courses built by the community. Zero
              setup, local-first, native performance.
            </p>
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search registry courses..."
              className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 text-sm font-bold italic transition-all placeholder:opacity-30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
              SYNCING REGISTRY...
            </p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group border-white/5 bg-black/40 hover:bg-black/80 transition-all hover:-translate-y-1 hover:border-primary/30 shadow-2xl rounded-3xl overflow-hidden flex flex-col p-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="p-7 relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 shadow-[0_0_15px_rgba(251,146,60,0.2)]" />
                    </div>
                    {course.name.startsWith('@progy/') && (
                      <Badge className="bg-primary/20 text-primary border-primary/20 text-[8px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full backdrop-blur-md">
                        OFFICIAL
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-black italic tracking-tighter group-hover:text-primary transition-colors uppercase">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="text-xs italic leading-relaxed line-clamp-2 mt-4 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors">
                    {course.description ||
                      'No description provided for this high-intensity course.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-7 pb-8 flex-grow relative z-10">
                  <div className="flex items-center gap-5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-primary/60" /> PUBLIC
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />{' '}
                      VERIFIED
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-7 pt-0 relative z-10">
                  <Link
                    href={`/courses/${course.name.substring(1)}`}
                    className="w-full"
                  >
                    <Button className="w-full bg-white/5 hover:bg-primary hover:text-primary-foreground border-white/10 font-black text-[10px] tracking-[0.2em] uppercase rounded-xl h-12 group/btn transition-all shadow-lg hover:shadow-primary/30 text-white">
                      INITIALIZE ENGINE
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/2 border border-dashed border-white/5 rounded-[3rem]">
            <Ghost className="w-20 h-20 text-muted-foreground/10 mb-8" />
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-3 opacity-60">
              Zero results found
            </h3>
            <p className="text-muted-foreground text-sm italic max-w-sm mx-auto opacity-40">
              We couldn't locate any high-intensity engines matching "{search}"
              in the registry.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
