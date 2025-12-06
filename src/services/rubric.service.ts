import apiService from './apiService';
import type { TypeRubric, TypeCreateRubricDto, TypeRubricDetails } from '../types/rubric.types';
import type { PaginatedResponse, TypeParamsGet } from '../types/utils.types';

const BASE_URL = '/rubrics';

export const rubricService = {

  getRubrics: async (params: TypeParamsGet) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeRubric>>(`${BASE_URL}/get-by-creator`, params);
      return {success: true, data: response.data , message: 'Rúbricas cargadas correctamente'};
    } catch (error) {      
      return {success: false, message: 'Error al cargar las rúbricas'};
    }
  },
  createRubric: async (data: TypeCreateRubricDto) => {
    try { 
      const response = await apiService.post(BASE_URL, data);
      return {success: true, data: response.data, message: 'Rúbrica creada correctamente'};
    } catch (error) {
      return {success: false, message: 'Error al crear la rúbrica'};
    }
  },

  getRubricById: async (id: string) => {
    try {
      const response = await apiService.get<TypeRubricDetails>(`${BASE_URL}/get-by-id/${id}`);
      return {success: true, data: response.data, message: 'Rúbrica cargada correctamente'};
    } catch (error) {
      return {success: false, message: 'Error al cargar la rúbrica'};
    }
  },

  uploadFromExcel: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // No establecer Content-Type manualmente - el navegador lo hace automáticamente para FormData
      // El interceptor en apiService ya maneja esto correctamente
      const response = await apiService.post(`${BASE_URL}/upload-excel`, formData);
      return {success: true, data: response.data, message: 'Rúbrica creada desde Excel exitosamente'};
    } catch (error: any) {
      // Manejar específicamente el error 404
      if (error.response?.status === 404) {
        return {
          success: false, 
          message: 'El endpoint de subida de Excel no está disponible en el backend. Por favor, contacta al administrador.'
        };
      }
      return {
        success: false, 
        message: error.response?.data?.message || error.message || 'Error al subir el archivo Excel'
      };
    }
  },
};

