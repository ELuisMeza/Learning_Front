import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo, TypeParamsGet } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeRubric } from "../types/rubric.types";
import { rubricService } from "../services/rubric.service";

export const useGetRubrics = () => {
  const [rubrics, setRubrics] = useState<TypeRubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeParamsGet>({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchRubrics = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await rubricService.getRubrics(params);
    if (success && data) {
      setRubrics(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addRubric = (newRubric: TypeRubric) => {
    setRubrics((prevRubrics) => [...prevRubrics, newRubric]);
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total + 1,
      });
    }
  };

  const updateParams = (newParams: Partial<TypeParamsGet>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status, moduleId, teacherId o typeTeaching, resetear a página 1
      if (newParams.search !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchRubrics();
  }, [fetchRubrics]);

  return { 
    rubrics, 
    loading, 
    pagination,
    refetch: fetchRubrics, 
    addRubric, 
    params, 
    setParams: updateParams 
  };
};