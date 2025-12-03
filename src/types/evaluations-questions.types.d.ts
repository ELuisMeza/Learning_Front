export interface QuestionOption {
  label: string;
  is_correct: boolean;
}

export interface Question {
  label: string;
  score?: number;
  options: QuestionOption[];
}

export interface CreateForm {
  evaluation_id: string;
  questions: Question[];
}

