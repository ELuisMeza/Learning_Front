import apiService from './apiService';
import type { TypeRubric } from '../types/rubric.types';

export const rubricService = {
  // Obtener rúbricas de una clase
  getRubricsByClass: async (classId: string): Promise<TypeRubric[]> => {
    const response = await apiService.get(`/rubrics/class/${classId}`);
    return response.data;
  },

  // Crear una nueva rúbrica
  createRubric: async (data: { name: string; description: string; classId: string }): Promise<TypeRubric> => {
    const response = await apiService.post('/rubrics', data);
    return response.data;
  },

  // Subir rúbrica desde archivo Excel
  uploadRubricExcel: async (classId: string, file: File): Promise<TypeRubric> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', classId);
    
    const response = await apiService.post(`/rubrics/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtener una rúbrica por ID
  getRubricById: async (id: string): Promise<TypeRubric> => {
    const response = await apiService.get(`/rubrics/${id}`);
    return response.data;
  },
};

