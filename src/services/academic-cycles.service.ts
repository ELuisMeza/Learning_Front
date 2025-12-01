import type { TypeAcademicCycle, TypeCreateAcademicCycle } from "../types/academic-cycles";
import type { PaginatedResponse, TypeParamsGet } from "../types/utils.types";
import apiService from "./apiService";

const baseUrl = '/academic-cycles';

export const academicCyclesService = {

  getAcademicCycles: async (params: TypeParamsGet) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeAcademicCycle>>(`${baseUrl}/get-all`, params);
      return { success: true, data: response.data, message: 'Ciclos académicos obtenidos correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener los ciclos académicos', error: error };
    }
  },

  createAcademicCycle: async (academicCycle: TypeCreateAcademicCycle) => {
    try {
      const response = await apiService.post<TypeAcademicCycle>(`${baseUrl}`, academicCycle);
      return { success: true, data: response.data, message: 'Ciclo académico creado correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al crear el ciclo académico', error: error };
    }
  },
};