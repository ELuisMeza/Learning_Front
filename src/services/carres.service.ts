import type { TypeCareer, TypeCreateCareer, TypeGetCareersParams } from "../types/carrers.types";
import type { PaginatedResponse } from "../types/utils.types";
import apiService from "./apiService";

const baseUrl = '/careers';

export const careersService = {
  getCareers: async (params: TypeGetCareersParams): Promise<{ success: boolean, data?: PaginatedResponse<TypeCareer>, message: string, error?: any }> => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeCareer>>(`${baseUrl}/get-all`, params);
      return { success: true, data: response.data, message: 'Carreras obtenidas correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener las carreras', error: error };
    }
  },

  create: async (career: TypeCreateCareer) => {
    try {
      const response = await apiService.post<TypeCareer>(`${baseUrl}`, career);
      return { success: true, data: response.data, message: 'Carrera creada correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al crear la carrera', error: error };
    }
  },

};