import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SideBar from '../components/SideBar';
import HomePage from '../pages/HomePage';
import { useUserStore } from '../stores/user.store';

/**
 * Configuración de rutas de la aplicación
 */
export const routes: RouteObject[] = [

  {
    path: '/login',
    element: (() => {
      const token = useUserStore.getState().token;
      const user = useUserStore.getState().user;
      return token && user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
    })(),
  },
  {
    path: '/dashboard',
    element: (() => {
      const token = useUserStore.getState().token;
      const user = useUserStore.getState().user;
      return token && user ? <SideBar /> : <Navigate to="/login" replace />;
    })(),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

