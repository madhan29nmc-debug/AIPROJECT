export interface Question {
  question: string;
  options?: string[];
  answer: string;
  type: 'mcq' | 'short' | 'long';
  marks: number;
}

export interface QuestionPaper {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  created_at: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
