import type { TypeModality, TypeGender, TypeStatus } from '../lib/globals';
import type { TypeParamsGet } from './utils.types';

export interface TypeTeacher extends TypeCreateTeacher {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypeCreateTeacher {
  appellative: string;
  specialty?: string;
  academicDegree?: string;
  experienceYears?: number;
  bio?: string;
  cvUrl?: string;
  teachingModes: TypeModality;
  documentType?: string;
  documentNumber?: string;
  email: string;
  password: string;
  name: string;
  lastNameFather: string;
  lastNameMother?: string;
  gender: TypeGender;
  birthdate: string;
  phone?: string;
}

export interface TypeGetTeachersParams extends TypeParamsGet {
  status?: TypeStatus;
  typeTeaching?: TypeModality;
}