import { TypeEnrollmentStatus, TypeEvaluationMode, TypeModality } from "../lib/globals";

export const getTeachingModeLabel = (mode: TypeModality) => {
  const labels: Record<string, string> = {
    [TypeModality.IN_PERSON]: 'Presencial',
    [TypeModality.ONLINE]: 'En línea',
    [TypeModality.HYBRID]: 'Híbrido',
  };
  return labels[mode] || mode;
};  

export const getEvaluationModeLabel = (mode: TypeEvaluationMode) => {
  const labels: Record<string, string> = {
    [TypeEvaluationMode.TEACHER]: 'Evaluación del Docente',
    [TypeEvaluationMode.SELF]: 'Autoevaluación',
    [TypeEvaluationMode.PEER]: 'Coevaluación',
  };
  return labels[mode] || mode;
};  

export const getEnrollmentStatusLabel = (status: TypeEnrollmentStatus) => {
  const labels: Record<string, string> = {
    [TypeEnrollmentStatus.IN_COURSE]: 'En curso',
    [TypeEnrollmentStatus.COMPLETED]: 'Completado',
    [TypeEnrollmentStatus.WITHDRAWN]: 'Retirado',
  };
  return labels[status] || status;
};