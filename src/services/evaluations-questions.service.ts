import apiService from './apiService';
import type { CreateForm } from '../types/evaluations-questions.types';

const baseUrl = '/evaluations-questions';

export const evaluationsQuestionsService = {
  createForm: async (data: CreateForm) => {
    try {
      const response = await apiService.post(`${baseUrl}/create-form`, data);
      return { success: true, data: response.data, message: 'Formulario creado exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al crear el formulario' };
    }
  },
};

