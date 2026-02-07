"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Terminal, CreditCard, LogOut, Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

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

  // @ts-ignore - subscription type not fully inferred yet
  const plan = session.user.subscription || "free";
  const planLabel = plan === "pro" ? "PRO" : plan === "standard" ? "STANDARD" : "FREE";
  const planColor = plan === "pro" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : plan === "standard" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => router.push("/")}>
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">progy</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your subscription and access credentials.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold">{session.user.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{session.user.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-black/40 border-white/10 relative overflow-hidden">
            {plan === 'pro' && <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Current Plan</CardTitle>
              <Badge variant="outline" className={`text-[10px] items-center font-black px-2 py-0.5 border ${planColor}`}>
                {planLabel}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                {plan === "free" && (
                  <p className="text-sm text-muted-foreground">
                    You are on the <span className="text-white font-bold">Community Plan</span>. Upgrade to unlock full AI capabilities.
                  </p>
                )}
                {plan === "standard" && (
                  <p className="text-sm text-muted-foreground">
                    You own the <span className="text-blue-400 font-bold">Standard License</span>. Use your own API key in the generic CLI.
                  </p>
                )}
                {plan === "pro" && (
                  <p className="text-sm text-muted-foreground">
                    You are a <span className="text-purple-400 font-bold">Pro Member</span>. Enjoy unlimited AI access and cloud sync.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {plan !== "free" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBillingPortal}
                  disabled={isLoadingBilling}
                  className="w-full border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest"
                >
                  {isLoadingBilling && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                  Manage Subscription
                </Button>
              ) : (
                <Link href="/#pricing" className="w-full">
                  <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black uppercase tracking-widest">
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
