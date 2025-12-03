import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeAcademicModule, TypeGetAcademicModulesParams } from "../types/academic-modules.types";
import { academicModulesService } from "../services/academic-modules.service";

export const useGetAcademicModules = (initialParams?: Partial<TypeGetAcademicModulesParams>) => {
  const [academicModules, setAcademicModules] = useState<TypeAcademicModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeGetAcademicModulesParams>({
    page: 1,
    limit: 10,
    search: '',
    ...initialParams,
  });

  const fetchAcademicModules = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await academicModulesService.getAcademicModules(params);
    if (success && data) {
      setAcademicModules(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addAcademicModule = (academicModule: TypeAcademicModule) => {
    setAcademicModules((prevAcademicModules) => [...prevAcademicModules, academicModule]);
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total + 1,
      });
    }
  };

  const updateParams = (newParams: Partial<TypeGetAcademicModulesParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status o cycleId, resetear a página 1
      if (newParams.search !== undefined || newParams.status !== undefined || newParams.cycleId !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchAcademicModules();
  }, [fetchAcademicModules]);

  return { 
    academicModules, 
    loading, 
    pagination,
    refetch: fetchAcademicModules, 
    addAcademicModule, 
    params, 
    setParams: updateParams 
  };
};