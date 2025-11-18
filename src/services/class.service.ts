import apiService from './apiService';
import type { TypeClass, TypeClassStudent } from '../types/class.types';

export const classService = {
  // Obtener todas las clases del docente
  getClasses: async (): Promise<TypeClass[]> => {
    const response = await apiService.get('/classes');
    return response.data;
  },

  // Crear una nueva clase
  createClass: async (data: { name: string; description: string }): Promise<TypeClass> => {
    const response = await apiService.post('/classes', data);
    return response.data;
  },

  // Obtener una clase por ID
  getClassById: async (id: string): Promise<TypeClass> => {
    const response = await apiService.get(`/classes/${id}`);
    return response.data;
  },

  // Obtener clase por código QR
  getClassByCode: async (code: string): Promise<TypeClass> => {
    const response = await apiService.get(`/classes/code/${code}`);
    return response.data;
  },

  // Inscribir estudiante a una clase (autoinscripción)
  enrollStudent: async (classId: string): Promise<TypeClassStudent> => {
    const response = await apiService.post(`/classes/${classId}/enroll`);
    return response.data;
  },

  // Obtener estudiantes de una clase
  getClassStudents: async (classId: string): Promise<TypeClassStudent[]> => {
    const response = await apiService.get(`/classes/${classId}/students`);
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
};

