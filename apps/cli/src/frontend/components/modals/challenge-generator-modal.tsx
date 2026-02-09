import { setSelectedExercise } from '@/stores/course-store';
import { Loader2, Sparkles, Wand2Icon } from 'lucide-react';
import React, { useState } from 'react';
import { callAi } from '../../lib/ai-client';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';


interface ChallengeGeneratorProps {
  children: React.ReactNode;
}

export function ChallengeGenerator({
  children,
}: ChallengeGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedChallenge, setGeneratedChallenge] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const data = await callAi({
        endpoint: 'generate',
        prompt,
        difficulty
      });

      if (data.error) {
        setError(data.error);
        return;
      }

      setGeneratedChallenge(data);
      setOpen(false);
      setSelectedExercise(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate challenge. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='bg-zinc-900 max-w-2xl'>
        <div className=''>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-rust to-orange-500 p-2 rounded-xl shadow-lg shadow-rust/20">
              <Wand2Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate Challenge</h2>
              <p className="text-xs text-zinc-500">
                The AI will create a challenge with code for you to correct
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-2">
                What do you want to practice?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: ownership with vectors, pattern matching with enums, traits and generics..."
                className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-2">
                Difficulty
              </label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`cursor-pointer flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${difficulty === level
                      ? level === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : level === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
                      }`}
                  >
                    {level === 'easy'
                      ? 'Easy'
                      : level === 'medium'
                        ? 'Medium'
                        : 'Hard'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
