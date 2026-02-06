import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface GeneratedChallenge {
  title: string;
  description: string;
  code: string;
  hint: string;
  filePath?: string;
  filename?: string;
  message?: string;
}

interface ChallengeGeneratorProps {
  onChallengeGenerated: (challenge: GeneratedChallenge) => void;
  onClose: () => void;
}

export function ChallengeGenerator({
  onChallengeGenerated,
  onClose,
}: ChallengeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, difficulty }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      onChallengeGenerated(data);
    } catch (err) {
      setError('Failed to generate challenge. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-rust to-orange-500 p-2 rounded-xl shadow-lg shadow-rust/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gerar Desafio</h2>
            <p className="text-xs text-zinc-500">
              A IA vai criar um exercício com código para você corrigir
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">
              O que você quer praticar?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: ownership com vetores, pattern matching com enums, traits e generics..."
              className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">
              Dificuldade
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                    difficulty === level
                      ? level === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : level === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {level === 'easy'
                    ? 'Fácil'
                    : level === 'medium'
                      ? 'Médio'
                      : 'Difícil'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 font-bold shadow-lg shadow-rust/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Desafio
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
