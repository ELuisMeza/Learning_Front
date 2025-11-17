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

  loginWithGoogle: async (credential: string): Promise<{success: boolean, data?: LoginResponse, message: string}> => {
    try {
      const response = await apiService.post('/auth/google', { credential });
      return { success: true, data: response.data, message: 'Inicio de sesión con Google exitoso' };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return {
          success: false,
          message: 'Error al autenticar con Google',
        };
      }
      
      const errorMessage = axiosError.response?.data 
        ? (axiosError.response.data as { message?: string })?.message || 'Error al iniciar sesión con Google'
        : axiosError.message || 'Error al iniciar sesión con Google';
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};