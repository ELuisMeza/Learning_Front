export const TypeGender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export type TypeGender = typeof TypeGender[keyof typeof TypeGender];

export const TypeModality = {
  IN_PERSON: 'in_person',
  ONLINE: 'online',
  HYBRID: 'hybrid',
} as const;

export type TypeModality = typeof TypeModality[keyof typeof TypeModality];

export const TypeEvaluationMode = {
  SELF: 'self',
  PEER: 'peer',
  TEACHER: 'teacher',
} as const;

export type TypeEvaluationMode = typeof TypeEvaluationMode[keyof typeof TypeEvaluationMode];

export const TypeStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type TypeStatus = typeof TypeStatus[keyof typeof TypeStatus];

export const TypeDocumentType = {
  DNI: 'DNI',
  CE: 'CE',
  PASSPORT: 'PASSPORT',
} as const;

export type TypeDocumentType = typeof TypeDocumentType[keyof typeof TypeDocumentType];

export const TypeEnrollmentStatus = {
  IN_COURSE: 'in_course',
  COMPLETED: 'completed',
  WITHDRAWN: 'withdrawn',
} as const;

export type TypeEnrollmentStatus = typeof TypeEnrollmentStatus[keyof typeof TypeEnrollmentStatus];
