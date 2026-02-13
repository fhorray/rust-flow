import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as LucideIcons from 'lucide-react';
import { Button } from '@progy/ui/button';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: string;
  title: string;
  message: string;
}

export function AchievementModal({ isOpen, onClose, icon, title, message }: AchievementModalProps) {
  const Icon = icon ? (LucideIcons as any)[icon] || LucideIcons.Award : LucideIcons.Award;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-8 md:p-10 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6 border-2 border-yellow-500/40 shadow-[0_0_40px_-5px_rgba(234,179,8,0.6)] animate-in zoom-in duration-500 delay-100">
            <Icon className="w-12 h-12 text-yellow-400" />
          </div>

          <Dialog.Title className="text-2xl md:text-3xl font-black uppercase tracking-wider text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text mb-3 animate-in slide-in-from-bottom-2 duration-300 delay-200">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-sm md:text-base text-zinc-400 mb-8 leading-relaxed whitespace-pre-wrap max-w-sm animate-in slide-in-from-bottom-2 duration-300 delay-300">
            {message}
          </Dialog.Description>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-rust to-orange-500 hover:brightness-110 text-white w-full font-bold py-6 shadow-lg shadow-rust/20 animate-in slide-in-from-bottom-2 duration-300 delay-400"
          >
            Incrível!
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
