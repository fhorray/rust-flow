import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  Key,
  Zap,
  ChevronRight,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { APP_URL } from '@consts';
import { useStore } from '@nanostores/react';
import { $isAiLocked } from '../../stores/course-store';

export function PremiumGateModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isLocked = useStore($isAiLocked);

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    window.open(`${APP_URL}/#pricing`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
              <Badge
                variant="outline"
                className="border-rust/20 text-rust py-0.5 px-3 bg-rust/5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase mx-auto"
              >
                Premium Required
              </Badge>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">
                Unlock Elite AI.
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400 text-sm italic leading-relaxed max-w-[320px] mx-auto">
              AI Mentor features require a license or a personal API key to
              maintain high-performance training.
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

            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black text-[11px] tracking-[0.15em] uppercase rounded-xl flex items-center justify-between px-6 group"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-zinc-400" />
                  <span>Use Personal API Key</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors">
                  Settings
                </span>
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="bg-white/5 p-4 text-center border-t border-white/5">
          <DialogClose asChild>
            <button className="cursor-pointer text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-300 transition-colors">
              Maybe Later
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
