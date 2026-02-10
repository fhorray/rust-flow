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
  CreditCard,
  LogOut,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Settings,
  LayoutDashboard,
  User,
  ChevronRight,
  ShieldCheck,
  Copy,
  Terminal,
  Globe,
  Rocket,
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

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${active ? 'bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
    >
      <div
        className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest italic flex-1 text-left">
        {label}
      </span>
      {active && <ChevronRight className="w-3 h-3 opacity-50" />}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold gap-2 px-3 rounded-lg"
    >
      {copied ? (
        <Check className="w-3 h-3 text-primary" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {text}
    </Button>
  );
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

  // Scroll Reveal Logic
  useEffect(() => {
    if (isPending) return;
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
  }, [isPending, session]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

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

  const [activeTab, setActiveTab] = useState<
    'overview' | 'settings' | 'registry'
  >('overview');
  const [newUsername, setNewUsername] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  useEffect(() => {
    if (session?.user?.username) {
      setNewUsername(session.user.username);
    }
  }, [session]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) return;

    setIsUpdatingUsername(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev'}/user/update-username`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.session.token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        },
      );

      const data = (await res.json()) as { error?: string };

      if (res.ok) {
        toast.success('Username updated successfully!');
        // Refresh session to get updated username
        await authClient.getSession();
      } else {
        toast.error(data.error || 'Failed to update username');
      }
    } catch (e) {
      toast.error('Error updating username');
    } finally {
      setIsUpdatingUsername(false);
    }
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 overflow-x-hidden">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8 py-6 md:py-10">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex flex-col shrink-0">
            <div
              className="flex items-center gap-2.5 cursor-pointer mb-10 reveal"
              onClick={() => router.push('/')}
            >
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-base tracking-tight">progy</span>
            </div>

            <div
              className="space-y-1 reveal"
              style={{ transitionDelay: '0.1s' }}
            >
              <div className="px-3 mb-2">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                  Main
                </h2>
              </div>
              <SidebarItem
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Overview"
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
              <SidebarItem
                icon={<User className="w-4 h-4" />}
                label="Profile Settings"
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />
              <SidebarItem
                icon={<Globe className="w-4 h-4" />}
                label="Community Registry"
                onClick={() => router.push('/courses')}
              />

              <div className="px-3 mt-8 mb-2">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                  Account
                </h2>
              </div>
              <SidebarItem
                icon={<LogOut className="w-4 h-4" />}
                label="Sign Out"
                onClick={handleSignOut}
              />
            </div>

            <div
              className="mt-12 p-5 bg-white/5 border border-white/5 rounded-3xl reveal"
              style={{ transitionDelay: '0.2s' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black uppercase truncate italic mb-1">
                    {session.user.name}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[7px] px-1.5 py-0 h-4 border ${planColor.replace('border-', 'border-')}/50 text-foreground uppercase font-bold`}
                  >
                    {planLabel}
                  </Badge>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <main className="reveal" style={{ transitionDelay: '0.15s' }}>
              {activeTab === 'overview' ? (
                <div className="space-y-10">
                  <header>
                    <Badge
                      variant="outline"
                      className="mb-4 border-primary/20 text-primary py-1 px-3 bg-primary/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase"
                    >
                      Management Console
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2 uppercase leading-none">
                      Dashboard.
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic">
                      Manage your high-intensity developer license and cloud
                      resources.
                    </p>
                  </header>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Identity Card simplified for overview */}
                    <Card className="bg-white/5 border-white/5 rounded-3xl p-2 group hover:bg-white/10 transition-colors">
                      <CardHeader className="p-6">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">
                          Developer Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-0 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-base uppercase italic tracking-tight">
                            {session.user.name}
                          </div>
                          {/* @ts-ignore */}
                          <div className="text-[11px] text-primary font-bold">
                            @{session.user.username || 'set-username'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Subscription Card */}
                    <Card className="bg-black/60 border-primary/30 relative overflow-hidden rounded-3xl p-2 shadow-[0_0_50px_-15px_rgba(251,146,60,0.1)] transition-all hover:-translate-y-1">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10"></div>

                      <CardHeader className="p-6">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                          License Status
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-6 pb-6 pt-0 relative z-10">
                        <div className="space-y-4">
                          {plan === 'free' && !hasLifetime && (
                            <p className="text-[11px] text-muted-foreground font-bold italic leading-relaxed">
                              You are on the{' '}
                              <span className="text-white font-black">
                                COMMUNITY PLAN
                              </span>
                              . Upgrade for AI Mentor and Sync.
                            </p>
                          )}
                          {(isPro || hasLifetime) && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white uppercase italic">
                              <ShieldCheck className="w-4 h-4 text-primary" />{' '}
                              Active Premium Account
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-6 pt-0 relative z-10">
                        {isPro ? (
                          <Button
                            onClick={handleBillingPortal}
                            disabled={isLoadingBilling}
                            size="sm"
                            variant="outline"
                            className="w-full text-xs font-black uppercase tracking-widest border-white/10 h-10 rounded-xl"
                          >
                            Billing Portal
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleCheckout('pro')}
                            disabled={isLoadingBilling}
                            size="sm"
                            className="w-full text-xs font-black uppercase tracking-widest bg-primary h-10 rounded-xl shadow-lg shadow-primary/20"
                          >
                            <Rocket className="w-3.5 h-3.5 mr-2" /> Upgrade
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>

                  {/* My Learning Path */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-5">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                        My Learning Path
                      </h2>
                    </div>

                    {loadingProgress ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-32 rounded-3xl bg-white/5 animate-pulse"
                          ></div>
                        ))}
                      </div>
                    ) : progressList.length === 0 ? (
                      <div className="text-center py-16 bg-white/2 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
                        <Terminal className="w-12 h-12 text-white/5 mx-auto mb-5" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
                          No Active Courses
                        </h3>
                        <p className="text-[10px] text-muted-foreground/40 mb-8 max-w-xs mx-auto italic">
                          Start a course using the CLI (`progy init`) or browse
                          the registry to see it appear here.
                        </p>
                        <div className="flex justify-center">
                          <CopyButton text="npx progy init" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-5">
                        {progressList.map((course) => (
                          <Card
                            key={course.courseId}
                            className="bg-white/5 border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 group rounded-3xl p-1"
                          >
                            <CardHeader className="p-6 pb-3">
                              <CardTitle className="font-black text-sm tracking-tight text-white uppercase italic group-hover:text-primary transition-colors">
                                {course.courseId}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 pb-5">
                              {(() => {
                                const completedEx = Object.keys(
                                  course.data.exercises || {},
                                ).length;
                                const total =
                                  course.data.stats?.totalExercises || 1;
                                const percentage = Math.round(
                                  (completedEx / total) * 100,
                                );
                                return (
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-[9px] uppercase font-black text-muted-foreground tracking-widest italic">
                                      <span>Progress</span>
                                      <span className="text-primary">
                                        {percentage}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary shadow-[0_0_10px_oklch(var(--primary))]"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                            <CardFooter className="p-6 pt-0 flex justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[8px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 uppercase font-black tracking-widest rounded-lg px-3"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1.5" /> Reset
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-white uppercase font-black italic tracking-tight">
                                      Reset Progress?
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground text-xs italic">
                                      Are you sure you want to delete all
                                      progress for {course.courseId}? This
                                      cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter className="mt-6 gap-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleResetCourse(course.courseId)
                                      }
                                      className="uppercase font-black text-[10px] rounded-xl h-10 px-6"
                                    >
                                      Confirm Reset
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
                </div>
              ) : (
                <div className="space-y-10">
                  <header>
                    <Badge
                      variant="outline"
                      className="mb-4 border-primary/20 text-primary py-1 px-3 bg-primary/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase"
                    >
                      User Preferences
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2 uppercase leading-none">
                      Profile.
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic">
                      Your public identity in the Progy registry and learning
                      environment.
                    </p>
                  </header>

                  <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                      <Card className="bg-white/5 border-white/5 p-8 rounded-3xl">
                        <form
                          onSubmit={handleUpdateUsername}
                          className="space-y-8"
                        >
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic block">
                              Registry Username (Handle)
                            </label>
                            <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">
                                @
                              </span>
                              <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-base font-black italic focus:border-primary/50 outline-none transition-all uppercase placeholder:opacity-20"
                                placeholder="yourname"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic leading-none pl-1">
                              This is your unique identifier for course
                              publishing.
                            </p>
                          </div>

                          <Button
                            type="submit"
                            disabled={
                              isUpdatingUsername ||
                              // @ts-ignore
                              newUsername === session.user.username
                            }
                            className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl w-full md:w-auto shadow-lg shadow-primary/20"
                          >
                            {isUpdatingUsername ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Settings className="w-4 h-4 mr-2" />
                            )}
                            Update Username
                          </Button>
                        </form>
                      </Card>

                      <Card className="bg-white/2 border-white/5 p-6 rounded-3xl border-dashed">
                        <div className="flex items-center gap-5 text-muted-foreground text-left">
                          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-primary shrink-0 opacity-50" />
                          </div>
                          <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/80 mb-1">
                              Security & Privacy
                            </h3>
                            <p className="text-[10px] italic leading-tight text-muted-foreground/60">
                              Your email{' '}
                              <span className="text-primary/70">
                                ({session.user.email})
                              </span>{' '}
                              is private and never shared publicly.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-muted-foreground/40">
                          Registry Preview
                        </h3>
                        <div className="flex items-center gap-4 p-5 bg-black/60 rounded-2xl border border-white/5 shadow-2xl relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center font-black text-primary text-lg">
                            {session.user.name?.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[11px] font-black uppercase italic tracking-tight truncate">
                              {session.user.name}
                            </div>
                            <div className="text-[14px] font-black text-primary italic leading-none">
                              @{newUsername || 'username'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
