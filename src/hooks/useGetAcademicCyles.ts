import { useCallback, useEffect, useState } from "react";
import type { TypeAcademicCycle } from "../types/academic-cycles";
import type { PaginationInfo, TypeParamsGet } from "../types/utils.types";
import { academicCyclesService } from "../services/academic-cycles.service";
import toast from "react-hot-toast";

export const useGetAcademicCyles = () => {
  const [academicCycles, setAcademicCycles] = useState<TypeAcademicCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeParamsGet>({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchAcademicCycles = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await academicCyclesService.getAcademicCycles(params);
    if (success && data) {
      setAcademicCycles(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addAcademicCycle = (academicCycle: TypeAcademicCycle) => {
    setAcademicCycles((prevAcademicCycles) => [...prevAcademicCycles, academicCycle]);
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
      // Si cambia el search, resetear a página 1
      if (newParams.search !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchAcademicCycles();
  }, [fetchAcademicCycles]);

  return { 
    academicCycles, 
    loading, 
    pagination,
    refetch: fetchAcademicCycles, 
    addAcademicCycle, 
    params, 
    setParams: updateParams 
  };
};