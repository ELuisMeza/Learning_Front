import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SideBar from '../components/SideBar';
import HomePage from '../pages/HomePage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import { useUserStore } from '../stores/user.store';


function LoginRoute() {
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  return token && user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function DashboardRoute() {
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  return token && user ? <SideBar /> : <Navigate to="/login" replace />;
}

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardRoute />,
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

