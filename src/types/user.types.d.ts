import type { TypeParamsGet } from "./utils.types";
import type { TypeRole } from "./role.types";
import type { TypeStatus, TypeGender } from "../lib/globals";

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

export interface TypeUserCreate {
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

export interface TypeGetUsersParams extends TypeParamsGet {
  status?: TypeStatus;
}

