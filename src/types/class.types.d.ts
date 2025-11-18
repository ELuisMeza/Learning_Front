import type { TypeUser } from './user.types';

export interface TypeClass {
  id: string;
  name: string;
  description: string;
  code: string; // Código QR
  qrCode: string; // URL o base64 del QR
  teacherId: string;
  teacher?: TypeUser;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
  students?: TypeClassStudent[];
  // Propiedades adicionales cuando se obtiene desde el endpoint del estudiante
  enrollmentDate?: string; // Fecha de inscripción del estudiante
  enrollmentStatus?: string; // Estado de la inscripción
}

export interface TypeClassStudent {
  id: string;
  classId: string;
  studentId: string;
  student?: TypeUser;
  enrolledAt: string;
  status: 'enrolled' | 'completed';
}

