import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeClassByTeacher, TypeGetClassesByTeacherParams } from "../types/class.types";
import { classService } from "../services/class.service";

export const useGetClassesByTeacher = () => {
  const [classes, setClasses] = useState<TypeClassByTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeGetClassesByTeacherParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await classService.getClassesByTeacher(params);
    if (success && data) {
      setClasses(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const updateParams = (newParams: Partial<TypeGetClassesByTeacherParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status, moduleId, teacherId o typeTeaching, resetear a página 1
      if (newParams.search !== undefined || newParams.moduleId !== undefined || newParams.cycleId !== undefined || newParams.carrerId !== undefined || newParams.typeTeaching !== undefined) {
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
    params, 
    setParams: updateParams 
  };
};