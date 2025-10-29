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