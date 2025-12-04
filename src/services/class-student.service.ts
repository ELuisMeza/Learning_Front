import type { TypeClassStudent } from "../types/class.types";
import apiService from "./apiService";

const baseUrl = '/class-students';

export const classStudentService = {
  getStudentsByClass: async (classId: string) => {
    try {
      const response = await apiService.get<TypeClassStudent[]>(`${baseUrl}/by-class/${classId}`);
      return { success: true, data: response.data, message: 'Estudiantes obtenidos exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener los estudiantes' };
    }
  },
};