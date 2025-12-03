import apiService from './apiService';
import type { TypeCreateEvaluation, TypeEvaluation, TypeEvaluationResult } from '../types/evaluation.types';

const baseUrl = '/evaluations';

export const evaluationService = {
  // Obtener evaluaciones de una clase
  getEvaluationsByClass: async (classId: string): Promise<TypeEvaluation[]> => {
    const response = await apiService.get(`/evaluations/class/${classId}`);
    return response.data;
  },

  create: async (data: TypeCreateEvaluation) => {
    try {
      const response = await apiService.post(baseUrl, data);
      return { success: true, data: response.data, message: 'Evaluación creada exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al crear la evaluación' };
    }
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

  getEvaluationTypes: async () => {
    try { 
    const response = await apiService.get('/evaluation-types');
    return { success: true, data: response.data, message: 'Tipos de evaluación obtenidos exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener los tipos de evaluación' };
    }
  },
};

