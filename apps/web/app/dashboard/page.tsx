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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 flex overflow-hidden">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950/20 backdrop-blur-xl hidden md:flex flex-col z-20 h-screen transition-all duration-300 ease-in-out shrink-0 sticky top-0">
        <div className="p-6 border-b border-white/5 h-14 flex items-center">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">progy</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
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

          <div className="px-3 mt-6 mb-2">
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

        <div className="p-4 border-t border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-[10px] font-black uppercase truncate italic">
                {session.user.name}
              </p>
              <Badge
                variant="outline"
                className="text-[7px] px-1 py-0 h-3 items-center border-primary/30 text-primary uppercase font-bold"
              >
                {plan.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        <header className="h-14 border-b border-white/5 bg-background/60 backdrop-blur-xl flex items-center px-6 justify-between md:justify-end shrink-0 sticky top-0 z-10 w-full">
          <div
            className="md:hidden flex items-center gap-2.5"
            onClick={() => router.push('/')}
          >
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">progy</span>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className={`text-[9px] items-center font-black px-2 py-0.5 border ${planColor} leading-none`}
            >
              {planLabel}
            </Badge>
          </div>
        </header>

        <main className="p-4 md:p-8 lg:p-12 max-w-5xl w-full mx-auto">
          {activeTab === 'overview' ? (
            <div className="space-y-12">
              <div>
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
                  Manage your high-intensity developer license and cloud
                  resources.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Identity Card simplified for overview */}
                <Card className="bg-black/40 border-white/5 rounded-2xl p-2">
                  <CardHeader className="p-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">
                      Developer Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-lg">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-sm uppercase italic tracking-tight">
                        {session.user.name}
                      </div>
                      {/* @ts-ignore */}
                      <div className="text-[10px] text-primary font-bold">
                        @{session.user.username || 'set-username'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Card */}
                <Card className="bg-black/60 border-primary/20 relative overflow-hidden rounded-2xl p-2 shadow-[0_0_50px_-15px_rgba(251,146,60,0.1)] transition-transform hover:-translate-y-1">
                  <CardHeader className="p-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                      License Status
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-4">
                      {plan === 'free' && !hasLifetime && (
                        <p className="text-[11px] text-muted-foreground font-bold italic leading-relaxed text-left">
                          You are on the{' '}
                          <span className="text-white font-black">
                            COMMUNITY PLAN
                          </span>
                          . Upgrade for AI Mentor and Sync.
                        </p>
                      )}
                      {(isPro || hasLifetime) && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-white uppercase italic">
                          <Check className="w-3.5 h-3.5 text-primary" /> Active
                          Premium Account
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    {isPro ? (
                      <Button
                        onClick={handleBillingPortal}
                        disabled={isLoadingBilling}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-black uppercase tracking-widest border-white/10 h-9"
                      >
                        Billing Portal
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCheckout('pro')}
                        disabled={isLoadingBilling}
                        size="sm"
                        className="w-full text-xs font-black uppercase tracking-widest bg-primary h-9"
                      >
                        Upgrade
                      </Button>
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
                    <h3 className="text-sm font-bold text-zinc-400 mb-1 text-center">
                      No Active Courses
                    </h3>
                    <p className="text-xs text-zinc-600 mb-6 max-w-xs mx-auto text-center">
                      Start a course using the CLI (`progy init`) to see it
                      appear here.
                    </p>
                    <div className="flex justify-center">
                      <CopyButton text="npx progy init" />
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressList.map((course) => (
                      <Card
                        key={course.courseId}
                        className="bg-zinc-900/40 border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 group"
                      >
                        <CardHeader className="pb-3 text-left">
                          <div className="flex justify-between items-start">
                            <CardTitle className="font-bold text-sm tracking-tight text-zinc-200 uppercase italic">
                              {course.courseId}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
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
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-black text-zinc-500 italic">
                                  <span>Progress</span>
                                  <span>{percentage}%</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden text-left">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
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
                                className="h-6 text-[9px] text-zinc-600 hover:text-red-400 uppercase font-bold tracking-widest"
                              >
                                Reset
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-white/10">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Reset Progress?
                                </DialogTitle>
                                <DialogDescription className="text-zinc-400 text-xs">
                                  Are you sure you want to delete all progress
                                  for {course.courseId}?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleResetCourse(course.courseId)
                                  }
                                  className="uppercase font-black text-[10px]"
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
            <div className="space-y-12">
              <div>
                <Badge
                  variant="outline"
                  className="mb-4 border-primary/20 text-primary py-1 px-3 bg-primary/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase"
                >
                  User Preferences
                </Badge>
                <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2 uppercase">
                  Profile.
                </h1>
                <p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic">
                  Your public identity in the Progy registry and learning
                  environment.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                  <Card className="bg-black/40 border-white/5 p-6 rounded-2xl">
                    <form onSubmit={handleUpdateUsername} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic text-left block">
                          Registry Username (Handle)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black">
                            @
                          </span>
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all uppercase placeholder:opacity-30"
                            placeholder="yourname"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic text-left">
                          This is your unique identifier for course publishing
                          and social features. Must be 3-20 characters.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isUpdatingUsername ||
                          // @ts-ignore
                          newUsername === session.user.username
                        }
                        className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-lg w-full md:w-auto"
                      >
                        {isUpdatingUsername && (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        )}
                        Update Username
                      </Button>
                    </form>
                  </Card>

                  <Card className="bg-zinc-950/40 border-white/5 p-6 rounded-2xl border-dashed border-2">
                    <div className="flex items-center gap-4 text-muted-foreground text-left">
                      <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                          Security & Privacy
                        </h3>
                        <p className="text-[10px] italic">
                          Your email{' '}
                          <span className="text-zinc-400">
                            ({session.user.email})
                          </span>{' '}
                          is private and never shared publicly.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 p-6 rounded-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-left">
                      Registry Preview
                    </h3>
                    <div className="flex items-center gap-3 p-4 bg-black/60 rounded-xl border border-white/5 shadow-2xl text-left">
                      <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center font-black text-primary">
                        {session.user.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase italic">
                          {session.user.name}
                        </div>
                        <div className="text-[12px] font-black text-primary italic">
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
  );
}
