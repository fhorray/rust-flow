'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import {
  Terminal,
  ChevronLeft,
  Copy,
  Check,
  BookOpen,
  Map,
  Zap,
  ShieldCheck,
  Rocket,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  name: string;
  path: string;
}

interface Module {
  id: string;
  title: string;
  exercises: Lesson[];
}

interface CourseData {
  name: string;
  scope: string;
  slug: string;
  latest: string;
  description: string;
  manifest: string | null;
  downloadUrl: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slugArray = params.slug as string[];
  const packageName = `@${slugArray.join('/')}`;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsedManifest: Module[] = course?.manifest
    ? JSON.parse(course.manifest)
    : [];

  useEffect(() => {
    fetchCourseDetails();
  }, [packageName]);

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
  }, [loading, course]);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev'}/registry/resolve/${encodeURIComponent(packageName)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as CourseData;
        setCourse(data);
      } else {
        setError('Course not found in the registry.');
      }
    } catch (e) {
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const initCommand = `npx progy@latest init ${course?.name}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(initCommand);
    setCopied(true);
    toast.success('Command copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          FETCHING COURSE DATA...
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter italic mb-2">
          Error Loading Course
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8 italic">
          {error || 'Unknown error'}
        </p>
        <Link href="/courses">
          <Button
            variant="outline"
            className="border-white/10 text-[10px] font-black tracking-widest uppercase rounded-xl h-11 px-8"
          >
            <ChevronLeft className="w-3 h-3 mr-2" /> Back to Registry
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Registry
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">progy</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <section className="reveal">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-primary py-0.5 px-3 bg-primary/5 text-[9px] font-black tracking-widest uppercase"
                  >
                    COURSE v{course.latest}
                  </Badge>
                  {course.name.startsWith('@progy/') && (
                    <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black tracking-widest uppercase">
                      OFFICIAL
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase mb-6 leading-none">
                  {course.name.split('/')[1]}
                </h1>

                <div className="flex items-center gap-3 text-muted-foreground mb-8">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase text-primary">
                    {course.scope.charAt(0)}
                  </div>
                  <span className="text-[11px] font-black tracking-widest uppercase italic bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                    Built by @{course.scope}
                  </span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed italic max-w-2xl">
                  {course.description ||
                    'Learn everything you need about this topic through high-intensity, local-first exercises.'}
                </p>
              </section>

              {/* Curriculum */}
              <section className="reveal" style={{ transitionDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-8">
                  <Map className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em]">
                    Course Curriculum
                  </h2>
                </div>

                {parsedManifest.length > 0 ? (
                  <div className="space-y-4">
                    {parsedManifest.map((module, idx) => (
                      <div
                        key={module.id}
                        className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black opacity-30">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <h3 className="text-[11px] font-black uppercase tracking-widest italic">
                              {module.title}
                            </h3>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-white/10 text-[8px] font-black opacity-50"
                          >
                            {module.exercises.length} LESSONS
                          </Badge>
                        </div>
                        <div className="p-4 space-y-1">
                          {module.exercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors"></div>
                                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                  {ex.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 border border-white/5 border-dashed rounded-3xl text-center">
                    <BookOpen className="w-8 h-8 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                      Full Curriculum not indexed for this version.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Right: Sidebar / Sticky Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="p-8 bg-black border border-white/10 rounded-3xl shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] -mr-10 -mt-10"></div>

                  <Badge className="bg-primary/20 text-primary border-primary/20 mb-6 px-2 py-0.5 text-[8px] font-black tracking-widest uppercase">
                    DOCKER NATIVE
                  </Badge>

                  <h3 className="text-lg font-black italic tracking-tight uppercase mb-4 leading-none">
                    Start Learning <br /> Now.
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        Runs entirely in your local terminal.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        Automated verification of your progress.
                      </p>
                    </div>
                  </div>

                  {/* CLI Command Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
                    <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest text-muted-foreground flex justify-between">
                      <span>TERMINAL</span>
                      <Terminal className="w-2.5 h-2.5 opacity-40" />
                    </div>
                    <div
                      onClick={handleCopy}
                      className="p-4 flex items-center justify-between cursor-pointer group/cmd"
                    >
                      <code className="text-[11px] font-mono whitespace-nowrap overflow-x-auto text-primary scrollbar-none">
                        {initCommand}
                      </code>
                      <div className="ml-3 shrink-0">
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground group-hover/cmd:text-foreground transition-all" />
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCopy}
                    size="lg"
                    className="w-full h-12 bg-primary text-primary-foreground font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:shadow-primary/20 hover:shadow-[0_0_30px_-5px] transition-all"
                  >
                    <Rocket className="w-4 h-4 mr-2" />{' '}
                    {copied ? 'COPIED!' : 'GET STARTED'}
                  </Button>
                </div>

                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">
                    STATS
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="text-xl font-black italic tracking-tighter leading-none">
                        {parsedManifest.length}
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
                        Modules
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="text-xl font-black italic tracking-tighter leading-none">
                        {parsedManifest.reduce(
                          (acc, m) => acc + m.exercises.length,
                          0,
                        )}
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
                        Lessons
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
