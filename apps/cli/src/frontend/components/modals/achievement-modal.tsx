import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';

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
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-6 border border-yellow-500/30 shadow-[0_0_30px_-10px_rgba(234,179,8,0.5)]">
             <Icon className="w-10 h-10 text-yellow-500" />
          </div>

          <Dialog.Title className="text-xl font-black uppercase tracking-wider text-white mb-2">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-sm text-zinc-400 mb-8 leading-relaxed whitespace-pre-wrap">
            {message}
          </Dialog.Description>

          <Button onClick={onClose} className="bg-white text-black hover:bg-zinc-200 w-full font-bold">
            Awesome!
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
