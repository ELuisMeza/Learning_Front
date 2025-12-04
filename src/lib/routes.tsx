import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SideBar from '../components/SideBar';
import HomePage from '../pages/HomePage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import ClassesPage from '../pages/ClassesPage';
import RubricsPage from '../pages/RubricsPage';
import EvaluationsPage from '../pages/EvaluationsPage';
import ScanQRPage from '../pages/ScanQRPage';
import MyClassesPage from '../pages/MyClassesPage';
import MyEvaluationsPage from '../pages/MyEvaluationsPage';
import EvaluationFormPage from '../pages/EvaluationFormPage';
import EvaluationResultsPage from '../pages/EvaluationResultsPage';
import SettingsPage from '../pages/SettingsPage';
import ClassDetailsPage from '../pages/ClassDetailsPage';
import { useUserStore } from '../stores/user.store';


function LoginRoute() {
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  return token && user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function DashboardRoute() {
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  
  // Verificar que tanto el token como el usuario estén presentes y sean válidos
  const isAuthenticated = token && user && user.id && user.email;
  
  if (isAuthenticated) {
    return <SideBar />;
  } else {
    return <Navigate to="/login" replace />;
  }
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
      // Rutas para Docente
      {
        path: 'classes',
        element: <ClassesPage />,
      },
      {
        path: 'classes/:classId',
        element: <ClassDetailsPage />,
      },
      {
        path: 'rubrics',
        element: <RubricsPage />,
      },
      {
        path: 'evaluations',
        element: <EvaluationsPage />,
      },
      // Rutas para Estudiante
      {
        path: 'scan-qr',
        element: <ScanQRPage />,
      },
      {
        path: 'my-classes',
        element: <MyClassesPage />,
      },
      {
        path: 'my-evaluations',
        element: <MyEvaluationsPage />,
      },
      {
        path: 'evaluation/:evaluationId',
        element: <EvaluationFormPage />,
      },
      {
        path: 'evaluation/:evaluationId/results',
        element: <EvaluationResultsPage />,
      },
      // Rutas para Administrador
      {
        path: 'settings',
        element: <SettingsPage />,
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

