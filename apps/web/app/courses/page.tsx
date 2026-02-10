'use client';

import { useEffect, useState } from 'react';
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  // Scroll Reveal Logic
  useEffect(() => {
    if (loading) return;
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 },
    );

    reveals.forEach((reveal) => observer.observe(reveal));
    return () => reveals.forEach((reveal) => observer.unobserve(reveal));
  }, [loading, courses]);

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">progy</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="reveal">
            <Badge
              variant="outline"
              className="mb-4 border-primary/20 text-primary py-1 px-4 backdrop-blur-md bg-primary/5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase"
            >
              COMMUNITY REGISTRY
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">
              Explore <span className="text-primary">Courses.</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl text-sm italic">
              Discover high-intensity courses built by the community. Zero
              setup, local-first, native performance.
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search courses..."
              className="pl-10 h-11 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Loading Registry...
            </p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group border-white/5 bg-black/40 hover:bg-black/60 transition-all hover:border-primary/20 shadow-2xl overflow-hidden flex flex-col"
              >
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    {course.name.startsWith('@progy/') && (
                      <Badge className="bg-primary/20 text-primary border-primary/20 text-[8px] font-black tracking-widest uppercase">
                        OFFICIAL
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-black italic tracking-tight group-hover:text-primary transition-colors">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="text-xs italic leading-relaxed line-clamp-2 mt-2">
                    {course.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex-grow">
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> PUBLIC
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-white/10 text-[8px] h-4 leading-none"
                      >
                        {course.latestVersion}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link
                    href={`/courses/${course.name.substring(1)}`}
                    className="w-full"
                  >
                    <Button className="w-full bg-white/5 hover:bg-primary hover:text-primary-foreground border-white/10 font-black text-[10px] tracking-[0.2em] uppercase rounded-lg h-10 group/btn">
                      VIEW DETAILS{' '}
                      <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center reveal">
            <Ghost className="w-16 h-16 text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">
              No Courses Found
            </h3>
            <p className="text-muted-foreground text-sm italic max-w-xs">
              We couldn't find any courses matching "{search}".
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
