import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';
import ClassIcon from '@mui/icons-material/Class';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const ProfessorView = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  return (
    <Box>
    <Typography variant="h4" gutterBottom>
      Bienvenido, {user?.name}
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Panel de control del docente
    </Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ClassIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Mis Clases
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          Gestiona tus clases, crea nuevas y genera códigos QR para que los estudiantes se inscriban.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard/classes')}>
          Ver Clases
        </Button>
      </Paper>
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Rúbricas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          Sube rúbricas desde archivos Excel y gestiona tus criterios de evaluación.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard/rubrics')}>
          Ver Rúbricas
        </Button>
      </Paper>
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AssessmentIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Evaluaciones
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          Crea y gestiona evaluaciones. Visualiza resultados en tiempo real.
        </Typography>
        <Button variant="contained" color="success" onClick={() => navigate('/dashboard/evaluations')}>
          Ver Evaluaciones
        </Button>
      </Paper>
    </Box>
  </Box>
  );
};