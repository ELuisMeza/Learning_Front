import { TypeModality } from "../lib/globals";

export const getTeachingModeLabel = (mode: TypeModality) => {
  const labels: Record<string, string> = {
    [TypeModality.IN_PERSON]: 'Presencial',
    [TypeModality.ONLINE]: 'En línea',
    [TypeModality.HYBRID]: 'Híbrido',
  };
  return labels[mode] || mode;
};  