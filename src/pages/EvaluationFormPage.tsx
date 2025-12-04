import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { evaluationService } from '../services/evaluation.service';
import { rubricService } from '../services/rubric.service';
import { classService } from '../services/class.service';
import { useUserStore } from '../stores/user.store';
import type { TypeEvaluation } from '../types/evaluation.types';
import type { TypeRubric } from '../types/rubric.types';
import type { TypeClassStudent } from '../types/class.types';
import toast from 'react-hot-toast';

const EvaluationFormPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [evaluation, setEvaluation] = useState<TypeEvaluation | null>(null);
  const [rubric, setRubric] = useState<TypeRubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [classmates, setClassmates] = useState<TypeClassStudent[]>([]);
  const [selectedEvaluatedStudent, setSelectedEvaluatedStudent] = useState<string | null>(null);
  const [loadingClassmates, setLoadingClassmates] = useState(false);

  useEffect(() => {
    if (evaluationId) {
      loadEvaluation();
    }
  }, [evaluationId]);

  useEffect(() => {
    if (evaluation?.rubricId) {
      loadRubric(evaluation.rubricId);
    }
  }, [evaluation?.rubricId]);

  useEffect(() => {
    if (evaluation?.classId && evaluation.type === 'peer') {
      loadClassmates(evaluation.classId);
    }
  }, [evaluation?.classId, evaluation?.type]);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      if (evaluationId) {
        const data = await evaluationService.getEvaluationById(evaluationId);
        setEvaluation(data);
      }
    } catch (error) {
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const loadRubric = async (rubricId: string) => {
    try {
      const data = await rubricService.getRubricById(rubricId);
      setRubric(data);
      // Inicializar scores vacíos
      if (data.criteria) {
        const initialScores: Record<string, string> = {};
        data.criteria.forEach((criterion) => {
          initialScores[criterion.id] = '';
        });
        setScores(initialScores);
      }
    } catch (error) {
      toast.error('Error al cargar la rúbrica');
    }
  };

  const loadClassmates = async (classId: string) => {
    try {
      setLoadingClassmates(true);
      const students = await classService.getClassStudents(classId);
      // Filtrar al propio usuario para que no se autoevalúe en coevaluación
      setClassmates(students.filter(s => s.studentId !== user?.id));
    } catch (error) {
      toast.error('Error al cargar compañeros de clase');
    } finally {
      setLoadingClassmates(false);
    }
  };

  const handleScoreChange = (criterionId: string, levelId: string) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: levelId,
    }));
  };

  const handleNext = () => {
    if (activeStep < (rubric?.criteria?.length || 0) - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const isFormComplete = () => {
    if (!rubric?.criteria) return false;
    return rubric.criteria.every((criterion) => scores[criterion.id]);
  };

  const handleSubmit = async () => {
    if (!evaluationId || !isFormComplete()) {
      toast.error('Completa todos los criterios antes de enviar');
      return;
    }

    // Verificar que rubric y sus criterios estén disponibles.
    if (!rubric || !rubric.criteria) {
      toast.error('La rúbrica no está disponible');
      return;
    }

    // Para coevaluación, verificar que se haya seleccionado un estudiante
    if (evaluation?.type === 'peer' && !selectedEvaluatedStudent) {
      toast.error('Selecciona al estudiante que vas a evaluar');
      return;
    }

    try {
      setSubmitting(true);
      // Obtener el ID del usuario evaluado
      let evaluatedId = user?.id || ''; // Default to self-evaluation
      if (evaluation?.type === 'peer') {
        if (!selectedEvaluatedStudent) {
          toast.error('Selecciona al estudiante que vas a evaluar');
          return;
        }
        evaluatedId = selectedEvaluatedStudent;
      }
      
      if (!evaluatedId) {
        toast.error('No se pudo identificar al usuario');
        return;
      }
      
      // TypeScript ahora sabe que rubric y rubric.criteria no son null gracias a la verificación anterior
      const evaluationData = {
        evaluatedId,
        scores: Object.entries(scores).map(([criterionId, levelId]) => {
          // Obtener el score del nivel seleccionado
          // rubric.criteria ya está verificado que no es null arriba
          const criterion = rubric!.criteria!.find((c) => c.id === criterionId);
          const level = criterion?.levels?.find((l) => l.id === levelId);
          return {
            criteriaId: criterionId,
            levelId,
            score: level?.score || 0,
          };
        }),
      };

      await evaluationService.submitEvaluation(evaluationId, evaluationData);
      toast.success('Evaluación enviada exitosamente');
      navigate('/dashboard/my-evaluations');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al enviar la evaluación';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evaluation || !rubric) {
    return (
      <Box>
        <Alert severity="error">No se pudo cargar la evaluación o la rúbrica asociada.</Alert>
        <Button onClick={() => navigate('/dashboard/my-evaluations')} sx={{ mt: 2 }}>
          Volver a Mis Evaluaciones
        </Button>
      </Box>
    );
  }

  const currentCriterion = rubric.criteria?.[activeStep];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {evaluation.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {evaluation.description || 'Completa la evaluación según la rúbrica'}
      </Typography>

      {/* Selector de estudiante para coevaluación */}
      {evaluation.type === 'peer' && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Coevaluación
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selecciona al estudiante que vas a evaluar:
          </Typography>
          {loadingClassmates ? (
            <CircularProgress size={24} />
          ) : classmates.length === 0 ? (
            <Alert severity="warning">
              No hay compañeros de clase disponibles para evaluar.
            </Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Estudiante a evaluar</InputLabel>
              <Select
                value={selectedEvaluatedStudent || ''}
                onChange={(e) => setSelectedEvaluatedStudent(e.target.value)}
                label="Estudiante a evaluar"
              >
                {classmates.map((classmate) => (
                  <MenuItem key={classmate.studentId} value={classmate.studentId}>
                    {classmate.student?.name || 'Estudiante'} {classmate.student?.lastNameFather || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Paper>
      )}

      {rubric.criteria && rubric.criteria.length > 1 && (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {rubric.criteria.map((criterion) => (
            <Step key={criterion.id}>
              <StepLabel>{criterion.name}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Paper sx={{ p: 3 }}>
        {currentCriterion && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {currentCriterion.name}
            </Typography>
            {currentCriterion.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {currentCriterion.description}
              </Typography>
            )}

            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Selecciona el nivel que mejor describe el desempeño:</FormLabel>
              <RadioGroup
                value={scores[currentCriterion.id] || ''}
                onChange={(e) => handleScoreChange(currentCriterion.id, e.target.value)}
              >
                {currentCriterion.levels?.map((level) => (
                  <FormControlLabel
                    key={level.id}
                    value={level.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {level.name} ({level.score} puntos)
                        </Typography>
                        {level.description && (
                          <Typography variant="body2" color="text.secondary">
                            {level.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Anterior
          </Button>
          {activeStep < (rubric.criteria?.length || 0) - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={!scores[currentCriterion?.id || '']}>
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isFormComplete() || submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Enviar Evaluación'}
            </Button>
          )}
        </Box>
      </Paper>

      {!isFormComplete() && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Completa todos los criterios antes de enviar la evaluación.
        </Alert>
      )}
    </Box>
  );
};

export default EvaluationFormPage;

