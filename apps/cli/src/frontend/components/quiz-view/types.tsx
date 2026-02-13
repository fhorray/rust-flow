export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'fill-in-the-blank'
  | 'matching'
  | 'essay'
  | 'coding';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: { id: string; text: string; isCorrect: boolean; explanation?: string }[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface TextAnswerQuestion extends BaseQuestion {
  type: 'short-answer' | 'fill-in-the-blank';
  acceptedAnswers: string[];
  caseSensitive: boolean;
}

export interface CodingQuestion extends BaseQuestion {
  type: 'coding';
  language: string;
  startingCode?: string;
  solutionCode: string;
  testCases?: { input: string; expectedOutput: string }[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: { left: string; right: string }[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  minWords?: number;
  rubric?: string;
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | TextAnswerQuestion
  | CodingQuestion
  | MatchingQuestion
  | EssayQuestion;

export interface QuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export type Quiz = QuizData | QuizQuestion[];