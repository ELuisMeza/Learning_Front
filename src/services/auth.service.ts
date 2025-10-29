import apiService from "./apiService";
import type { AxiosError } from 'axios';
import type { LoginResponse } from '../types/utils.types';

export const authService = {
  login: async (email: string, password: string): Promise<{success: boolean, data?: LoginResponse, message: string}> => {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      return { success: true, data: response.data, message: 'Inicio de sesión exitoso' };
    } catch (error) {
      // Verificar si es un error de Axios y si el status es 401
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          message: 'Credenciales incorrectas',
        };
      }
      
      // Para otros errores, retornar el mensaje del error si existe
      const errorMessage = axiosError.response?.data 
        ? (axiosError.response.data as { message?: string })?.message || 'Error al iniciar sesión'
        : axiosError.message || 'Error al iniciar sesión';
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};