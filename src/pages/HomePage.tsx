import { Typography, Paper, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/user.store';
import ClassIcon from '@mui/icons-material/Class';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { AdministratorView } from '../components/home/AdministratorView';
import { ProfessorView } from '../components/home/ProfessorView';
import { useState, useEffect } from 'react';
import { classService } from '../services/class.service';
import { evaluationService } from '../services/evaluation.service';
import type { TypeClass } from '../types/class.types';
import type { TypeEvaluation } from '../types/evaluation.types';

const HomePage = () => {
  const user = useUserStore((state) => state.user);
  const userRole = user?.role?.name?.toLowerCase() || '';

  // Contenido para Docente
  if (userRole === 'docente' || userRole === 'teacher') {
    return (
      <ProfessorView />
    );
  }

  // Contenido para Estudiante
  if (userRole === 'estudiante' || userRole === 'student') {
    return <StudentView />;
  }

  // Contenido para Administrador
  if (userRole === 'administrador' || userRole === 'admin') {
    return <AdministratorView />;
  }

  // Contenido por defecto
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido al Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        No se pudo determinar tu rol. Por favor, contacta al administrador.
      </Typography>
    </Box>
  );
};

// Componente para la vista del estudiante
const StudentView = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [classes, setClasses] = useState<TypeClass[]>([]);
  const [evaluations, setEvaluations] = useState<TypeEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  // Recargar datos cuando se vuelve a la página (después de completar una evaluación)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadStudentData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [classesData, evaluationsData] = await Promise.all([
        classService.getMyClasses().catch(() => []),
        evaluationService.getMyEvaluations().catch(() => []),
      ]);
      setClasses(classesData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error al cargar datos del estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const enrolledClasses = classes.length;
  
  // Evaluaciones completadas: usar el campo 'completed' del backend
  const completedEvaluations = evaluations.filter(
    (e) => e.completed === true
  ).length;
  
  // Evaluaciones pendientes: activas, dentro del rango de fechas y NO completadas
  const pendingEvaluations = evaluations.filter((e) => {
    const now = new Date();
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    return e.status === 'active' && now >= start && now <= end && !e.completed;
  }).length;
  
  const totalEvaluations = evaluations.length;
  const progressPercentage = totalEvaluations > 0 
    ? Math.round((completedEvaluations / totalEvaluations) * 100) 
    : 0;

  // Obtener próximas evaluaciones (próximas 3) - solo las que NO están completadas
  const upcomingEvaluations = evaluations
    .filter((e) => {
      const now = new Date();
      const end = new Date(e.endDate);
      // Incluir evaluaciones activas que aún no han terminado y que no están completadas
      return e.status === 'active' && now <= end && !e.completed;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Bienvenido, {user?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Panel del estudiante
      </Typography>

      {/* Cards de Estadísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {enrolledClasses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clases Inscritas
              </Typography>
            </Box>
            <ClassIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.2 }} />
          </Box>
        </Paper>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {completedEvaluations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Evaluaciones Completadas
              </Typography>
            </Box>
            <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.2 }} />
          </Box>
        </Paper>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {progressPercentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Progreso General
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: 'grey.200',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${progressPercentage}%`,
                    height: '100%',
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s',
                  }}
                />
              </Box>
            </Box>
            <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.2, ml: 1 }} />
          </Box>
        </Paper>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {pendingEvaluations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Evaluaciones Pendientes
              </Typography>
            </Box>
            <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.2 }} />
          </Box>
        </Paper>
      </Box>

      {/* Secciones de Acceso Rápido y Actividad */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Acceso Rápido
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                }}
                onClick={() => navigate('/dashboard/scan-qr')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <QrCodeScannerIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Inscribirse a Clase
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Escanea el código QR
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                }}
                onClick={() => navigate('/dashboard/my-classes')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ClassIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Mis Clases
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ver clases inscritas
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                }}
                onClick={() => navigate('/dashboard/my-evaluations')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 32, color: 'success.main' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Mis Evaluaciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ver evaluaciones activas
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Próximas Evaluaciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {upcomingEvaluations.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    No hay evaluaciones próximas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Las evaluaciones aparecerán aquí
                  </Typography>
                </Box>
              ) : (
                upcomingEvaluations.map((evaluation) => (
                  <Box
                    key={evaluation.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/dashboard/evaluation/${evaluation.id}`)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {evaluation.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {evaluation.class?.name || 'Sin clase'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Inicio: {new Date(evaluation.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;

