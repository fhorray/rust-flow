'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Check,
  Code,
  Cpu,
  Globe,
  Rocket,
  Terminal,
  Zap,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Copy,
  ChevronRight,
  Layers,
  Command,
  Laptop,
  Monitor,
  AppWindow,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useStore } from '@nanostores/react';
import { $checkoutMutation } from '@/stores/billing-store';
import { Navbar } from '@/components/navbar';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useState } from 'react';

export default function Home() {
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const { session, signIn, isPro, isLifetime } = useAuth();
  const checkoutState = useStore($checkoutMutation as any);
  const scrollRef = useScrollReveal();

  const handleLifetimeCheckout = async () => {
    if (!session) {
      signIn();
      return;
    }
    try {
      const res = await $checkoutMutation.mutate({
        plan: 'lifetime',
        token: session.session?.token,
      });
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleProCheckout = async () => {
    setIsLoadingPro(true);
    try {
      if (!session) {
        signIn();
        return;
      }
      const res = await $checkoutMutation.mutate({
        plan: 'pro',
        token: session.session?.token || '',
      });
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.error('Failed to start subscription');
      }
    } catch {
      toast.error('Failed to start subscription');
    } finally {
      setIsLoadingPro(false);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="min-h-screen bg-background font-sans selection:bg-primary/20 overflow-x-hidden"
    >
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden">
          {/* Glow Scene */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="spotlight opacity-30 md:opacity-40"></div>
            <div className="glow-orb w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary -top-20 -left-20 md:-top-40 md:-left-40 animate-glow"></div>
            <div
              className="glow-orb w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-orange-600 bottom-0 -right-10 md:-right-20 animate-glow"
              style={{ animationDelay: '-3s' }}
            ></div>
          </div>

          {/* Floating Icons */}
          <div className="absolute top-32 left-10 md:left-40 animate-float opacity-10 hidden lg:block">
            <Code className="w-10 h-10 text-primary" />
          </div>
          <div
            className="absolute bottom-32 right-10 md:right-40 animate-float opacity-10 hidden lg:block"
            style={{ animationDelay: '4s' }}
          >
            <Terminal className="w-12 h-12 text-primary" />
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center relative z-10">
            <div data-reveal className="scroll-reveal">
              <Badge
                variant="outline"
                className="mb-6 border-primary/20 text-primary py-1 px-4 backdrop-blur-md bg-primary/5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase"
              >
                {'BUILD \u2022 SOLVE \u2022 VERIFY'}
              </Badge>
            </div>

            <h1
              data-reveal
              className="scroll-reveal text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 max-w-4xl leading-[1.05] text-balance"
            >
              Master Code <br />
              <span className="text-primary italic">Locally.</span>
            </h1>

            <p
              data-reveal
              className="scroll-reveal stagger-1 text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              The developer platform for high-intensity, terminal-first
              learning. <br className="hidden md:block" />
              Free for the community. Build any course, in any language.
            </p>

            {/* Value Propositions */}
            <div
              data-reveal
              className="scroll-reveal stagger-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10"
            >
              {[
                { icon: <Layers className="w-3.5 h-3.5" />, text: 'Git-Native Courses' },
                { icon: <Globe className="w-3.5 h-3.5" />, text: 'Any Language' },
                { icon: <Zap className="w-3.5 h-3.5" />, text: 'Real-Time Feedback' },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: 'Docker Isolation' },
                { icon: <BrainCircuit className="w-3.5 h-3.5" />, text: 'AI Mentor' },
              ].map((prop) => (
                <div
                  key={prop.text}
                  className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest"
                >
                  <span className="text-primary">{prop.icon}</span>
                  {prop.text}
                </div>
              ))}
            </div>

            {/* CLI Box */}
            <div
              data-reveal
              className="scroll-reveal stagger-3 w-full max-w-sm md:max-w-md mb-10 group cursor-pointer mx-auto"
              onClick={() => {
                navigator.clipboard.writeText('npx progy@latest');
                toast.success('Copied to clipboard!');
              }}
            >
              <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-2xl transition-all group-hover:border-primary/40 group-hover:shadow-primary/5 group-hover:shadow-[0_0_40px_-5px]">
                <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-muted/50 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400/40"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400/40"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400/40"></div>
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                    <Command className="w-2.5 h-2.5" /> PROGY_TERMINAL
                  </div>
                </div>
                <div className="p-4 md:p-5 font-mono text-[11px] sm:text-[13px] md:text-sm flex items-center justify-between overflow-x-auto">
                  <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
                    <span className="text-primary opacity-50">$</span>
                    <span className="text-foreground">npx progy@latest</span>
                  </div>
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div
              data-reveal
              className="scroll-reveal stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12"
            >
              <Button
                size="lg"
                className="h-11 w-full sm:w-auto px-8 text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground rounded-lg hover:shadow-primary/20 hover:shadow-[0_0_20px_0] transition-all"
                onClick={signIn}
              >
                Get Started Free
              </Button>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full sm:w-auto px-8 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg border-border hover:bg-muted transition-colors"
                >
                  Read the Docs <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div
              data-reveal
              className="scroll-reveal stagger-5 flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border"
            >
              {[
                { value: '\u221E', label: 'Languages Supported' },
                { value: '3', label: 'Runner Types' },
                { value: '0ms', label: 'Cloud Required' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl md:text-2xl font-black text-foreground tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inside the App (Mockup Gallery) */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 skew-up bg-card/40 border-y border-border -z-10 bg-grid-white/[0.02]"></div>
          <div className="max-w-6xl mx-auto px-4 md:px-6 unskew-neg relative z-10">
            <div data-reveal className="scroll-reveal text-center mb-12 md:mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-2 py-0.5 text-[9px] uppercase font-black tracking-[0.2em]">
                THE EXPERIENCE
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black italic mb-4 tracking-tight uppercase text-balance">
                Focus Mode, On.
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
                A zero-distraction environment where documentation,
                requirements, and verification live right where your code does.
              </p>
            </div>

            <div
              data-reveal
              className="scroll-reveal stagger-2 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 max-w-5xl mx-auto"
            >
              <div className="md:col-span-3 aspect-[16/10] bg-card rounded-xl border border-border overflow-hidden shadow-2xl relative group min-h-[240px]">
                <Image
                  src="/progy_app_mockup_1770436151556.png"
                  alt="Progy Interface - Terminal-first learning environment"
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-4 left-4 flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-1 md:flex md:flex-col gap-3 md:gap-4">
                {[
                  { icon: Laptop, label: 'Local Host', sub: 'Your IDE' },
                  { icon: Monitor, label: 'Interactive', sub: 'Live AI' },
                  { icon: AppWindow, label: 'Multi-view', sub: 'Workspace' },
                ].map((item) => (
                  <div
                    key={item.sub}
                    className="flex-1 bg-muted/50 rounded-xl border border-border flex flex-col items-center justify-center p-3 md:p-6 text-center group hover:bg-primary/5 hover:border-primary/20 transition-all"
                  >
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary/60 mb-2 md:mb-3 group-hover:text-primary transition-colors" />
                    <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 leading-none">
                      {item.label}
                    </p>
                    <p className="text-[10px] md:text-[11px] font-bold">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <section id="how-it-works" className="relative py-20 md:py-32">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="glow-orb w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-primary/20 top-1/2 -right-10 md:-right-20 -translate-y-1/2 animate-glow"></div>
          </div>
          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
              <div className="lg:w-1/2">
                <h2
                  data-reveal
                  className="scroll-reveal text-3xl md:text-4xl font-black mb-6 md:mb-8 italic leading-tight tracking-tight uppercase text-balance"
                >
                  Elite Flow. <br className="hidden md:block" /> Zero Friction.
                </h2>
                <div className="space-y-8 md:space-y-10">
                  {[
                    {
                      icon: Layers,
                      step: '1. Select Your Goal',
                      desc: 'Browse the community library or initialize from any public repository. Own your path.',
                    },
                    {
                      icon: Rocket,
                      step: '2. One Command Init',
                      desc: 'Run `npx progy init -c [course]`. Everything is configured locally in seconds.',
                    },
                    {
                      icon: Zap,
                      step: '3. Real-time Verify',
                      desc: "Start coding. Save your progress and click 'Run tests' to verify your solution instantly.",
                    },
                  ].map((item, i) => (
                    <div
                      key={item.step}
                      data-reveal
                      className={`scroll-reveal stagger-${i + 1} flex gap-4 md:gap-5`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0 text-primary transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black mb-1.5 uppercase tracking-[0.1em]">
                          {item.step}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                data-reveal
                className="scroll-reveal stagger-3 lg:w-1/2 w-full"
              >
                <div className="p-6 md:p-8 bg-card border border-border rounded-2xl relative overflow-hidden shadow-3xl">
                  <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-primary/5 rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 blur-[40px]"></div>
                  <div className="relative space-y-3 font-mono text-[11px] md:text-[12px]">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <ChevronRight className="w-4 h-4" /> progy init -c rust
                    </div>
                    <div className="pl-6 text-muted-foreground/80 leading-loose">
                      {'✔ Connecting to Progy Hub...'} <br />
                      {'✔ Cloning Course: Rust Mastery'} <br />
                      {'✔ Preparing local workspace...'} <br />
                      {'✔ Server started on '}
                      <span className="text-green-400">localhost:3000</span>
                      <br />
                      <br />
                      <span className="text-foreground font-bold">
                        {'Solving task 01: '}
                        <span className="text-primary italic">intro/hello.rs</span>
                      </span>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                      <div className="text-[8px] md:text-[9px] text-muted-foreground font-sans font-black uppercase tracking-widest">
                        Local-First Active
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-20 md:py-24 overflow-hidden">
          <div className="absolute inset-0 skew-down bg-card border-y border-border -z-10 shadow-[0_0_100px_-50px_rgba(251,146,60,0.2)]"></div>
          <div className="max-w-6xl mx-auto px-4 md:px-6 unskew relative z-10">
            <div data-reveal className="scroll-reveal mb-12 md:mb-20">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-2 py-0.5 text-[9px] uppercase font-black tracking-[0.2em]">
                SPECIFICATIONS
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 uppercase">
                Elite Stack.
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic font-medium">
                High-performance tools for engineers who demand the best.
              </p>
            </div>

            <div
              data-reveal
              className="scroll-reveal stagger-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border overflow-hidden rounded-xl"
            >
              {[
                { icon: <Cpu className="w-5 h-5 md:w-6 md:h-6 text-primary" />, title: 'LOCAL RUNTIME', desc: 'Zero lag. Code runs native on your architecture.' },
                { icon: <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-primary" />, title: 'AI COPILOT', desc: 'Smart hints based on your exact implementation.' },
                { icon: <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />, title: 'AUTO-CHECK', desc: 'Instant verification of constraints and edge cases.' },
                { icon: <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />, title: 'HOT RELOAD', desc: 'Your test suite updates with every file save.' },
                { icon: <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />, title: 'UNIVERSAL', desc: 'Rust, Go, TS, Bun, Cloudflare. One engine for all.' },
                { icon: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />, title: 'CONTRIBUTE', desc: 'Anyone can publish a course. Community owned.' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 md:p-8 bg-background transition-all hover:bg-muted/50"
                >
                  <div className="mb-4 md:mb-6">{feature.icon}</div>
                  <h4 className="text-[10px] md:text-[11px] font-black mb-2 tracking-[0.2em] uppercase">
                    {feature.title}
                  </h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed italic">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div data-reveal className="scroll-reveal text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-black italic mb-4 tracking-tighter uppercase">
                Plans.
              </h2>
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-black text-[10px] opacity-60">
                Transparent, perpetual, fair.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
              {/* Community */}
              <Card
                data-reveal
                className="scroll-reveal flex flex-col border-border bg-card rounded-2xl p-2 transition-transform hover:-translate-y-1"
              >
                <CardHeader className="p-6 md:p-8">
                  <Badge className="w-fit bg-muted text-muted-foreground border-border mb-4 text-[9px] font-black tracking-widest leading-none">
                    FREE
                  </Badge>
                  <CardTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                    Community
                  </CardTitle>
                  <div className="mt-4 md:mt-6 text-3xl md:text-4xl font-black">$0</div>
                </CardHeader>
                <CardContent className="px-6 md:px-8 flex-grow">
                  <ul className="space-y-3 md:space-y-4">
                    {['Free Courses', 'Public Library', 'Local Core Engine'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-bold text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 md:p-8">
                  <Button
                    variant="outline"
                    className="w-full h-10 border-border font-black text-[10px] tracking-[0.2em] uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={!session ? signIn : undefined}
                    disabled={!!session}
                  >
                    {session ? 'ACTIVE' : 'JOIN NOW'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Lifetime */}
              <Card
                data-reveal
                className="scroll-reveal stagger-1 flex flex-col border-primary/30 bg-card relative md:scale-105 lg:scale-110 shadow-[0_0_80px_-20px_rgba(251,146,60,0.15)] rounded-2xl p-2 z-10"
              >
                <div className="absolute top-0 right-6 md:right-8 -translate-y-1/2 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-lg shadow-primary/20 leading-none">
                  Best Value
                </div>
                <CardHeader className="p-6 md:p-8">
                  <Badge className="w-fit bg-primary/20 text-primary border-primary/20 mb-4 text-[9px] font-black tracking-widest leading-none">
                    LIFETIME ACCESS
                  </Badge>
                  <CardTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                    Lifetime
                  </CardTitle>
                  <div className="mt-4 md:mt-6 text-3xl md:text-4xl font-black">$99</div>
                </CardHeader>
                <CardContent className="px-6 md:px-8 flex-grow">
                  <ul className="space-y-3 md:space-y-4">
                    {['Everything in Free', 'One-time Payment', 'Bring Your Own Key (AI)', 'Community Discord'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-black">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-4">
                    <span className="font-bold text-primary">NOTE:</span> AI
                    Mentor features require your own API Key. <br />
                    Prefer our cloud? Add the{' '}
                    <span className="text-foreground">Master AI</span> plan for
                    just <span className="text-foreground">$8/mo</span> later.
                  </p>
                </CardContent>
                <CardFooter className="p-6 md:p-8">
                  <Button
                    className="w-full h-11 bg-primary text-primary-foreground font-black text-[10px] tracking-[0.2em] uppercase rounded-lg hover:shadow-primary/30 shadow-[0_0_20px_-10px_rgba(251,146,60,0.5)]"
                    onClick={handleLifetimeCheckout}
                    disabled={checkoutState.loading || isLifetime}
                  >
                    {checkoutState.loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    {isLifetime ? 'OWNED' : 'BUY LIFETIME'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Professional */}
              <Card
                data-reveal
                className="scroll-reveal stagger-2 flex flex-col border-border bg-card rounded-2xl p-2 transition-transform hover:-translate-y-1 md:col-span-2 lg:col-span-1"
              >
                <CardHeader className="p-6 md:p-8">
                  <Badge className="w-fit bg-muted text-muted-foreground border-border mb-4 text-[9px] font-black tracking-widest leading-none">
                    CLOUD
                  </Badge>
                  <CardTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                    Professional
                  </CardTitle>
                  <div className="mt-4 md:mt-6 text-3xl md:text-4xl font-black">
                    {isLifetime ? (
                      <>
                        <span className="line-through text-muted-foreground text-xl mr-2">$12</span>
                        $8
                      </>
                    ) : (
                      '$12'
                    )}
                    <span className="text-sm font-bold text-muted-foreground ml-1 font-sans">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="px-6 md:px-8 flex-grow">
                  <ul className="space-y-3 md:space-y-4 text-muted-foreground">
                    {['Everything Premium', 'Unlimited AI Energy', 'Early Lab Access', 'Cloud Sync'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-bold">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 md:p-8">
                  <Button
                    variant="outline"
                    className="w-full h-10 border-border font-black text-[10px] tracking-[0.2em] uppercase rounded-lg"
                    onClick={handleProCheckout}
                    disabled={isLoadingPro || isPro}
                  >
                    {isLoadingPro && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    {isPro ? 'CURRENT PLAN' : isLifetime ? 'ADD MASTER AI' : 'START TRIAL'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 md:py-20 border-t border-border bg-card/60 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"></div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16">
            <div className="space-y-6 max-w-sm text-center md:text-left mx-auto md:mx-0">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg tracking-tighter uppercase">progy</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic uppercase font-black tracking-[0.2em] leading-relaxed">
                Elite developer education <br className="hidden md:block" />{' '}
                decentralized and local first.
              </p>
            </div>
            <div className="flex gap-12 sm:gap-20 mx-auto md:mx-0">
              <div className="space-y-5">
                <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                  Core
                </h5>
                <ul className="text-[10px] space-y-3 font-black text-muted-foreground uppercase leading-none tracking-widest">
                  <li><Link href="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                  <li><Link href="/docs" className="hover:text-primary transition-colors">Docs</Link></li>
                  <li><a href="#" className="hover:text-primary transition-colors">CLI</a></li>
                </ul>
              </div>
              <div className="space-y-5">
                <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                  Legal
                </h5>
                <ul className="text-[10px] space-y-3 font-black text-muted-foreground uppercase leading-none tracking-widest">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 md:mt-20 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] pt-8 border-t border-border flex justify-between items-center flex-col sm:flex-row gap-6">
            <p>{'© 2026 PROGY LABS INC.'}</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-primary transition-colors cursor-pointer">Twitter</span>
              <span className="hover:text-primary transition-colors cursor-pointer">GitHub</span>
              <span className="text-primary italic">BORN TO CODE.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
