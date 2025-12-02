import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo, TypeParamsGet } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeTeacher } from "../types/teachers.types";
import { teacherService } from "../services/teacher.service";

export const useGetTeachers = () => {
  const [teachers, setTeachers] = useState<TypeTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeParamsGet>({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await teacherService.getTeachers(params);
    if (success && data) {
      setTeachers(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addTeacher = (newTeacher: TypeTeacher) => {
    setTeachers((prevTeachers) => [...prevTeachers, newTeacher]);
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
    fetchTeachers();
  }, [fetchTeachers]);

  return { 
    teachers, 
    loading, 
    pagination,
    refetch: fetchTeachers, 
    addTeacher, 
    params, 
    setParams: updateParams 
  };
};