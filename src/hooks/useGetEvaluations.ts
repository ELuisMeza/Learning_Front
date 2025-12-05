import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { PaginationInfo } from "../types/utils.types";
import type { TypeEvaluationWithDetails, TypeParamsEvaluation } from "../types/evaluation.types";
import { evaluationService } from "../services/evaluation.service";

export const useGetEvaluations = (initialParams?: Partial<TypeParamsEvaluation>) => {
  const [evaluations, setEvaluations] = useState<TypeEvaluationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeParamsEvaluation>({
    page: 1,
    limit: 10,
    search: '',
    ...(initialParams || {}),
  });

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await evaluationService.getMyEvaluationsTeacher(params);
    if (success && data) {
      setEvaluations(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addEvaluation = (evaluation: TypeEvaluationWithDetails) => {
    setEvaluations((prevEvaluations) => [...prevEvaluations, evaluation]);
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total + 1,
      });
    }
  };

  const updateParams = (newParams: Partial<TypeParamsEvaluation>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status o modality, resetear a página 1
      if (newParams.search !== undefined || newParams.evaluationTypeId !== undefined || newParams.evaluationMode !== undefined || newParams.startDate !== undefined || newParams.endDate !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  return { 
    evaluations, 
    loading, 
    pagination,
    refetch: fetchEvaluations, 
    addEvaluation, 
    params, 
    setParams: updateParams 
  };
};