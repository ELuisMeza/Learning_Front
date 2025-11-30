import type { TypeUser } from "../types/user.types";
import type { AxiosError } from 'axios';
import apiService from "./apiService";

const baseURL = 'users';

export const userService = {
  getUserMe: async (): Promise<{success: boolean, data?: TypeUser, message: string}> => {
    try {
      const response = await apiService.get(`/${baseURL}/me`);
      return { success: true, data: response.data, message: 'Usuario obtenido exitosamente' };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error en getUserMe:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      
      let errorMessage = 'Error al obtener el usuario';
      if (axiosError.response?.status === 401) {
        errorMessage = 'No autorizado. El token puede ser inválido o haber expirado';
      } else if (axiosError.response?.data) {
        const data = axiosError.response.data as { message?: string };
        errorMessage = data.message || errorMessage;
      }
      
      return { success: false, message: errorMessage };
    }
  },
};