import type { TypeModality, TypeGender } from '../lib/globals';

export interface TypeTeacher extends TypeCreateTeacher {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypeCreateTeacher {
  // Campos del profesor
  appellative: string;
  specialty?: string;
  academicDegree?: string;
  experienceYears?: number;
  bio?: string;
  cvUrl?: string;
  TypeModality: TypeModality;
  
  // Campos del usuario
  documentType?: string;
  documentNumber?: string;
  email: string;
  password: string;
  roleId: string;
  name: string;
  lastNameFather: string;
  lastNameMother?: string;
  gender: TypeGender;
  birthdate: string;
  phone?: string;
}