import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo, TypeParamsGet } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeAcademicModule } from "../types/academic-modules.types";
import { academicModulesService } from "../services/academic-modules.service";

export const useGetAcademicModules = () => {
  const [academicModules, setAcademicModules] = useState<TypeAcademicModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeParamsGet>({
    page: 1,
    limit: 10,
    search: '',
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