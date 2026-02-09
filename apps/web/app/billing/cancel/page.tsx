'use client';

import { Button } from 'components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Badge } from 'components/ui/badge';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="max-w-md w-full text-center space-y-8 reveal active">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-3">
          <Badge
            variant="outline"
            className="border-red-500/20 text-red-500 py-1 px-3 bg-red-500/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase"
          >
            Checkout Canceled
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
            Paused.
          </h1>
          <p className="text-muted-foreground text-sm italic leading-relaxed">
            Checkout was not completed. Your account status remains unchanged.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Link href="/#pricing" className="w-full">
            <Button className="w-full bg-white text-black hover:bg-white/90 font-black text-[10px] tracking-[0.2em] uppercase h-12 rounded-xl">
              Back to Pricing
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
