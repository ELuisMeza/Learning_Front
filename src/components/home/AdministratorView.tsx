import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ComputerIcon from '@mui/icons-material/Computer';
import HomeIcon from '@mui/icons-material/Home';
import { useUserStore } from '../../stores/user.store';
import { useGetStadistics } from '../../hooks/useGetStadistics';
import { TypeModality } from '../../lib/globals';

const getTeachingModeLabel = (mode: string) => {
  const labels: Record<string, string> = {
    in_person: 'Presencial',
    online: 'En línea',
    hybrid: 'Híbrido',
  };
  return labels[mode] || mode;
};

const getTeachingModeColor = (mode: string) => {
  const colors: Record<string, string> = {
    in_person: '#1976d2',
    online: '#2e7d32',
    hybrid: '#ed6c02',
  };
  return colors[mode] || '#757575';
};

export const AdministratorView = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { stadistics, loading } = useGetStadistics();

  // Mapear los datos del hook a los valores para los KPIs
  const totalEnrollments = stadistics?.students.totalActiveStudents || 0;
  const totalClasses = stadistics?.classes.classes.totalActiveClasses || 0;
  const totalTeachers = stadistics?.teachers.teachers.totalActiveTeachers || 0;
  const totalCareers = stadistics?.careers.careers.totalActiveCareers || 0;

  const KpiCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight="bold" color={color}>
          {loading ? (
            <CircularProgress size={24} sx={{ color }} />
          ) : (
            value.toLocaleString()
          )}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Panel de administración - Vista general de los indicadores clave de rendimiento (KPIs) del sistema
      </Typography>

      {/* KPIs Principales */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <KpiCard
          title="Estudiantes Activos"
          value={totalEnrollments}
          icon={<PeopleIcon sx={{ fontSize: 32 }} />}
          color="#1976d2"
        />
        <KpiCard
          title="Clases Activas"
          value={totalClasses}
          icon={<SchoolIcon sx={{ fontSize: 32 }} />}
          color="#2e7d32"
        />
        <KpiCard
          title="Docentes Activos"
          value={totalTeachers}
          icon={<PersonIcon sx={{ fontSize: 32 }} />}
          color="#ed6c02"
        />
        <KpiCard
          title="Carreras Activas"
          value={totalCareers}
          icon={<WorkspacePremiumIcon sx={{ fontSize: 32 }} />}
          color="#9c27b0"
        />
      </Box>

      {/* Métricas Detalladas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {/* Clases por Modo de Enseñanza */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Clases por Modo de Enseñanza
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : stadistics?.classes.classes.byTeachingMode.length ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stadistics.classes.classes.byTeachingMode.map((item) => (
                <Box key={item.typeTeaching} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.typeTeaching === 'in_person' && <HomeIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.typeTeaching) }} />}
                    {item.typeTeaching === 'online' && <ComputerIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.typeTeaching) }} />}
                    {item.typeTeaching === 'hybrid' && <SchoolIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.typeTeaching) }} />}
                    <Typography variant="body2">{getTeachingModeLabel(item.typeTeaching)}</Typography>
                  </Box>
                  <Chip
                    label={item.count}
                    size="small"
                    sx={{
                      backgroundColor: `${getTeachingModeColor(item.typeTeaching)}20`,
                      color: getTeachingModeColor(item.typeTeaching),
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay datos disponibles
            </Typography>
          )}
        </Paper>

        {/* Carreras por Modalidad */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Carreras por Modalidad
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : stadistics?.careers.careers.byModality.length ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stadistics.careers.careers.byModality.map((item) => (
                <Box key={item.modality} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.modality === 'in_person' && <HomeIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.modality) }} />}
                    {item.modality === 'online' && <ComputerIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.modality) }} />}
                    {item.modality === 'hybrid' && <SchoolIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.modality) }} />}
                    <Typography variant="body2">{getTeachingModeLabel(item.modality)}</Typography>
                  </Box>
                  <Chip
                    label={item.count}
                    size="small"
                    sx={{
                      backgroundColor: `${getTeachingModeColor(item.modality)}20`,
                      color: getTeachingModeColor(item.modality),
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay datos disponibles
            </Typography>
          )}
        </Paper>

        {/* Docentes por Modo de Enseñanza */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Docentes por Modo de Enseñanza
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : stadistics?.teachers.teachers.byTeachingMode.length ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stadistics.teachers.teachers.byTeachingMode.map((item) => (
                <Box key={item.teachingModes} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.teachingModes === TypeModality.IN_PERSON && <HomeIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.teachingModes) }} />}
                    {item.teachingModes === TypeModality.ONLINE && <ComputerIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.teachingModes) }} />}
                    {item.teachingModes === TypeModality.HYBRID && <SchoolIcon sx={{ fontSize: 20, color: getTeachingModeColor(item.teachingModes) }} />}
                    <Typography variant="body2">{getTeachingModeLabel(item.teachingModes)}</Typography>
                  </Box>
                  <Chip
                    label={item.count}
                    size="small"
                    sx={{
                      backgroundColor: `${getTeachingModeColor(item.teachingModes)}20`,
                      color: getTeachingModeColor(item.teachingModes),
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay datos disponibles
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Acceso rápido a configuración */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accede a la configuración avanzada del sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/dashboard/settings')}
          >
            Ir a Configuración
          </Button>
        </Box>
      </Paper>

      {!loading && !stadistics && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No hay datos disponibles en el sistema. Las estadísticas se actualizarán cuando haya información.
        </Alert>
      )}
    </Box>
  );
};
