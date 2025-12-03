import { useEffect, useState, useCallback } from "react";
import type { TypeCareer, TypeGetCareersParams } from "../types/carrers.types";
import { careersService } from "../services/carres.service";
import toast from "react-hot-toast";
import type { PaginationInfo } from "../types/utils.types";

export const useGetCarrers = (initialParams?: Partial<TypeGetCareersParams>) => {
  const [carrers, setCarrers] = useState<TypeCareer[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeGetCareersParams>({
    page: 1,
    limit: 10,
    search: '',
    ...initialParams,
  });

  const fetchCarrers = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await careersService.getCareers(params);
    if (success && data) {
      setCarrers(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addCareer = (career: TypeCareer) => {
    setCarrers((prevCarrers) => [...prevCarrers, career]);
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total + 1,
      });
    }
  };

  const updateParams = (newParams: Partial<TypeGetCareersParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status o modality, resetear a página 1
      if (newParams.search !== undefined || newParams.status !== undefined || newParams.modality !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchCarrers();
  }, [fetchCarrers]);

  return { 
    carrers, 
    loading, 
    pagination,
    refetch: fetchCarrers, 
    addCareer, 
    params, 
    setParams: updateParams 
  };
};