import type { TypeStatus } from "../lib/globals";
import type { TypeParamsGet } from "./utils.types";
import type { TypeCareer } from "./carrers.types";

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

export interface TypeGetAcademicCyclesParams extends TypeParamsGet {
  status?: TypeStatus;
  careerId?: string;
}