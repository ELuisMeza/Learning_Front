import type { TypeUser } from './user.types';
import type { TypeRubric, TypeRubricCriteria, TypeRubricLevel } from './rubric.types';
import type { TypeClass } from './class.types';
import type { TypeEvaluationMode } from '../lib/globals';
import type { TypeParamsGet } from './utils.types';

export interface TypeEvaluation {
  id: string;
  rubricId: string | null;
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
  completed?: boolean; // Indica si el estudiante ya completó esta evaluación
  resultId?: string | null; // ID del resultado si existe
  resultScore?: number | null; // Puntaje obtenido si existe
  resultEvaluatedAt?: string | null; // Fecha en que se completó
  // Campos para determinar el tipo de evaluación
  evaluationTypeId?: string;
  evaluationType?: TypeEvaluationType; // Objeto con el tipo de evaluación (Examen, Tarea, etc.)
  evaluationMode?: TypeEvaluationMode; // Modo de evaluación (teacher, self, peer, etc.)
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

export interface TypeCreateEvaluation {
  classId: string;
  name: string;
  description: string;
  rubricId?: string;
  maxScore: number;
  evaluationTypeId: string;
  evaluationMode: TypeEvaluationMode;
  startDate: string;
  endDate: string;
}

export interface TypeEvaluationType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypeParamsEvaluation extends TypeParamsGet {
  classId?: string;
  rubricId?: string;
  evaluationTypeId?: string;
  evaluationMode?: TypeEvaluationMode;
  startDate?: string;
  endDate?: string;
}

export interface TypeEvaluationWithDetails {
  id: string;
  classId: string;
  name: string;
  description: string;
  evaluationMode: TypeEvaluationMode;
  evaluationTypeId: string;
  rubricId: string | null;
  maxScore: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  className: string;
  evaluationTypeName: string;
  rubricName: string | null;
}