"use client";

import { useEffect, useState, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Terminal, CreditCard, LogOut, Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentStatusHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("payment_success")) {
      toast.success("Payment successful! Updating your profile...", {
        duration: 5000,
      });
      authClient.getSession().then(() => {
        router.refresh();
      });
    }
  }, [searchParams, router]);

  return null;
}

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/");
        },
      },
    });
  };


  const handleBillingPortal = async () => {
    setIsLoadingBilling(true);
    try {
      const { data } = await authClient.subscription.billingPortal();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not redirect to billing portal");
      }
    } catch (error) {
      toast.error("Failed to access billing portal");
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
    router.push("/auth/signin");
    return null;
  }

  const plan = session.user.subscription || "free";
  const isLifetime = plan === "lifetime";
  const isPro = plan === "pro";

  const planLabel = isPro ? "PRO" : isLifetime ? "LIFETIME" : "FREE";

  const planColor = isPro
    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
    : isLifetime
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  const handleCheckout = async (plan: "pro" | "lifetime") => {
    setIsLoadingBilling(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.progy.dev"}/api/billing/checkout?plan=${plan}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session.token}`
          // Better auth client usually handles cookies. My backend verifySession checks headers OR better-auth cookies.
          // Since this is a client component, I should rely on cookies being sent automatically.
        },
      });

      const data = await res.json() as { url: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start checkout");
      }
    } catch (error) {
      toast.error("Failed to start checkout");
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleMasterAIUpgrade = () => handleCheckout("pro");
  const handleLifetimeUpgrade = () => handleCheckout("lifetime");

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => router.push("/")}>
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">progy</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="mb-10">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary py-1 px-3 bg-primary/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase">
            Management Console
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2 uppercase">Account.</h1>
          <p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic">
            Manage your high-intensity developer license and cloud resources.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card className="bg-black/40 border-white/5 rounded-2xl p-2 transition-transform hover:-translate-y-1">
            <CardHeader className="p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">Identity</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-lg tracking-tight uppercase italic">{session.user.name}</div>
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 italic">{session.user.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-black/60 border-primary/20 relative overflow-hidden rounded-2xl p-2 shadow-[0_0_50px_-15px_rgba(251,146,60,0.1)] transition-transform hover:-translate-y-1" style={{ transitionDelay: '0.1s' }}>
            {isPro && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>}
            {isLifetime && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16"></div>}

            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">License</CardTitle>
              <Badge variant="outline" className={`text-[9px] items-center font-black px-3 py-1 border ${planColor} leading-none`}>
                {planLabel}
              </Badge>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0">
              <div className="mt-2 space-y-4">
                {plan === "free" && (
                  <p className="text-[11px] text-muted-foreground font-bold italic leading-relaxed">
                    You are on the <span className="text-white font-black">COMMUNITY PLAN</span>. <br />
                    Access all free courses locally. Upgrade for AI Mentor.
                  </p>
                )}
                {isLifetime && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                      LIFETIME ACCESS <span className="text-primary">ACTIVE</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 leading-relaxed italic">
                      Enjoy perpetual access to all current and future courses. <br />
                      <span className="text-white font-bold opacity-100">AI Note:</span> Personal API Key required for AI functions.
                    </p>
                  </div>
                )}
                {isPro && (
                  <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                    PRO MEMBERSHIP <span className="text-purple-400">ACTIVE</span>
                  </p>
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
                  {isLoadingBilling && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                  Manage Billing
                </Button>
              ) : isLifetime ? (
                <Button
                  size="sm"
                  onClick={handleMasterAIUpgrade}
                  disabled={isLoadingBilling}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black uppercase tracking-[0.2em] h-10 rounded-lg shadow-lg shadow-primary/20"
                >
                  {isLoadingBilling && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                  Upgrade to Master AI ($8/mo)
                </Button>
              ) : (
                <Link href="/#pricing" className="w-full">
                  <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black uppercase tracking-[0.2em] h-10 rounded-lg">
                    Upgrade Now
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>

          {/* API Key / Quick Start - Only for Standard/Pro users could see API keys if we had them, or instructions */}
          <Card className="bg-black/40 border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Terminal Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                <span className="text-muted-foreground">$ npx progy init</span>
                <CopyButton text="npx progy init" />
              </div>
              <p className="text-xs text-muted-foreground">
                Run this command in your terminal to start a new course. Your subscription status is automatically synced when you log in via the CLI.
              </p>
            </CardContent>
          </Card>
        </div>
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
    <button onClick={handleCopy} className="text-muted-foreground hover:text-white transition-colors">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Terminal className="w-4 h-4" />}
    </button>
  );
}
