import React from 'react';
import { useStore } from '@nanostores/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { $isPremiumGateOpen, closePremiumGate } from '../stores/ui-store';
import { Sparkles, Key, Zap, ChevronRight, Rocket, ShieldCheck } from 'lucide-react';

export function PremiumGateModal() {
  const isOpen = useStore($isPremiumGateOpen);

  const handleUpgrade = () => {
    window.open('https://fhorray.github.io/progy', '_blank'); // Adjust if needed
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePremiumGate()}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/5 p-0 overflow-hidden rounded-2xl">
        <div className="relative p-6 md:p-8">
          {/* Background Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-rust/20 blur-[80px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
          </div>

          <DialogHeader className="relative z-10 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rust/10 border border-rust/20 flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-rust" />
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="border-rust/20 text-rust py-0.5 px-3 bg-rust/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase mx-auto">
                Premium Required
              </Badge>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">
                Unlock Elite AI.
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400 text-sm italic leading-relaxed max-w-[320px] mx-auto">
              AI Mentor features require a license or a personal API key to maintain high-performance training.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-3 relative z-10">
            <Button
              onClick={handleUpgrade}
              className="w-full h-14 bg-rust text-white hover:bg-rust/90 font-black text-[11px] tracking-[0.15em] uppercase rounded-xl flex items-center justify-between px-6 group transition-all"
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-4 h-4" />
                <span>Upgrade to Pro / Lifetime</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={closePremiumGate}
              className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black text-[11px] tracking-[0.15em] uppercase rounded-xl flex items-center justify-between px-6 group"
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-zinc-400" />
                <span>Use Personal API Key</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors">Settings</span>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
            <div className="flex items-center gap-2 opacity-60">
              <Zap className="w-3.5 h-3.5 text-rust shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Zero Latency</span>
            </div>
            <div className="flex items-center gap-2 opacity-60">
              <ShieldCheck className="w-3.5 h-3.5 text-rust shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unlimited Energy</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-4 text-center border-t border-white/5">
          <button
            onClick={closePremiumGate}
            className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
