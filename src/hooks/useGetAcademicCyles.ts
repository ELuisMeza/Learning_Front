import { useCallback, useEffect, useState } from "react";
import type { TypeAcademicCycle, TypeGetAcademicCyclesParams } from "../types/academic-cycles";
import type { PaginationInfo } from "../types/utils.types";
import { academicCyclesService } from "../services/academic-cycles.service";
import toast from "react-hot-toast";

export const useGetAcademicCyles = (initialParams?: Partial<TypeGetAcademicCyclesParams>) => {
  const [academicCycles, setAcademicCycles] = useState<TypeAcademicCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeGetAcademicCyclesParams>({
    page: 1,
    limit: 10,
    search: '',
    ...initialParams,
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

  const updateParams = (newParams: Partial<TypeGetAcademicCyclesParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status o careerId, resetear a página 1
      if (newParams.search !== undefined || newParams.status !== undefined || newParams.careerId !== undefined) {
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