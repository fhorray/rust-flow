import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Code,
  Type,
  List,
  CheckSquare,
  Link as LinkIcon,
  FileText,
  RotateCcw
} from 'lucide-react';

import { Button } from '@progy/ui/button';
import { Card } from '@progy/ui/card';
import { ScrollArea } from '@progy/ui/scroll-area';
import { getQuizSession, saveQuizSession, clearQuizSession } from '../../stores/quiz-store';

import type {
  Quiz,
  QuizQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  TextAnswerQuestion,
  CodingQuestion,
  MatchingQuestion,
  EssayQuestion
} from './types';

// Viewers
import { MultipleChoiceViewer } from './QuestionViewers/MultipleChoiceViewer';
import { TrueFalseViewer } from './QuestionViewers/TrueFalseViewer';
import { TextAnswerViewer } from './QuestionViewers/TextAnswerViewer';
import { CodingViewer } from './QuestionViewers/CodingViewer';
import { MatchingViewer } from './QuestionViewers/MatchingViewer';
import { EssayViewer } from './QuestionViewers/EssayViewer';

interface QuizViewProps {
  id?: string;
  quiz: Quiz;
  onComplete?: (score: number) => void;
}

export function QuizView({ id, quiz, onComplete }: QuizViewProps) {
  const normalizedQuiz = React.useMemo(() => {
    return Array.isArray(quiz)
      ? { title: 'Quiz', questions: quiz }
      : quiz;
  }, [quiz]);

  const questions = normalizedQuiz.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<any>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Persistence state
  const [allAnswers, setAllAnswers] = useState<Record<number, any>>({});
  const [results, setResults] = useState<Record<number, { isAnswered: boolean; isCorrect: boolean }>>({});
  const [initialized, setInitialized] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const type = currentQuestion?.type?.toLowerCase()?.trim();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Safe string answer for comparison
  const stringAnswer = typeof answer === 'string' ? answer.trim() : '';
  const matchingAnswer = typeof answer === 'object' && answer !== null ? answer as Record<string, string> : {};
  const booleanAnswer = typeof answer === 'boolean' ? answer : null;

  // Load session on mount/id change
  useEffect(() => {
    if (!id) {
      setInitialized(true);
      return;
    }
    const session = getQuizSession(id);
    if (session) {
      setCurrentQuestionIndex(session.currentQuestionIndex);
      setAllAnswers(session.answers || {});
      setResults(session.results || {});
      setScore(session.score);
      setShowSummary(session.showSummary);
    } else {
      // Reset local state for new exercise
      setCurrentQuestionIndex(0);
      setAllAnswers({});
      setResults({});
      setScore(0);
      setShowSummary(false);
    }
    setInitialized(true);
  }, [id]);

  // Sync current answer with allAnswers
  useEffect(() => {
    if (!initialized) return;

    const savedAnswer = allAnswers[currentQuestionIndex];
    if (savedAnswer !== undefined) {
      setAnswer(savedAnswer);
    } else {
      setAnswer(
        type === 'matching' ? {} :
          type === 'coding' ? (currentQuestion as CodingQuestion).startingCode || '' :
            null
      );
    }

    const savedResult = results[currentQuestionIndex];
    if (savedResult) {
      setIsAnswered(savedResult.isAnswered);
      setIsCorrect(savedResult.isCorrect);
    } else {
      setIsAnswered(false);
      setIsCorrect(false);
    }
  }, [currentQuestionIndex, currentQuestion?.id, type, initialized, allAnswers, results]);

  // Save session on any change
  useEffect(() => {
    if (initialized && id) {
      saveQuizSession(id, {
        currentQuestionIndex,
        answers: allAnswers,
        results,
        score,
        showSummary,
      });
    }
  }, [id, currentQuestionIndex, allAnswers, results, score, showSummary, initialized]);

  const checkAnswer = () => {
    let correct = false;

    switch (type) {
      case 'multiple-choice': {
        const q = currentQuestion as MultipleChoiceQuestion;
        const selected = q.options.find(o => o.id === answer);
        correct = selected?.isCorrect || false;
        break;
      }
      case 'true-false': {
        const q = currentQuestion as TrueFalseQuestion;
        correct = answer === q.correctAnswer;
        break;
      }
      case 'short-answer':
      case 'fill-in-the-blank': {
        const q = currentQuestion as TextAnswerQuestion;
        correct = q.acceptedAnswers.some(a =>
          q.caseSensitive ? a.trim() === stringAnswer : a.trim().toLowerCase() === stringAnswer.toLowerCase()
        );
        break;
      }
      case 'coding': {
        const q = currentQuestion as CodingQuestion;
        correct = stringAnswer === q.solutionCode.trim();
        if (!correct && stringAnswer.length > 0) correct = true;
        break;
      }
      case 'matching': {
        const q = currentQuestion as MatchingQuestion;
        const pairs = q.pairs;
        const allCorrect = pairs.every(p => matchingAnswer[p.left] === p.right);
        correct = allCorrect && Object.keys(matchingAnswer).length === pairs.length;
        break;
      }
      case 'essay': {
        const q = currentQuestion as EssayQuestion;
        const words = stringAnswer.split(/\s+/).filter(w => w.length > 0).length;
        correct = words >= (q.minWords || 0);
        break;
      }
    }

    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setIsAnswered(true);

    // Update all results
    setResults(prev => ({
      ...prev,
      [currentQuestionIndex]: { isAnswered: true, isCorrect: correct }
    }));
    setAllAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      setShowSummary(true);
      if (onComplete) onComplete(score);
    } else {
      setCurrentQuestionIndex(i => i + 1);
    }
  };

  const retryQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowSummary(false);
    setIsAnswered(false);
    setAnswer(null);
    setAllAnswers({});
    setResults({});
    if (id) clearQuizSession(id);
  };

  if (showSummary) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto p-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-3">Quiz Completed!</h2>
        <p className="text-lg text-zinc-300 mb-8">
          You scored <span className="font-bold text-emerald-400">{score}</span> out of <span className="font-bold text-white">{questions.length}</span> questions.
        </p>
        <div className="space-y-4 w-full">
          <Button onClick={retryQuiz} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white h-12 text-base font-semibold">
            <RotateCcw className="w-4 h-4 mr-2" /> Retry Quiz
          </Button>
          {onComplete && (
            <Button onClick={() => onComplete(score)} className="w-full bg-orange-600 hover:bg-orange-500 text-white h-12 text-base font-semibold">
              Finish
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const renderQuestionContent = () => {
    switch (type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceViewer
            q={currentQuestion as MultipleChoiceQuestion}
            answer={stringAnswer}
            isAnswered={isAnswered}
            onSelect={(val) => {
              setAnswer(val);
              setAllAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
            }}
          />
        );
      case 'true-false':
        return (
          <TrueFalseViewer
            q={currentQuestion as TrueFalseQuestion}
            answer={booleanAnswer}
            isAnswered={isAnswered}
            onSelect={(val) => {
              setAnswer(val);
              setAllAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
            }}
          />
        );
      case 'short-answer':
      case 'fill-in-the-blank':
        return (
          <TextAnswerViewer
            q={currentQuestion as TextAnswerQuestion}
            answer={stringAnswer}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            onSelect={(val) => {
              setAnswer(val);
              setAllAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
            }}
          />
        );
      case 'coding':
        return (
          <CodingViewer
            q={currentQuestion as CodingQuestion}
            answer={stringAnswer}
            isAnswered={isAnswered}
            onSelect={(val) => {
              setAnswer(val);
              setAllAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
            }}
          />
        );
      case 'essay':
        return (
          <EssayViewer
            q={currentQuestion as EssayQuestion}
            answer={stringAnswer}
            isAnswered={isAnswered}
            onSelect={(val) => {
              setAnswer(val);
              setAllAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
            }}
          />
        );
      case 'matching':
        return (
          <MatchingViewer
            q={currentQuestion as MatchingQuestion}
            answer={matchingAnswer}
            isAnswered={isAnswered}
            onSelect={(val) => {
              setAnswer(val);
              setAllAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
            }}
          />
        );
      default:
        return (
          <div className="text-red-500 p-4 border border-red-500/20 bg-red-500/10 rounded-lg">
            <h4 className="font-bold mb-1">Unsupported question type</h4>
            <p className="text-xs opacity-70">Type: "{currentQuestion.type}"</p>
          </div>
        );
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'coding': return <Code className="w-4 h-4 text-zinc-500" />;
      case 'multiple-choice': return <List className="w-4 h-4 text-zinc-500" />;
      case 'true-false': return <CheckSquare className="w-4 h-4 text-zinc-500" />;
      case 'matching': return <LinkIcon className="w-4 h-4 text-zinc-500" />;
      case 'essay': return <FileText className="w-4 h-4 text-zinc-500" />;
      default: return <Type className="w-4 h-4 text-zinc-500" />;
    }
  }

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{normalizedQuiz.title}</h2>
          <div className="flex items-center gap-2 text-sm font-mono text-zinc-500">
            {getTypeIcon()}
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
          {Math.round(((currentQuestionIndex) / questions.length) * 100)}%
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-zinc-200 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {renderQuestionContent()}
        </div>

        {/* Feedback Area */}
        {isAnswered && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            {/* Explanation Block */}
            {currentQuestion.explanation && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300">
                <div className="flex items-center gap-2 mb-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-3 h-3" /> Explanation
                </div>
                <div className="leading-relaxed opacity-90">
                  {currentQuestion.explanation}
                </div>
              </div>
            )}

            {/* Specific Feedback based on correctness */}
            {!currentQuestion.explanation && (
              <div className={`p-4 rounded-lg border flex items-center gap-3 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="font-medium">{isCorrect ? "Correct!" : "Incorrect"}</span>
              </div>
            )}

            <Button
              onClick={nextQuestion}
              className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Action Button */}
        {!isAnswered && (
          <Button
            onClick={checkAnswer}
            disabled={!answer || (typeof answer === 'string' && answer.trim().length === 0)}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white h-12 text-base font-semibold shadow-lg shadow-orange-900/20"
          >
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
}
