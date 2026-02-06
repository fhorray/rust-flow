export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: QuizOption[];
}

export interface Quiz {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}
