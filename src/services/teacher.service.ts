import type { TypeCreateTeacher, TypeTeacher } from "../types/teachers.types";
import type { PaginatedResponse, TypeParamsGet } from "../types/utils.types";
import apiService from "./apiService";

const baseURL = 'teachers';

export const teacherService = {
    getTeachers: async (params: TypeParamsGet) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeTeacher>>(`${baseURL}/get-all`, params);
      return { success: true, data: response.data, message: 'Profesores obtenidos exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener los profesores' };
    }
  },
  createTeacher: async (data: TypeCreateTeacher) => {
    try {
      const response = await apiService.post<TypeTeacher>(`${baseURL}`, data);
      return { success: true, data: response.data, message: 'Profesor creado exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al crear el profesor' };
    }
  }
}