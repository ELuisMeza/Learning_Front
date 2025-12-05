import apiService from './apiService';
import type { TypeCreateEvaluation, TypeEvaluation, TypeEvaluationResult, TypeEvaluationWithDetails, TypeParamsEvaluation } from '../types/evaluation.types';
import type { PaginatedResponse } from '../types/utils.types';

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

  getMyEvaluationsTeacher: async ( params: TypeParamsEvaluation ) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeEvaluationWithDetails>>(`${baseUrl}/get-mine-teacher`, params);
      return { success: true, data: response.data, message: 'Evaluaciones obtenidas exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener las evaluaciones' };
    }
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

