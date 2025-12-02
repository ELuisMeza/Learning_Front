import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo, TypeParamsGet } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeClassWithPagination } from "../types/class.types";
import { classService } from "../services/class.service";

export const useGetClasses = () => {
  const [classes, setClasses] = useState<TypeClassWithPagination[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeParamsGet>({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await classService.getAllWithPagination(params);
    if (success && data) {
      setClasses(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addClass = (newClass: TypeClassWithPagination) => {
    setClasses((prevClasses) => [...prevClasses, newClass]);
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
    fetchClasses();
  }, [fetchClasses]);

  return { 
    classes, 
    loading, 
    pagination,
    refetch: fetchClasses, 
    addClass, 
    params, 
    setParams: updateParams 
  };
};