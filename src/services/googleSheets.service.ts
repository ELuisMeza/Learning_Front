import apiService from './apiService';

const baseUrl = '/google-sheets';

export interface GoogleSheetsExportOptions {
  spreadsheetId?: string; // ID de la hoja existente (opcional)
  sheetName?: string; // Nombre de la hoja (por defecto: 'Resultados')
  createNew?: boolean; // Crear nueva hoja si no existe spreadsheetId
}

export const googleSheetsService = {
  // Exportar resultados de evaluación a Google Sheets
  exportEvaluationResults: async (
    evaluationId: string,
    accessToken: string,
    refreshToken?: string,
    options?: GoogleSheetsExportOptions
  ) => {
    try {
      const response = await apiService.post(
        `${baseUrl}/export-evaluation?accessToken=${encodeURIComponent(accessToken)}${refreshToken ? `&refreshToken=${encodeURIComponent(refreshToken)}` : ''}`,
        {
          evaluationId,
          ...options,
        }
      );
      return {
        success: true,
        data: response.data,
        message: 'Resultados exportados a Google Sheets exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al exportar a Google Sheets',
      };
    }
  },

  // Autenticar con Google (iniciar flujo OAuth2)
  authenticate: async () => {
    try {
      const response = await apiService.get(`${baseUrl}/auth`);
      return {
        success: true,
        authUrl: response.data.authUrl,
        message: 'Redirigiendo a Google para autenticación',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al autenticar con Google',
      };
    }
  },

  // Intercambiar código por tokens (usado en el callback)
  exchangeCodeForTokens: async (code: string) => {
    try {
      const response = await apiService.get(`${baseUrl}/auth/callback?code=${encodeURIComponent(code)}`);
      return {
        success: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        message: 'Tokens obtenidos exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al intercambiar código por tokens',
      };
    }
  },

  // Verificar estado de autenticación
  checkAuthStatus: async () => {
    try {
      const response = await apiService.get(`${baseUrl}/auth/status`);
      return {
        success: true,
        authenticated: response.data.authenticated,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        authenticated: false,
        message: error.response?.data?.message || 'Error al verificar autenticación',
      };
    }
  },
};

