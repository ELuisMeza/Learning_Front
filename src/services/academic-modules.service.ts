import apiService from "./apiService";
import type { PaginatedResponse } from "../types/utils.types";
import type { TypeAcademicModule, TypeAcademicModuleCreate, TypeGetAcademicModulesParams } from "../types/academic-modules.types";

const baseUrl = '/academic-modules';

export const academicModulesService = {
  getAcademicModules: async (params: TypeGetAcademicModulesParams) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeAcademicModule>>(`${baseUrl}/get-all`, params);
      return { success: true, data: response.data, message: 'Módulos académicos obtenidos exitosamente' };      
    } catch (error) {
      return { success: false, message: 'Error al obtener los módulos académicos' };
    }
  },

  create: async (academicModule: TypeAcademicModuleCreate) => {
    try {
      const response = await apiService.post<TypeAcademicModule>(`${baseUrl}`, academicModule);
      return { success: true, data: response.data, message: 'Módulo académico creado exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al crear el módulo académico' };
    }
  },
};