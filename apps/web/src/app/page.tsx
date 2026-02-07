"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Code, Cpu, Globe, Rocket, Terminal, Zap, Sparkles, BrainCircuit, ShieldCheck, Copy, ChevronRight, Layers, Command, Laptop, Monitor, AppWindow, Menu, X, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { useStore } from '@nanostores/react';
import { $checkoutMutation } from '@/stores/billing-store';

export default function Home() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoadingPro, setIsLoadingPro] = useState(false);
	const router = useRouter();
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const checkoutState = useStore($checkoutMutation as any);

	const userPlan = session?.user?.subscription || "free";
	const isPro = userPlan === "pro";
	const isLifetime = userPlan === "lifetime";

	const handleLifetimeCheckout = async () => {
		if (!session) {
			handleSignIn();
			return;
		}
		try {
			const res = await $checkoutMutation.mutate({
				plan: "lifetime",
				token: session.session?.token
			});
			if (res.url) {
				window.location.href = res.url;
			} else {
				toast.error("Failed to start checkout");
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

	const handleProCheckout = async () => {
		setIsLoadingPro(true);
		try {
			if (!session) {
				handleSignIn();
				return;
			}
			await authClient.subscription.upgrade({
				plan: "pro",
				successUrl: "/dashboard",
				cancelUrl: "/",
			});
		} catch (error) {
			toast.error("Failed to start subscription");
		} finally {
			setIsLoadingPro(false);
		}
	};

	// Simple Scroll Reveal Logic
	useEffect(() => {
		const reveals = document.querySelectorAll(".reveal");
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add("active");
				}
			});
		}, { threshold: 0.1 });

		reveals.forEach(reveal => observer.observe(reveal));
		return () => reveals.forEach(reveal => observer.unobserve(reveal));
	}, []);

	const handleSignIn = async () => {
		await authClient.signIn.social({
			provider: "github",
			callbackURL: window.location.origin + "/dashboard"
		});
	};

	return (
		<div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden font-sans">
			{/* Navigation */}
			<nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
				<div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
					<div className="flex items-center gap-2.5 cursor-pointer shrink-0">
						<div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
							<Terminal className="w-3.5 h-3.5 text-primary-foreground" />
						</div>
						<span className="font-bold text-base tracking-tight">progy</span>
					</div>

					{/* Desktop Nav */}
					<div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
						<a href="#how-it-works" className="hover:text-foreground transition-colors">Workflow</a>
						<a href="#features" className="hover:text-foreground transition-colors">Features</a>
						<a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
						<a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
					</div>

					<div className="flex items-center gap-3">
						{session ? (
							<div className="hidden sm:flex items-center gap-3">
								<div className="flex flex-col items-end leading-none">
									<span className="text-[10px] font-black uppercase tracking-widest text-foreground">
										{session.user.name}
									</span>
									<span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">
										{isLifetime ? "LIFETIME" : isPro ? "PRO" : "FREE"}
									</span>
								</div>
								<div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">
									{session.user.name?.charAt(0).toUpperCase()}
								</div>
							</div>
						) : (
							<div className="hidden sm:flex items-center gap-3">
								<Button
									onClick={handleSignIn}
									size="sm"
									variant="ghost"
									className="text-[11px] font-black tracking-widest text-muted-foreground hover:text-foreground h-9">
									Log in
								</Button>
								<Button
									onClick={handleSignIn}
									size="sm"
									className="bg-foreground text-background hover:bg-foreground/90 font-black px-5 h-9 rounded-lg text-[11px] tracking-widest">
									JOIN NOW
								</Button>
							</div>
						)}
						<button
							className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden absolute top-14 left-0 w-full bg-background border-b border-white/5 py-8 px-6 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
						<div className="flex flex-col gap-6 text-[12px] font-black uppercase tracking-widest">
							<a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
							<a href="#features" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
							<a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
							<a href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
							<div className="pt-6 border-t border-white/5 flex flex-col gap-4">
								{session ? (
									<div className="flex items-center gap-3 mb-4">
										<div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">
											{session.user.name?.charAt(0).toUpperCase()}
										</div>
										<div className="flex flex-col leading-none">
											<span className="text-[10px] font-black uppercase tracking-widest text-foreground">
												{session.user.name}
											</span>
											<span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mt-1">
												{isLifetime ? "LIFETIME" : isPro ? "PRO" : "FREE"}
											</span>
										</div>
									</div>
								) : (
									<>
										<Button onClick={handleSignIn} variant="ghost" className="justify-start px-0 text-[12px] font-black tracking-widest h-10">Log in</Button>
										<Button onClick={handleSignIn} className="bg-foreground text-background w-full h-12 text-[12px] font-black tracking-widest rounded-xl">JOIN NOW</Button>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>

			<main>
				{/* Hero Section */}
				<section className="relative pt-24 pb-20 md:pt-40 md:pb-32 overflow-hidden">
					{/* Glow Scene */}
					<div className="absolute inset-0 pointer-events-none overflow-hidden">
						<div className="spotlight opacity-30 md:opacity-40"></div>
						<div className="glow-orb w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary -top-20 -left-20 md:-top-40 md:-left-40 animate-glow"></div>
						<div className="glow-orb w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-orange-600 bottom-0 -right-10 md:-right-20 animate-glow" style={{ animationDelay: '-3s' }}></div>
					</div>

					{/* Floating Icons - Hidden on small mobile */}
					<div className="absolute top-32 left-10 md:left-40 animate-float opacity-10 hidden lg:block">
						<Code className="w-10 h-10 text-primary" />
					</div>
					<div className="absolute bottom-32 right-10 md:right-40 animate-float opacity-10 hidden lg:block" style={{ animationDelay: '4s' }}>
						<Terminal className="w-12 h-12 text-primary" />
					</div>

					<div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center relative z-10">
						<Badge variant="outline" className="mb-6 border-primary/20 text-primary py-1 px-4 backdrop-blur-md bg-primary/5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase">
							BUILD • SOLVE • VERIFY
						</Badge>
						<h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 max-w-4xl leading-[1.05] reveal">
							Master Code <br />
							<span className="text-primary italic">Locally.</span>
						</h1>
						<p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed reveal" style={{ transitionDelay: '0.1s' }}>
							The developer platform for high-intensity, terminal-first learning. <br className="hidden md:block" />
							Free for the community. Build any course, in any language.
						</p>

						{/* CLI Box */}
						<div className="w-full max-w-sm md:max-w-md mb-10 group cursor-pointer reveal mx-auto" style={{ transitionDelay: '0.2s' }}>
							<div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all group-hover:border-primary/40 group-hover:shadow-primary/5 group-hover:shadow-[0_0_40px_-5px]">
								<div className="flex items-center justify-between px-3 md:px-4 py-2 bg-white/5 border-b border-white/5">
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

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal w-full sm:w-auto" style={{ transitionDelay: '0.3s' }}>
							<Button size="lg" className="h-11 w-full sm:w-auto px-8 text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground rounded-lg hover:shadow-primary/20 hover:shadow-[0_0_20px_0] transition-all">
								Get Started Free
							</Button>
							<Button size="lg" variant="outline" className="h-11 w-full sm:w-auto px-8 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg border-white/10 hover:bg-white/5 transition-colors">
								Explore Library <ChevronRight className="w-4 h-4 ml-1" />
							</Button>
						</div>
					</div>
				</section>

				{/* Inside the App (Mockup Gallery) */}
				<div className="relative py-20 overflow-hidden">
					<div className="absolute inset-0 skew-up bg-black/40 border-y border-white/5 -z-10 bg-grid-white/[0.02]"></div>
					<div className="max-w-6xl mx-auto px-4 md:px-6 unskew-neg relative z-10">
						<div className="text-center mb-12 md:mb-16 reveal">
							<Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-2 py-0.5 text-[9px] uppercase font-black tracking-[0.2em]">THE EXPERIENCE</Badge>
							<h2 className="text-3xl md:text-5xl font-black italic mb-4 tracking-tight uppercase">Focus Mode, On.</h2>
							<p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
								A zero-distraction environment where documentation, requirements, and verification live right where your code does.
							</p>
						</div>

						{/* Mockup Showcase */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 max-w-5xl mx-auto reveal" style={{ transitionDelay: '0.2s' }}>
							<div className="md:col-span-3 aspect-[16/10] bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl relative group min-h-[240px]">
								<Image
									src="/progy_app_mockup_1770436151556.png"
									alt="Progy Interface"
									fill
									className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
								/>
								<div className="absolute top-4 left-4 flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
									<div className="w-1.5 h-1.5 rounded-full bg-white"></div>
									<div className="w-1.5 h-1.5 rounded-full bg-white"></div>
									<div className="w-1.5 h-1.5 rounded-full bg-white"></div>
								</div>
							</div>
							<div className="grid grid-cols-3 md:grid-cols-1 md:flex md:flex-col gap-3 md:gap-4">
								<div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center p-3 md:p-6 text-center group hover:bg-primary/5 hover:border-primary/20 transition-all">
									<Laptop className="w-5 h-5 md:w-6 md:h-6 text-primary/60 mb-2 md:mb-3 group-hover:text-primary transition-colors" />
									<p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 leading-none">Local Host</p>
									<p className="text-[10px] md:text-[11px] font-bold">Your IDE</p>
								</div>
								<div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center p-3 md:p-6 text-center group hover:bg-primary/5 hover:border-primary/20 transition-all">
									<Monitor className="w-5 h-5 md:w-6 md:h-6 text-primary/60 mb-2 md:mb-3 group-hover:text-primary transition-colors" />
									<p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 leading-none">Interactive</p>
									<p className="text-[10px] md:text-[11px] font-bold">Live AI</p>
								</div>
								<div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center p-3 md:p-6 text-center group hover:bg-primary/5 hover:border-primary/20 transition-all">
									<AppWindow className="w-5 h-5 md:w-6 md:h-6 text-primary/60 mb-2 md:mb-3 group-hover:text-primary transition-colors" />
									<p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 leading-none">Multi-view</p>
									<p className="text-[10px] md:text-[11px] font-bold">Workspace</p>
								</div>
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
							<div className="lg:w-1/2 reveal">
								<h2 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 italic leading-tight tracking-tight uppercase">Elite Flow. <br className="hidden md:block" /> Zero Friction.</h2>
								<div className="space-y-8 md:space-y-10">
									<div className="flex gap-4 md:gap-5">
										<div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary transition-colors">
											<Layers className="w-5 h-5" />
										</div>
										<div>
											<h4 className="text-sm font-black mb-1.5 uppercase tracking-[0.1em]">1. Select Your Goal</h4>
											<p className="text-xs text-muted-foreground leading-relaxed italic">Browse the community library or initialize from any public repository. Own your path.</p>
										</div>
									</div>
									<div className="flex gap-4 md:gap-5">
										<div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary transition-colors">
											<Rocket className="w-5 h-5" />
										</div>
										<div>
											<h4 className="text-sm font-black mb-1.5 uppercase tracking-[0.1em]">2. One Command Init</h4>
											<p className="text-xs text-muted-foreground leading-relaxed italic">Run `npx progy init -c [course]`. Everything is configured locally in seconds.</p>
										</div>
									</div>
									<div className="flex gap-4 md:gap-5">
										<div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary transition-colors">
											<Zap className="w-5 h-5" />
										</div>
										<div>
											<h4 className="text-sm font-black mb-1.5 uppercase tracking-[0.1em]">3. Real-time Verify</h4>
											<p className="text-xs text-muted-foreground leading-relaxed italic">Start coding. Save your progress and click 'Run tests' to verify your solution instantly.</p>
										</div>
									</div>
								</div>
							</div>
							<div className="lg:w-1/2 reveal w-full" style={{ transitionDelay: '0.3s' }}>
								<div className="p-6 md:p-8 bg-black border border-white/10 rounded-2xl relative overflow-hidden shadow-3xl">
									<div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-primary/5 rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 blur-[40px]"></div>
									<div className="relative space-y-3 font-mono text-[11px] md:text-[12px]">
										<div className="flex items-center gap-2 text-primary font-bold">
											<ChevronRight className="w-4 h-4" /> progy init -c rust
										</div>
										<div className="pl-6 text-muted-foreground/80 leading-loose">
											✔ Connecting to Progy Hub... <br />
											✔ Cloning Course: Rust Mastery <br />
											✔ Preparing local workspace... <br />
											✔ Server started on <span className="text-green-400">localhost:3000</span> <br />
											<br />
											<span className="text-foreground font-bold">Solving task 01: <span className="text-primary italic">intro/hello.rs</span></span>
										</div>
										<div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
											<div className="text-[8px] md:text-[9px] text-muted-foreground font-sans font-black uppercase tracking-widest">Local-First Active</div>
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
				<div className="relative py-20 md:py-24 overflow-hidden">
					<div className="absolute inset-0 skew-down bg-black border-y border-white/5 -z-10 shadow-[0_0_100px_-50px_rgba(251,146,60,0.2)]"></div>
					<div className="max-w-6xl mx-auto px-4 md:px-6 unskew relative z-10">
						<div className="mb-12 md:mb-20 reveal">
							<Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-2 py-0.5 text-[9px] uppercase font-black tracking-[0.2em]">SPECIFICATIONS</Badge>
							<h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 uppercase">Elite Stack.</h2>
							<p className="text-muted-foreground text-sm max-w-lg leading-relaxed italic font-medium">High-performance tools for engineers who demand the best.</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden rounded-xl">
							{[
								{
									icon: <Cpu className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
									title: "LOCAL RUNTIME",
									desc: "Zero lag. Code runs native on your architecture."
								},
								{
									icon: <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
									title: "AI COPILOT",
									desc: "Smart hints based on your exact implementation."
								},
								{
									icon: <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
									title: "AUTO-CHECK",
									desc: "Instant verification of constraints and edge cases."
								},
								{
									icon: <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
									title: "HOT RELOAD",
									desc: "Your test suite updates with every file save."
								},
								{
									icon: <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
									title: "UNIVERSAL",
									desc: "Rust, Go, TS, Bun, Cloudflare. One engine for all."
								},
								{
									icon: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
									title: "CONTRIBUTE",
									desc: "Anyone can publish a course. Community owned."
								}
							].map((feature, i) => (
								<div key={i} className="p-6 md:p-8 bg-background reveal transition-all hover:bg-white/5" style={{ transitionDelay: `${i * 0.05}s` }}>
									<div className="mb-4 md:mb-6">{feature.icon}</div>
									<h4 className="text-[10px] md:text-[11px] font-black mb-2 tracking-[0.2em] uppercase">{feature.title}</h4>
									<p className="text-[13px] text-muted-foreground leading-relaxed italic">{feature.desc}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Pricing Section */}
				<section id="pricing" className="py-20 md:py-32">
					<div className="max-w-6xl mx-auto px-4 md:px-6">
						<div className="text-center mb-16 md:mb-20 reveal">
							<h2 className="text-4xl md:text-6xl font-black italic mb-4 tracking-tighter uppercase">Plans.</h2>
							<p className="text-muted-foreground text-sm uppercase tracking-widest font-black text-[10px] opacity-60">Transparent, perpetual, fair.</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
							<Card className="flex flex-col border-white/5 bg-black/40 reveal rounded-2xl p-2 transition-transform hover:-translate-y-1">
								<CardHeader className="p-6 md:p-8">
									<Badge className="w-fit bg-white/5 text-muted-foreground border-white/10 mb-4 text-[9px] font-black tracking-widest leading-none">FREE</Badge>
									<CardTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Community</CardTitle>
									<div className="mt-4 md:mt-6 text-3xl md:text-4xl font-black">$0</div>
								</CardHeader>
								<CardContent className="px-6 md:px-8 flex-grow">
									<ul className="space-y-3 md:space-y-4">
										{["Free Courses", "Public Library", "Local Core Engine"].map((item, i) => (
											<li key={i} className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-bold text-muted-foreground">
												<Check className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter className="p-6 md:p-8">
									<Button
										variant="outline"
										className="w-full h-10 border-white/10 font-black text-[10px] tracking-[0.2em] uppercase rounded-lg"
										onClick={!session ? handleSignIn : undefined}
										disabled={!!session}
									>
										{session ? "ACTIVE" : "JOIN NOW"}
									</Button>
								</CardFooter>
							</Card>

							<Card className="flex flex-col border-primary/30 bg-black/60 relative md:scale-105 lg:scale-110 shadow-[0_0_80px_-20px_rgba(251,146,60,0.15)] reveal rounded-2xl p-2 z-10" style={{ transitionDelay: '0.1s' }}>
								<div className="absolute top-0 right-6 md:right-8 -translate-y-1/2 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-lg shadow-primary/20 leading-none">Best Value</div>
								<CardHeader className="p-6 md:p-8">
									<Badge className="w-fit bg-primary/20 text-primary border-primary/20 mb-4 text-[9px] font-black tracking-widest leading-none">LIFETIME ACCESS</Badge>
									<CardTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Lifetime</CardTitle>
									<div className="mt-4 md:mt-6 text-3xl md:text-4xl font-black">$99</div>
								</CardHeader>
								<CardContent className="px-6 md:px-8 flex-grow">
									<ul className="space-y-3 md:space-y-4">
										{["Everything in Free", "One-time Payment", "Bring Your Own Key (AI)", "Community Discord"].map((item, i) => (
											<li key={i} className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-black">
												<Check className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
											</li>
										))}
									</ul>
									<p className="mt-6 text-[10px] text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
										<span className="font-bold text-primary">NOTE:</span> AI Mentor features require your own API Key. <br />
										Prefer our cloud? Add the <span className="text-foreground">Master AI</span> plan for just <span className="text-foreground">$8/mo</span> later.
									</p>
								</CardContent>
								<CardFooter className="p-6 md:p-8">
									<Button
										className="w-full h-11 bg-primary text-primary-foreground font-black text-[10px] tracking-[0.2em] uppercase rounded-lg hover:shadow-primary/30 shadow-[0_0_20px_-10px_rgba(251,146,60,0.5)]"
										onClick={handleLifetimeCheckout}
										disabled={checkoutState.loading || isLifetime || isPro}
									>
										{checkoutState.loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
										{isLifetime || isPro ? "OWNED" : "BUY LIFETIME"}
									</Button>
								</CardFooter>
							</Card>

							<Card className="flex flex-col border-white/5 bg-black/40 reveal rounded-2xl p-2 transition-transform hover:-translate-y-1 md:col-span-2 lg:col-span-1" style={{ transitionDelay: '0.2s' }}>
								<CardHeader className="p-6 md:p-8">
									<Badge className="w-fit bg-white/5 text-muted-foreground border-white/10 mb-4 text-[9px] font-black tracking-widest leading-none">CLOUD</Badge>
									<CardTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Professional</CardTitle>
									<div className="mt-4 md:mt-6 text-3xl md:text-4xl font-black">$12<span className="text-sm font-bold text-muted-foreground ml-1 font-sans">/mo</span></div>
								</CardHeader>
								<CardContent className="px-6 md:px-8 flex-grow">
									<ul className="space-y-3 md:space-y-4 text-muted-foreground">
										{["Everything Premium", "Unlimited AI Energy", "Early Lab Access", "Cloud Sync"].map((item, i) => (
											<li key={i} className="flex items-center gap-2.5 text-[11px] md:text-[12px] font-bold">
												<Check className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter className="p-6 md:p-8">
									<Button
										variant="outline"
										className="w-full h-10 border-white/10 font-black text-[10px] tracking-[0.2em] uppercase rounded-lg"
										onClick={handleProCheckout}
										disabled={isLoadingPro || isPro}
									>
										{isLoadingPro && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
										{isPro ? "CURRENT PLAN" : "START TRIAL"}
									</Button>
								</CardFooter>
							</Card>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="py-16 md:py-20 border-t border-white/5 bg-black/60 relative overflow-hidden">
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
								Elite developer education <br className="hidden md:block" /> decentralized and local first.
							</p>
						</div>
						<div className="flex gap-12 sm:gap-20 mx-auto md:mx-0">
							<div className="space-y-5">
								<h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Core</h5>
								<ul className="text-[10px] space-y-3 font-black text-muted-foreground uppercase leading-none tracking-widest">
									<li><a href="#" className="hover:text-primary transition-colors">Courses</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Docs</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">CLI</a></li>
								</ul>
							</div>
							<div className="space-y-5">
								<h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Legal</h5>
								<ul className="text-[10px] space-y-3 font-black text-muted-foreground uppercase leading-none tracking-widest">
									<li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-16 md:mt-20 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] pt-8 border-t border-white/5 flex justify-between items-center flex-col sm:flex-row gap-6">
						<p>© 2026 PROGY LABS INC.</p>
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
