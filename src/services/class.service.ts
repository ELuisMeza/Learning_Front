import apiService from './apiService';
import type { TypeClass, TypeClassStudent, TypeClassWithPagination, TypeCreateClass } from '../types/class.types';
import type { TypeParamsGet } from '../types/utils.types';
import type { PaginatedResponse } from '../types/utils.types';

const baseUrl = '/classes';

export const classService = {
  // Obtener todas las clases del docente
  getClasses: async (): Promise<TypeClass[]> => {
    const response = await apiService.get(baseUrl);
    return response.data;
  },

  createClass: async (data: TypeCreateClass) => {
    try {
      const response = await apiService.post(baseUrl, data);
      return { success: true, data: response.data, message: 'Clase creada exitosamente' };      
    } catch (error) {
      return { success: false, message: 'Error al crear la clase' };
    }
  },

  // Obtener una clase por ID
  getClassById: async (id: string): Promise<TypeClass> => {
    const response = await apiService.get(`${baseUrl}/${id}`);
    return response.data;
  },

  // Obtener clase por código QR
  getClassByCode: async (code: string): Promise<TypeClass> => {
    const response = await apiService.get(`${baseUrl}/code/${code}`);
    return response.data;
  },

  // Inscribir estudiante a una clase (autoinscripción)
  enrollStudent: async (classId: string): Promise<TypeClassStudent> => {
    const response = await apiService.post(`${baseUrl}/${classId}/enroll`);
    return response.data;
  },

  // Obtener estudiantes de una clase
  getClassStudents: async (classId: string): Promise<TypeClassStudent[]> => {
    const response = await apiService.get(`${baseUrl}/${classId}/students`);
    return response.data;
  },

  // Obtener clases del estudiante actual
  getMyClasses: async (): Promise<TypeClass[]> => {
    const response = await apiService.get('/class-students/by-student');
    // El backend retorna ClassStudent[] con la estructura { class: Class, enrollmentDate: Date, ... }
    // Necesitamos mapear para obtener solo las clases con la fecha de inscripción
    const classStudents = response.data;
    return classStudents.map((cs: any) => ({
      ...cs.class,
      enrollmentDate: cs.enrollmentDate,
      enrollmentStatus: cs.status,
    }));
  },

  getAllWithPagination: async (params: TypeParamsGet) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeClassWithPagination>>(`${baseUrl}/get-all`, params);
      return { success: true, data: response.data, message: 'Clases obtenidas exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener las clases' };
    }
  },
};

