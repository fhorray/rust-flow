'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'components/ui/button';
import { CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { Badge } from 'components/ui/badge';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="max-w-md w-full text-center space-y-8 reveal active">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 -z-10"></div>
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <Badge
            variant="outline"
            className="border-primary/20 text-primary py-1 px-3 bg-primary/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase"
          >
            Payment Confirmed
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
            Success.
          </h1>
          <p className="text-muted-foreground text-sm italic leading-relaxed">
            Your license is active. You are now authorized for high-intensity
            developer training.
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 text-left">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">
                Get Started
              </h4>
              <p className="text-[11px] text-muted-foreground italic">
                Your plan status will sync automatically with the CLI.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-primary text-primary-foreground font-black text-[10px] tracking-[0.2em] uppercase h-12 rounded-xl">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-white text-[10px] font-black uppercase tracking-[0.2em] h-12"
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
