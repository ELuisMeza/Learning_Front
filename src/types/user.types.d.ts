export interface TypeUser {
  id: string;
  name: string;
  lastNameFather: string;
  lastNameMother: string;
  documentType: string;
  documentNumber: string;
  email: string;
  status: string;
  gender: string;
  birthdate: string;
  phone: string;
  roleId: string;
  role: TypeRole;
  teacherId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GenderType = 'male' | 'female' | 'other';

export interface TypeUserCreate {
  documentType?: string;
  documentNumber?: string;
  email: string;
  password: string;
  roleId: string;
  name: string;
  lastNameFather: string;
  lastNameMother?: string;
  gender: GenderType;
  birthdate: string;
  phone?: string;
}




