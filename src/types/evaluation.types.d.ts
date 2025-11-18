import type { TypeUser } from './user.types';
import type { TypeRubric, TypeRubricCriteria, TypeRubricLevel } from './rubric.types';
import type { TypeClass } from './class.types';

export interface TypeEvaluation {
  id: string;
  rubricId: string;
  rubric?: TypeRubric;
  classId: string;
  class?: TypeClass;
  name: string;
  description: string;
  type: 'self' | 'peer' | 'individual' | 'group'; // autoevaluación, coevaluación, individual, grupal
  status: 'draft' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  results?: TypeEvaluationResult[];
}

export interface TypeEvaluationResult {
  id: string;
  evaluationId: string;
  evaluatorId: string; // Quien evalúa
  evaluator?: TypeUser;
  evaluatedId: string; // Quien es evaluado (puede ser el mismo en autoevaluación)
  evaluated?: TypeUser;
  groupId?: string; // Si es evaluación grupal
  scores: TypeEvaluationScore[];
  totalScore: number;
  comments?: string;
  submittedAt: string;
}

export interface TypeEvaluationScore {
  id: string;
  resultId: string;
  criteriaId: string;
  criteria?: TypeRubricCriteria;
  levelId: string;
  level?: TypeRubricLevel;
  score: number;
}

