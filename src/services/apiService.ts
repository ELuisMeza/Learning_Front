import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useUserStore } from '../stores/user.store';

const baseURL = import.meta.env.VITE_API_URL_BACKEND ;

const apiService: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().token;
    const isAuthRequest = config.url?.includes('/auth/login');
    
 
    if (token && config.headers && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
   
    // NO redirigir aquí - dejar que las rutas protegidas manejen la autenticación
    // Esto evita loops infinitos y pantallas en blanco
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
apiService.interceptors.request.use((config) => {
 
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isAuthCallback = window.location.pathname === '/auth/callback';
      const isUsersMeRequest = error.config?.url?.includes('/users/me');
      
      // NO redirigir si estamos en el proceso de autenticación (callback)
      // Esto permite que AuthCallbackPage maneje el error correctamente
      if (!isLoginRequest && !isAuthCallback) {
        useUserStore.getState().logout();
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Si es una petición a /users/me desde el callback, no hacer logout
      // para permitir que el callback maneje el error
      if (isUsersMeRequest && isAuthCallback) {
        // No hacer logout aquí, dejar que AuthCallbackPage maneje el error
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiService; 