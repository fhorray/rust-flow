import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ChallengeDisplayProps {
  challenge: any;
  onClose: () => void;
}

export function ChallengeDisplay({
  challenge,
  onClose,
}: ChallengeDisplayProps) {
  if (!challenge) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(challenge.filePath || challenge.code);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl bg-zinc-900/95 backdrop-blur-sm border-zinc-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-3 font-bold uppercase tracking-wider text-[10px]">
              Desafio Gerado por IA
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {challenge.title}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 leading-relaxed">
              {challenge.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg active:scale-95"
            aria-label="Fechar"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="bg-zinc-950 rounded-xl p-4 md:p-6 mb-6 border border-zinc-800 shadow-inner">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
              Código para Corrigir
            </span>
          </div>
          <pre className="font-mono text-xs md:text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {challenge.code}
          </pre>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 hover:bg-amber-500/15 transition-colors">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Dica
          </div>
          <p className="text-amber-200/90 text-sm leading-relaxed">{challenge.hint}</p>
        </div>

        {challenge.message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
            <div className="text-emerald-400 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
              <span className="text-base">✓</span> Arquivo Criado com Sucesso
            </div>
            <p className="text-emerald-200/90 text-sm font-mono break-all">
              {challenge.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleCopy} variant="outline" className="flex-1 font-bold">
            Copiar Código / Caminho
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-rust to-orange-500 hover:brightness-110 text-white font-bold shadow-lg shadow-rust/20"
          >
            Entendi
          </Button>
        </div>
      </Card>
    </div>
  );
}
