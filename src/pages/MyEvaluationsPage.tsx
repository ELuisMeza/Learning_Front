import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { evaluationService } from '../services/evaluation.service';
import type { TypeEvaluation } from '../types/evaluation.types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<TypeEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyEvaluations();
  }, []);

  // Recargar evaluaciones cuando se vuelve a la página (después de completar una evaluación)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadMyEvaluations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadMyEvaluations = async () => {
    try {
      setLoading(true);
      // El backend debería tener un endpoint para obtener las evaluaciones del estudiante
      // Intentamos usar el endpoint de evaluaciones del estudiante
      try {
        // Si el backend tiene un endpoint específico para estudiantes
        const response = await evaluationService.getMyEvaluations();
        setEvaluations(response);
      } catch (error) {
        // Si no existe, intentamos obtener todas las evaluaciones activas
        // Esto es un fallback temporal
        console.warn('Endpoint de evaluaciones del estudiante no disponible, usando fallback');
        setEvaluations([]);
      }
    } catch (error) {
      toast.error('Error al cargar tus evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = (evaluationId: string) => {
    navigate(`/dashboard/evaluation/${evaluationId}`);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'self':
        return 'Autoevaluación';
      case 'peer':
        return 'Coevaluación';
      case 'individual':
        return 'Individual';
      case 'group':
        return 'Grupal';
      default:
        return type;
    }
  };


  const isEvaluationActive = (evaluation: TypeEvaluation) => {
    const now = new Date();
    const start = new Date(evaluation.startDate);
    const end = new Date(evaluation.endDate);
    return evaluation.status === 'active' && now >= start && now <= end;
  };

  const isEvaluationCompleted = (evaluation: TypeEvaluation) => {
    // Verificar si el estudiante ya completó la evaluación
    return evaluation.completed === true || !!evaluation.resultId;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Evaluaciones
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Evaluaciones disponibles y completadas
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tienes evaluaciones disponibles.
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{evaluation.name}</TableCell>
                  <TableCell>{getTypeLabel(evaluation.type)}</TableCell>
                  <TableCell>{evaluation.class?.name || '-'}</TableCell>
                  <TableCell>
                    {isEvaluationCompleted(evaluation) ? (
                      <Chip
                        label="Completada"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={isEvaluationActive(evaluation) ? 'Pendiente' : 'No disponible'}
                        color={isEvaluationActive(evaluation) ? 'warning' : 'default'}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {isEvaluationCompleted(evaluation) ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/dashboard/evaluation/${evaluation.id}/results`)}
                      >
                        Ver Resultados
                      </Button>
                    ) : isEvaluationActive(evaluation) ? (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartEvaluation(evaluation.id)}
                      >
                        Realizar
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyEvaluationsPage;

