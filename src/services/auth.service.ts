import apiService from "./apiService";
import type { AxiosError } from 'axios';
import type { LoginResponse } from '../types/utils.types';

export const authService = {
  login: async (email: string, password: string): Promise<{success: boolean, data?: LoginResponse, message: string}> => {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      return { success: true, data: response.data, message: 'Inicio de sesión exitoso' };
    } catch (error) {
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          message: 'Credenciales incorrectas',
        };
      }
      
     
      const errorMessage = axiosError.response?.data 
        ? (axiosError.response.data as { message?: string })?.message || 'Error al iniciar sesión'
        : axiosError.message || 'Error al iniciar sesión';
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  redirectToGoogleLogin: (): void => {
    const baseURL = import.meta.env.VITE_API_URL_BACKEND;
    window.location.href = `${baseURL}/auth/google`;
  },

  redirectToGoogleLogin: () => {
    const baseURL = import.meta.env.VITE_API_URL_BACKEND;
    const redirectURL = `${baseURL}/auth/google`;
    window.location.href = redirectURL;
  },
};