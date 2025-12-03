export const TypeGender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export type TypeGender = typeof TypeGender[keyof typeof TypeGender];

export const TypeModality = {
  IN_PERSON: 'in_person',
  ONLINE: 'online',
  HYBRID: 'hybrid',
} as const;

export type TypeModality = typeof TypeModality[keyof typeof TypeModality];