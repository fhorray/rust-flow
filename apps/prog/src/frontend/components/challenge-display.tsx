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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-zinc-900 border-zinc-800 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-2">
              Desafio Gerado
            </Badge>
            <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
            <p className="text-zinc-400 text-sm mt-1">
              {challenge.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4 border border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              código para corrigir
            </span>
          </div>
          <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto">
            {challenge.code}
          </pre>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Dica
          </div>
          <p className="text-amber-200/80 text-sm">{challenge.hint}</p>
        </div>

        {challenge.message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
            <div className="text-emerald-400 text-xs font-semibold mb-1">
              ✅ Arquivo Criado
            </div>
            <p className="text-emerald-200/80 text-sm font-mono">
              {challenge.message}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" className="w-full">
            Copiar Código / Caminho
          </Button>
          <Button
            onClick={onClose}
            className="w-full bg-white text-black hover:bg-zinc-200"
          >
            Entendi
          </Button>
        </div>
      </Card>
    </div>
  );
}
