import type { TypeModality, TypeStatus } from "../lib/globals";
import type { TypeParamsGet } from "./utils.types";

export interface TypeCareer extends TypeCreateCareer {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface TypeCreateCareer {
    code: string;
    name: string;
    description: string;
    degreeTitle: string;
    modality: TypeModality;
    durationYears: number;
    totalCredits: number;
}

export interface TypeGetCareersParams extends TypeParamsGet {
    status?: TypeStatus;
    modality?: TypeModality;
}
