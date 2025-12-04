import type { TypeCreateTeacher, TypeTeacher } from "../types/teachers.types";
import type { TypeGetUsersParams, TypeUser, TypeUserCreate } from "../types/user.types";
import type { PaginatedResponse } from "../types/utils.types";
import apiService from "./apiService";
import type { AxiosError } from "axios";

const baseURL = 'users';

export const userService = {
  getUserMe: async (): Promise<{success: boolean, data?: TypeUser, message: string}> => {
    try {
      const response = await apiService.get(`/${baseURL}/me`);
      return { success: true, data: response.data, message: 'Usuario obtenido exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener el usuario' };
    }
  },

  createUser: async (data: TypeUserCreate) => {
    try {
      const response = await apiService.post<TypeUser>(`${baseURL}`, data);
      return { success: true, data: response.data, message: 'Usuario creado exitosamente' };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        const errorMessage = axiosError.response?.data 
          ? (axiosError.response.data as { message?: string })?.message || 'Error al crear el usuario'
          : 'Error al crear el usuario';
        return { success: false, message: errorMessage };
      }
      return { success: false, message: 'Error al crear el usuario' };
    }
  },

  createTeacher: async (data: TypeCreateTeacher) => {
    try {
      const response = await apiService.post<TypeTeacher>(`${baseURL}/create-teacher`, data);
      return { success: true, data: response.data, message: 'Profesor creado exitosamente' };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        const errorMessage = axiosError.response?.data 
          ? (axiosError.response.data as { message?: string })?.message || 'Error al crear el profesor'
          : 'Error al crear el profesor';
        return { success: false, message: errorMessage };
      }
      return { success: false, message: 'Error al crear el profesor' };
    }
  },

  getAllUsers: async (params: TypeGetUsersParams) => {
    try {
      const response = await apiService.post<PaginatedResponse<TypeUser>>(`${baseURL}/get-all`, params);
      return { success: true, data: response.data, message: 'Usuarios obtenidos exitosamente' };
    } catch (error) {
      return { success: false, message: 'Error al obtener los usuarios' };
    }
  }
};