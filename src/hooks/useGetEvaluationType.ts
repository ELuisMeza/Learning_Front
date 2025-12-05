import { toast } from "react-hot-toast";
import { evaluationService } from "../services/evaluation.service";
import { useEffect, useState } from "react";
import type { TypeEvaluationType } from "../types/evaluation.types";

export const useGetEvaluationType = () => {
  const [evaluationTypes, setEvaluationTypes] = useState<TypeEvaluationType[]>([]);
  const [loading, setLoading] = useState(false);
  const loadEvaluationTypes = async () => {
    setLoading(true);
    try {
      const { success, data } = await evaluationService.getEvaluationTypes();
      if (success && data) {
        setEvaluationTypes(data);
      } else {
        toast.error('Error al cargar los tipos de evaluación');
      }
    } catch (error) {
      toast.error('Error al cargar los tipos de evaluación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluationTypes();
  }, []);

  return {
    loadEvaluationTypes,
    evaluationTypes,
    loading,
  };
};