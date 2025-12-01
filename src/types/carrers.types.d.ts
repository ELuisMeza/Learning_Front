import type { TypeModality } from "../lib/globals";

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
