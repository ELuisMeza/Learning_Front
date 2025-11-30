import type { TypeUser } from "../types/user.types";
import apiService from "./apiService";

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
};