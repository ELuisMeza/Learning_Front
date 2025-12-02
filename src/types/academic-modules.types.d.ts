export interface TypeAcademicModule extends TypeAcademicModuleCreate {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  cycleName: string;
}

export interface TypeAcademicModuleCreate {
  cycleId: string;
  code: string;
  name: string;
  description: string;
  orderNumber: number;
}