import { useCallback, useEffect, useState } from "react";
import type { PaginationInfo } from "../types/utils.types";
import toast from "react-hot-toast";
import type { TypeTeacher, TypeGetTeachersParams } from "../types/teachers.types";
import { teacherService } from "../services/teacher.service";

export const useGetTeachers = (initialParams?: Partial<TypeGetTeachersParams>) => {
  const [teachers, setTeachers] = useState<TypeTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeGetTeachersParams>({
    page: 1,
    limit: 10,
    search: '',
    ...initialParams,
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

  const updateParams = (newParams: Partial<TypeGetTeachersParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search, status o typeTeaching, resetear a página 1
      if (newParams.search !== undefined || newParams.status !== undefined || newParams.typeTeaching !== undefined) {
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