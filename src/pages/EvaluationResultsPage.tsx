import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { evaluationService } from '../services/evaluation.service';
import type { TypeEvaluation, TypeEvaluationResult } from '../types/evaluation.types';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/user.store';

const EvaluationResultsPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [evaluation, setEvaluation] = useState<TypeEvaluation | null>(null);
  const [results, setResults] = useState<TypeEvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (evaluationId) {
      loadEvaluationData();
    }
  }, [evaluationId]);

  const loadEvaluationData = async () => {
    try {
      setLoading(true);
      if (evaluationId) {
        const [evaluationData, resultsData] = await Promise.all([
          evaluationService.getEvaluationById(evaluationId),
          evaluationService.getEvaluationResults(evaluationId).catch(() => []),
        ]);
        setEvaluation(evaluationData);
        setResults(resultsData);
      }
    } catch (error) {
      toast.error('Error al cargar los resultados de la evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Encontrar el resultado del usuario actual
  const myResult = results.find((r) => r.evaluatorId === user?.id || r.evaluatedId === user?.id);

  // Calcular promedio de todos los resultados
  const averageScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.totalScore, 0) / results.length
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evaluation) {
    return (
      <Box>
        <Alert severity="error">No se pudo cargar la evaluación.</Alert>
        <Button onClick={() => navigate('/dashboard/my-evaluations')} sx={{ mt: 2 }}>
          Volver a Mis Evaluaciones
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/my-evaluations')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Resultados de la Evaluación
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
        {evaluation.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {evaluation.description || 'Resultados de la evaluación completada'}
      </Typography>

      {/* Resumen de la Evaluación */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen de la Evaluación
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tu Puntuación Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {myResult?.totalScore || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Promedio de la Clase
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {averageScore.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detalles de los Resultados */}
      {myResult && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detalle de tu Evaluación
          </Typography>
          <Box sx={{ mt: 2 }}>
            {myResult.scores.map((score) => (
              <Box key={score.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {score.criteria?.name || 'Criterio'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {score.criteria?.description || ''}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Nivel: {score.level?.name || 'N/A'}
                  </Typography>
                  <Chip
                    label={`${score.score} puntos`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            ))}
          </Box>
          {myResult.comments && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Comentarios:
              </Typography>
              <Typography variant="body2">
                {myResult.comments}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Tabla de Todos los Resultados (si hay múltiples evaluadores) */}
      {results.length > 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Todos los Resultados
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Evaluador</TableCell>
                  <TableCell>Evaluado</TableCell>
                  <TableCell align="right">Puntuación Total</TableCell>
                  <TableCell>Fecha de Envío</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      {result.evaluator?.name || 'N/A'} {result.evaluator?.lastNameFather || ''}
                    </TableCell>
                    <TableCell>
                      {result.evaluated?.name || 'N/A'} {result.evaluated?.lastNameFather || ''}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={result.totalScore}
                        color={result.evaluatorId === user?.id ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {results.length === 0 && (
        <Alert severity="info">
          Aún no hay resultados disponibles para esta evaluación.
        </Alert>
      )}
    </Box>
  );
};

export default EvaluationResultsPage;
