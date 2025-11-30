import type { TypeMenuItem } from "../types/utils.types";
import HomeIcon from '@mui/icons-material/Home';
import ClassIcon from '@mui/icons-material/Class';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SettingsIcon from '@mui/icons-material/Settings';

// Función para obtener items del menú según el rol
export const getMenuItemsByRole = (roleName?: string): TypeMenuItem[] => {
  const baseItems: TypeMenuItem[] = [
    { text: 'Inicio', path: '/dashboard', icon: <HomeIcon /> },
  ];

  const role = roleName?.toLowerCase() || '';

  // Menú para Docente
  if (role === 'docente' || role === 'teacher') {
    return [
      ...baseItems,
      { text: 'Mis Clases', path: '/dashboard/classes', icon: <ClassIcon /> },
      { text: 'Rúbricas', path: '/dashboard/rubrics', icon: <AssessmentIcon /> },
      { text: 'Evaluaciones', path: '/dashboard/evaluations', icon: <AssessmentIcon /> },
    ];
  }

  // Menú para Estudiante
  if (role === 'estudiante' || role === 'student') {
    return [
      ...baseItems,
      { text: 'Escanear QR', path: '/dashboard/scan-qr', icon: <QrCodeScannerIcon /> },
      { text: 'Mis Clases', path: '/dashboard/my-classes', icon: <ClassIcon /> },
      { text: 'Mis Evaluaciones', path: '/dashboard/my-evaluations', icon: <AssessmentIcon /> },
    ];
  }

  // Menú para Administrador
  if (role === 'administrador' || role === 'admin') {
    return [
      ...baseItems,
      { text: 'Configuración', path: '/dashboard/settings', icon: <SettingsIcon /> },
    ];
  }

  // Menú por defecto
  return baseItems;
};

// Exportar items por defecto para compatibilidad
export const menuItems: TypeMenuItem[] = [
  { text: 'Inicio', path: '/dashboard', icon: <HomeIcon /> },
];