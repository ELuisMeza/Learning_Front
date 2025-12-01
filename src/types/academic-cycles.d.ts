export interface TypeAcademicCycle {
  id: string;
  careerId: string;
  career: TypeCareer | null;
  code: string;
  name: string;
  description: string;
  orderNumber: number;
  creditsRequired: number;
  durationWeeks: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  careerName: string;
}

export interface TypeCreateAcademicCycle {
  careerId: string;
  code: string;
  name: string;
  description: string;
  orderNumber: number;
  creditsRequired: number;
  durationWeeks: number;
}