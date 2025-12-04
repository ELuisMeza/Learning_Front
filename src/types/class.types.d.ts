import type { TypeUser } from './user.types';
import type { TypeAcademicModule } from './academic-modules.types';
import type { TypeModality, TypeStatus } from '../lib/globals';
import type { TypeTeacher } from './teachers.types';
import type { TypeParamsGet } from './utils.types';

export interface TypeClass {
  id: string;
  name: string;
  description: string;
  code: string; // Código QR
  qrCode: string; // URL o base64 del QR
  teacherId: string;
  teacher?: TypeUser;
  status: TypeStatus;
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

export interface TypeClassWithPagination {
  id: string;
  moduleId: string;
  module: TypeAcademicModule | null;
  code: string;
  name: string;
  description: string;
  credits: number;
  status: TypeStatus;
  teacherId: string;
  appellative: string;
  typeTeaching: TypeModality;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
  moduleName: string;
}

export interface TypeCreateClass {
  moduleId: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  maxStudents: number;
  teacherId: string;
  typeTeaching: TypeModality;
}

export interface TypeClassDetails {
  id: string;
  moduleId: string;
  module: TypeAcademicModule;
  code: string;
  name: string;
  description: string;
  credits: number;
  status: TypeStatus;
  teacherId: string;
  teacher: TypeTeacher;
  typeTeaching: TypeModality;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypeClassByTeacher {
  id: string;
  name: string;
  description: string;
  credits: number;
  typeteaching: TypeModality;
  maxstudents: number;
  createdat: string;
  modulename: string;
  modulecode: string;
  cycleid: string;
  cyclename: string;
  cyclecode: string;
  careerid: string;
  careername: string;
  careercode: string;
}

export interface TypeGetClassesParams extends TypeParamsGet {
  status?: TypeStatus;
  moduleId?: string;
  teacherId?: string;
  typeTeaching?: TypeModality;
}

export interface TypeGetClassesByTeacherParams extends TypeParamsGet {
  moduleId?: string;
  cycleId?: string;
  carrerId?: string;
  typeTeaching?: TypeModality;

}