import type { TypeClass } from './class.types';

export interface TypeRubric {
  id: string;
  name: string;
  description: string;
  classId: string;
  class?: TypeClass;
  fileUrl?: string; // URL del archivo Excel subido
  criteria: TypeRubricCriteria[];
  createdAt: string;
  updatedAt: string;
}

export interface TypeRubricCriteria {
  id: string;
  rubricId: string;
  name: string;
  description: string;
  weight: number; // Peso del criterio (ej: 0.25 para 25%)
  levels: TypeRubricLevel[];
}

export interface TypeRubricLevel {
  id: string;
  criteriaId: string;
  name: string; // Ej: "Excelente", "Bueno", "Regular", "Insuficiente"
  score: number; // Puntuación de este nivel
  description: string;
}

