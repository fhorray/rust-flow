import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: QuizOption[];
}

interface Quiz {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

interface QuizViewProps {
  quiz: Quiz;
  onComplete?: (score: number) => void;
}

export function QuizView({ quiz, onComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  if (!currentQuestion) return null;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
  };

  const checkAnswer = () => {
    if (!selectedOption) return;

    const option = currentQuestion?.options.find(
      (o) => o.id === selectedOption,
    );
    if (option?.isCorrect) {
      setScore((s) => s + 1);
    }
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      setShowSummary(true);
      if (onComplete)
        onComplete(
          score +
            (currentQuestion?.options.find((o) => o.id === selectedOption)
              ?.isCorrect
              ? 1
              : 0),
        );
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const retryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
  };

  if (showSummary) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-zinc-900">
            <span className="text-4xl font-bold text-white">{percentage}%</span>
          </div>
          {percentage >= 70 && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {percentage >= 100
              ? 'Perfection!'
              : percentage >= 70
                ? 'Great Job!'
                : 'Keep Practicing'}
          </h2>
          <p className="text-zinc-400">
            You got {score} out of {quiz.questions.length} questions correct.
          </p>
        </div>

        <Button onClick={retryQuiz} variant="outline" size="lg">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
        <span className="text-sm font-mono text-zinc-500">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-zinc-200 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="grid gap-3">
            {currentQuestion.options.map((option) => {
              let variant = 'outline';
              let className =
                'justify-start text-left h-auto py-4 px-4 border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800';

              if (selectedOption === option.id) {
                className += ' border-rust text-rust bg-rust/10';
              }

              if (isAnswered) {
                if (option.isCorrect) {
                  className =
                    'justify-start text-left h-auto py-4 px-4 border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                } else if (selectedOption === option.id && !option.isCorrect) {
                  className =
                    'justify-start text-left h-auto py-4 px-4 border-red-500/50 bg-red-500/10 text-red-400';
                } else {
                  className =
                    'justify-start text-left h-auto py-4 px-4 border-zinc-800 opacity-50';
                }
              }

              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={className}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={isAnswered}
                >
                  <div className="flex items-start w-full">
                    <span className="flex-1">{option.text}</span>
                    {isAnswered && option.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 ml-2 flex-shrink-0" />
                    )}
                    {isAnswered &&
                      selectedOption === option.id &&
                      !option.isCorrect && (
                        <XCircle className="w-4 h-4 ml-2 flex-shrink-0" />
                      )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {isAnswered && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {selectedOption &&
              currentQuestion.options.find((o) => o.id === selectedOption)
                ?.explanation && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 text-sm text-zinc-300">
                  <div className="flex items-center gap-2 mb-1 text-zinc-400 font-bold text-xs uppercase">
                    <HelpCircle className="w-3 h-3" /> Explanation
                  </div>
                  {
                    currentQuestion.options.find((o) => o.id === selectedOption)
                      ?.explanation
                  }
                </div>
              )}

            <Button
              onClick={nextQuestion}
              className="w-full bg-white text-black hover:bg-zinc-200"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {!isAnswered && (
          <Button
            onClick={checkAnswer}
            disabled={!selectedOption}
            className="w-full bg-rust hover:bg-rust-dark text-white"
          >
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
}
