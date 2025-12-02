export interface TypeTeacher extends TypeCreateTeacher {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypeCreateTeacher {
  specialty: string;
  academicDegree: string;
  experienceYears: number;
  bio: string;
  cvUrl: string;
  teachingModes: string;
  appellative: string;
}