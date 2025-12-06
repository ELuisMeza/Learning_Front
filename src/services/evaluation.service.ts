import apiService from './apiService';
import type { TypeCreateEvaluation, TypeEvaluation, TypeEvaluationResult, TypeEvaluationWithDetails, TypeParamsEvaluation } from '../types/evaluation.types';
import type { PaginatedResponse } from '../types/utils.types';

const baseUrl = '/evaluations';

export const evaluationService = {
  // Obtener evaluaciones de una clase
  getEvaluationsByClass: async (classId: string): Promise<TypeEvaluation[]> => {
    try {
      // Usar el endpoint get-mine-teacher con classId como filtro
      const response = await apiService.post<PaginatedResponse<TypeEvaluationWithDetails>>(
        `${baseUrl}/get-mine-teacher`,
        { classId, page: 1, limit: 1000, search: '' }
      );
      // Convertir TypeEvaluationWithDetails a TypeEvaluation
      const evaluations: TypeEvaluation[] = (response.data.data || []).map((evaluation: TypeEvaluationWithDetails) => ({
        id: evaluation.id,
        rubricId: evaluation.rubricId,
        classId: evaluation.classId,
        name: evaluation.name,
        description: evaluation.description,
        type: evaluation.evaluationMode === 'teacher' ? 'individual' : 
              evaluation.evaluationMode === 'self' ? 'self' : 
              evaluation.evaluationMode === 'peer' ? 'peer' : 'group',
        status: evaluation.status as 'draft' | 'active' | 'completed',
        startDate: evaluation.startDate,
        endDate: evaluation.endDate,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
        evaluationMode: evaluation.evaluationMode,
        evaluationTypeId: evaluation.evaluationTypeId,
        evaluationTypeName: evaluation.evaluationTypeName,
        className: evaluation.className,
        rubricName: evaluation.rubricName,
      }));
      return evaluations;
    } catch (error) {
      console.error('Error al obtener evaluaciones por clase:', error);
      return [];
    }
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

  // Obtener evaluaciones del estudiante
  getMyEvaluations: async (): Promise<TypeEvaluation[]> => {
    const response = await apiService.get('/evaluations/my-evaluations');
    return response.data;
  },

  // Obtener preguntas de un examen
  getEvaluationQuestions: async (evaluationId: string) => {
    const response = await apiService.get(`/evaluations-questions/evaluation/${evaluationId}`);
    return response.data;
  },

  // Enviar respuestas de examen
  submitExamAnswers: async (evaluationId: string, answers: { questionId: string; optionId: string }[]) => {
    const response = await apiService.post(`/evaluations/${evaluationId}/submit-exam`, { answers });
    return response.data;
  },

  // Obtener respuestas del examen del estudiante
  getExamAnswers: async (evaluationId: string, studentId?: string) => {
    try {
      // Intentar diferentes endpoints según disponibilidad
      let url = '';
      if (studentId) {
        url = `/evaluation-answers/evaluation/${evaluationId}/student/${studentId}`;
      } else {
        // Primero intentar endpoint para el usuario actual
        url = `/evaluation-answers/evaluation/${evaluationId}/my-answers`;
      }
      
      const response = await apiService.get(url);
      return response.data || [];
    } catch (error: any) {
      // Si el endpoint no existe, retornar array vacío
      // El backend debería implementar este endpoint para mostrar las respuestas correctamente
      console.warn('Endpoint de respuestas de examen no disponible:', error.message);
      return [];
    }
  },
};

