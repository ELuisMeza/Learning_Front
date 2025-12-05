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
};

