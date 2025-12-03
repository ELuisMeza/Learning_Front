import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { PaginationInfo } from "../types/utils.types";
import type { TypeUser, TypeGetUsersParams } from "../types/user.types";
import { userService } from "../services/user.service";

export const useGetUsers = () => {
  const [users, setUsers] = useState<TypeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [params, setParams] = useState<TypeGetUsersParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { success, data, message } = await userService.getAllUsers(params);
    if (success && data) {
      setUsers(data.data);
      setPagination(data.pagination);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }, [params]);

  const addUser = (user: TypeUser) => {
    setUsers((prevUsers) => [...prevUsers, user]);
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total + 1,
      });
    }
  };

  const updateParams = (newParams: Partial<TypeGetUsersParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      // Si cambia el search o status, resetear a página 1
      if (newParams.search !== undefined || newParams.status !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    loading, 
    pagination,
    refetch: fetchUsers, 
    addUser, 
    params, 
    setParams: updateParams 
  };
};