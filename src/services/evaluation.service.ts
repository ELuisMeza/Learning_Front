import apiService from './apiService';
import type { TypeEvaluation, TypeEvaluationResult } from '../types/evaluation.types';

export const evaluationService = {
  // Obtener evaluaciones de una clase
  getEvaluationsByClass: async (classId: string): Promise<TypeEvaluation[]> => {
    const response = await apiService.get(`/evaluations/class/${classId}`);
    return response.data;
  },

  // Crear una nueva evaluación
  createEvaluation: async (data: {
    name: string;
    description: string;
    rubricId: string;
    classId: string;
    type: 'self' | 'peer' | 'individual' | 'group';
    startDate: string;
    endDate: string;
  }): Promise<TypeEvaluation> => {
    const response = await apiService.post('/evaluations', data);
    return response.data;
  },

  // Obtener una evaluación por ID
  getEvaluationById: async (id: string): Promise<TypeEvaluation> => {
    const response = await apiService.get(`/evaluations/${id}`);
    return response.data;
  },

  // Enviar resultado de evaluación
  submitEvaluation: async (evaluationId: string, data: {
    evaluatedId: string;
    scores: { criteriaId: string; levelId: string; score: number }[];
    comments?: string;
  }): Promise<TypeEvaluationResult> => {
    const response = await apiService.post(`/evaluations/${evaluationId}/submit`, data);
    return response.data;
  },

  // Obtener resultados de una evaluación
  getEvaluationResults: async (evaluationId: string): Promise<TypeEvaluationResult[]> => {
    const response = await apiService.get(`/evaluations/${evaluationId}/results`);
    return response.data;
  },

  // Exportar resultados a Google Sheets
  exportToGoogleSheets: async (evaluationId: string): Promise<{ url: string }> => {
    const response = await apiService.post(`/evaluations/${evaluationId}/export/google-sheets`);
    return response.data;
  },

  // Obtener evaluaciones del estudiante actual
  getMyEvaluations: async (): Promise<TypeEvaluation[]> => {
    const response = await apiService.get('/evaluations/student/me');
    return response.data;
  },
};

