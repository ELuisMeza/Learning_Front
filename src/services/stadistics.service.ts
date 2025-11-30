import apiService from "./apiService";
import type { TypeStadisticsGeneral } from "../types/stadistics.types";

export const stadisticsService = {
  getStadisticsGeneral: async () => {
    try {
      const response = await apiService.get<TypeStadisticsGeneral>('/stadistics');
      return { success: true, data: response.data, message: 'Estadísticas obtenidas correctamente' };      
    } catch (error) {
      return { success: false, message: 'Error al obtener las estadísticas' };
    }
  },
};  