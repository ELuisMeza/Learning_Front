import type { TypeClass } from './class.types';

export interface TypeRubric {
  id: string;
  name: string;
  description: string;
  createdat: string;
  usercreatorid: string;
}
export interface TypeCreateRubricLevelDto {
  name: string;
  description?: string;
  score: number;
}

export interface TypeCreateRubricCriterionDto {
  name: string;
  description?: string;
  weight?: number;
  levels: TypeCreateRubricLevelDto[];
}

export interface TypeCreateRubricDto {
  name: string;
  description?: string;
  criteria: TypeCreateRubricCriterionDto[];
}

export interface UserCreator {
  id: string;
  name: string;
  email: string;
}

export interface Level {
  id: string;
  name: string;
  description: string | null;
  score: number | string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string | null;
  weight: number | string;
  levels: Level[];
}

export interface TypeRubricDetails {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  user_creator: UserCreator;
  criteria: Criterion[];
}

