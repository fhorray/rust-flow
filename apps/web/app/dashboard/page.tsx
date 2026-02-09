'use client';

import { useEffect, useState, Suspense } from 'react';
import { authClient } from 'lib/auth-client';
import { Button } from 'components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import {
  Loader2,
  Terminal,
  CreditCard,
  LogOut,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/ui/dialog';

function PaymentStatusHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('payment_success')) {
      toast.success('Payment successful! Updating your profile...', {
        duration: 5000,
      });
      authClient.getSession().then(() => {
        router.refresh();
      });
    }
  }, [searchParams, router]);

  return null;
}

type CourseProgress = {
  courseId: string;
  data: any;
  updatedAt: string;
};

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [progressList, setProgressList] = useState<CourseProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      fetchProgress();
    }
  }, [session]);

  const fetchProgress = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev'}/progress/list`,
        {
          headers: {
            Authorization: `Bearer ${session?.session.token}`,
          },
        },
      );
      if (res.ok) {
        const data = (await res.json()) as CourseProgress[];
        setProgressList(data);
      }
    } catch (e) {
      console.error('Failed to fetch progress', e);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleResetCourse = async (courseId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev'}/progress/reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.session.token}`,
          },
          body: JSON.stringify({ courseId }),
        },
      );

      if (res.ok) {
        toast.success('Course progress reset successfully');
        fetchProgress(); // Refresh list
      } else {
        toast.error('Failed to reset progress');
      }
    } catch (e) {
      toast.error('Error resetting progress');
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Signed out successfully');
          router.push('/');
        },
      },
    });
  };

  const handleBillingPortal = async () => {
    setIsLoadingBilling(true);
    try {
      const { data, error } = await authClient.subscription.billingPortal({
        customerType: 'user',
        returnUrl: `${process.env.NEXT_PUBLIC_WEB_URL || 'https://progy.dev'}/dashboard`,
        // locale: TODO add localization,
      });

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      console.error('Billing Portal Error:', error);
      toast.error('Billing portal unavailable', {
        description:
          error?.message ||
          'Please refresh the page and try again. If you just subscribed, wait a few seconds.',
      });
    } catch (e) {
      toast.error('An unexpected error occurred accessing the billing portal');
    } finally {
      setIsLoadingBilling(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  const plan = session.user.subscription || 'free';
  // @ts-ignore - Check for custom fields if better-auth types aren't updated yet
  const hasLifetime = session.user.hasLifetime || plan === 'lifetime';
  const isPro = plan === 'pro';

  // Logic: Can have BOTH
  const isDual = hasLifetime && isPro;
  const planLabel = isDual
    ? 'LIFETIME + PRO'
    : hasLifetime
      ? 'LIFETIME ACCESS'
      : isPro
        ? 'PRO MEMBERSHIP'
        : 'COMMUNITY';

  const planColor =
    isPro || hasLifetime
      ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 text-white border-primary/30'
      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  const handleCheckout = async (plan: 'pro' | 'lifetime') => {
    setIsLoadingBilling(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev'}/billing/checkout?plan=${plan}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.session.token}`,
          },
        },
      );

      const data = (await res.json()) as { url: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleMasterAIUpgrade = () => handleCheckout('pro');

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => router.push('/')}
          >
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">progy</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-6xl mx-auto space-y-12">
        <div className="mb-10">
          <Badge
            variant="outline"
            className="mb-4 border-primary/20 text-primary py-1 px-3 bg-primary/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase"
          >
            Management Console
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2 uppercase">
            Account.
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic">
            Manage your high-intensity developer license and cloud resources.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card className="bg-black/40 border-white/5 rounded-2xl p-2 transition-transform hover:-translate-y-1">
            <CardHeader className="p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">
                Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-lg tracking-tight uppercase italic">
                    {session.user.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 italic">
                    {session.user.email}
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                    ID: {session.user.id.substring(0, 12)}...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card
            className="bg-black/60 border-primary/20 relative overflow-hidden rounded-2xl p-2 shadow-[0_0_50px_-15px_rgba(251,146,60,0.1)] transition-transform hover:-translate-y-1"
            style={{ transitionDelay: '0.1s' }}
          >
            {(isPro || hasLifetime) && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
            )}

            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                License Status
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-[9px] items-center font-black px-3 py-1 border ${planColor} leading-none`}
              >
                {planLabel}
              </Badge>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0">
              <div className="mt-2 space-y-4">
                {plan === 'free' && !hasLifetime && (
                  <p className="text-[11px] text-muted-foreground font-bold italic leading-relaxed">
                    You are on the{' '}
                    <span className="text-white font-black">
                      COMMUNITY PLAN
                    </span>
                    . <br />
                    Access all free courses locally. Upgrade to unlock AI Mentor
                    and Cloud Sync.
                  </p>
                )}

                {hasLifetime && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Check className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                          Lifetime Access
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          Perpetual access to all current and future courses. No
                          monthly fees for content.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isPro && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                          Master AI Enabled
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          Unlimited AI Mentor access (explanations, hints,
                          generation). Recurring subscription.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              {isPro ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBillingPortal}
                  disabled={isLoadingBilling}
                  className="w-full border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] h-10 rounded-lg"
                >
                  {isLoadingBilling && (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  )}
                  Manage Subscription
                </Button>
              ) : hasLifetime ? (
                <Button
                  size="sm"
                  onClick={handleMasterAIUpgrade}
                  disabled={isLoadingBilling}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-500 hover:to-purple-700 text-[10px] font-black uppercase tracking-[0.2em] h-10 rounded-lg shadow-lg shadow-purple-900/20"
                >
                  {isLoadingBilling && (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  )}
                  Add Master AI ($8/mo)
                </Button>
              ) : (
                <Link href="/#pricing" className="w-full">
                  <Button
                    size="sm"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black uppercase tracking-[0.2em] h-10 rounded-lg"
                  >
                    Upgrade Now
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* My Learning Path */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              My Learning Path
            </h2>
            {/* <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold text-muted-foreground"><RefreshCw className="w-3 h-3 mr-2"/> Refresh</Button> */}
          </div>

          {loadingProgress ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-zinc-900/50 animate-pulse"
                ></div>
              ))}
            </div>
          ) : progressList.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
              <Terminal className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-zinc-400 mb-1">
                No Active Courses
              </h3>
              <p className="text-xs text-zinc-600 mb-6 max-w-xs mx-auto">
                Start a course using the CLI (`progy init`) to see it appear
                here.
              </p>
              <CopyButton text="npx progy init" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressList.map((course) => (
                <Card
                  key={course.courseId}
                  className="bg-zinc-900/40 border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-bold text-sm tracking-tight text-zinc-200">
                        {course.courseId}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-mono bg-zinc-800 text-zinc-500"
                      >
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    {/* <CardDescription className="text-xs">React + TypeScript</CardDescription> */}
                  </CardHeader>
                  <CardContent className="pb-4">
                    {(() => {
                      const completedEx = Object.keys(
                        course.data.exercises || {},
                      ).length;
                      const completedQuizzes = Object.keys(
                        course.data.quizzes || {},
                      ).length;
                      const total = course.data.stats?.totalExercises || 1; // Avoid division by zero
                      const percentage = Math.round(
                        (completedEx / total) * 100,
                      );
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                            <span>Progress</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary group-hover:bg-orange-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                            <span>
                              {completedEx} / {total} lessons
                            </span>
                            {completedQuizzes > 0 && (
                              <span>{completedQuizzes} quizzes</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-zinc-600 hover:text-red-400 hover:bg-red-500/10 uppercase font-bold tracking-wider"
                        >
                          <Trash2 className="w-3 h-3 mr-1.5" /> Reset
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-zinc-800 bg-black/90 backdrop-blur-xl">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Reset Course Progress?
                          </DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            This will permanently delete all your progress for{' '}
                            <strong>{course.courseId}</strong>. This action
                            cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {}}
                            className="border-zinc-700 text-zinc-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleResetCourse(course.courseId)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            Yes, Delete Progress
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* API Key / Quick Start */}
        <Card className="bg-black/40 border-white/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              Terminal Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-sm flex items-center justify-between">
              <span className="text-muted-foreground">$ npx progy init</span>
              <CopyButton text="npx progy init" />
            </div>
            <p className="text-xs text-muted-foreground">
              Run this command in your terminal to start a new course. Your
              subscription status is automatically synced when you log in via
              the CLI.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-white transition-colors"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Terminal className="w-4 h-4" />
      )}
    </button>
  );
}
