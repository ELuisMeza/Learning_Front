import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { evaluationService } from '../services/evaluation.service';
import { rubricService } from '../services/rubric.service';
import apiService from '../services/apiService';
import type { TypeEvaluation } from '../types/evaluation.types';
import type { TypeRubricDetails } from '../types/rubric.types';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/user.store';

interface Question {
  id: string;
  label: string;
  score: number;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
  }[];
}

interface ExamAnswer {
  questionId: string;
  optionId: string;
}

interface RubricScore {
  criteriaId: string;
  levelId: string;
  score: number;
}

const EvaluationFormPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [evaluation, setEvaluation] = useState<TypeEvaluation | null>(null);
  const [rubric, setRubric] = useState<TypeRubricDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Para exámenes
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  
  // Para rúbricas
  const [rubricScores, setRubricScores] = useState<Record<string, string>>({});
  const [selectedEvaluatedStudent, setSelectedEvaluatedStudent] = useState<string>('');
  const [comments, setComments] = useState('');
  const [classmates, setClassmates] = useState<any[]>([]);

  useEffect(() => {
    if (evaluationId) {
      loadEvaluationData();
    }
  }, [evaluationId]);

  const loadEvaluationData = async () => {
    try {
      setLoading(true);
      if (!evaluationId) return;

      const evaluationData = await evaluationService.getEvaluationById(evaluationId);
      
      // Validar que la evaluación esté disponible para el estudiante
      const now = new Date();
      const startDate = new Date(evaluationData.startDate);
      const endDate = new Date(evaluationData.endDate);
      
      // Verificar que esté activa
      if (evaluationData.status !== 'active') {
        toast.error('Esta evaluación no está activa');
        navigate('/dashboard/my-evaluations');
        return;
      }
      
      // Verificar que la fecha actual esté dentro del rango
      if (now < startDate) {
        toast.error('Esta evaluación aún no ha iniciado');
        navigate('/dashboard/my-evaluations');
        return;
      }
      
      if (now > endDate) {
        toast.error('Esta evaluación ya ha finalizado');
        navigate('/dashboard/my-evaluations');
        return;
      }
      
      // Verificar que no esté completada
      if (evaluationData.completed === true) {
        toast.error('Ya has completado esta evaluación');
        navigate(`/dashboard/evaluation/${evaluationId}/results`);
        return;
      }
      
      setEvaluation(evaluationData);

      // Determinar el tipo de evaluación basándose en evaluationType.name
      // Si el tipo es "Examen", es un examen (con preguntas)
      // Si NO es "Examen", es una evaluación con rúbrica
      const evaluationTypeName = (evaluationData as any).evaluationType?.name || 
                                 (evaluationData as any).evaluationTypeName || 
                                 '';
      const isExamen = evaluationTypeName.toLowerCase() === 'examen';

      if (isExamen) {
        // Es un EXAMEN: cargar preguntas
        try {
          const questionsData = await evaluationService.getEvaluationQuestions(evaluationId);
          if (questionsData && questionsData.length > 0) {
            setQuestions(questionsData);
          } else {
            toast.error('Esta evaluación de tipo Examen no tiene preguntas asignadas');
          }
        } catch (error) {
          console.error('Error al cargar preguntas:', error);
          toast.error('Error al cargar las preguntas del examen');
        }
      } else {
        // NO es examen: es una evaluación con RÚBRICA
        if (!evaluationData.rubricId) {
          toast.error('Esta evaluación requiere una rúbrica pero no tiene una asignada');
          return;
        }

        // Cargar la rúbrica
        const { success, data } = await rubricService.getRubricById(evaluationData.rubricId);
        if (success && data) {
          setRubric(data);
        } else {
          toast.error('No se pudo cargar la rúbrica de la evaluación');
        }

        // Si es coevaluación, cargar compañeros de clase
        const evaluationMode = (evaluationData as any).evaluationMode || evaluationData.type;
        if (evaluationMode === 'peer' && evaluationData.classId) {
          try {
            const students = await apiService.get(`/class-students/class/${evaluationData.classId}`);
            // Filtrar para excluir al usuario actual
            const filteredStudents = students.data.filter((s: any) => s.student?.id !== user?.id);
            setClassmates(filteredStudents);
          } catch (error) {
            console.error('Error al cargar compañeros:', error);
          }
        }
      }
    } catch (error) {
      toast.error('Error al cargar la evaluación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExamAnswerChange = (questionId: string, optionId: string) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleRubricScoreChange = (criteriaId: string, levelId: string) => {
    setRubricScores((prev) => ({
      ...prev,
      [criteriaId]: levelId,
    }));
  };

  const handleSubmitExam = async () => {
    if (!evaluationId) return;

    // Validar que todas las preguntas tienen respuesta
    if (Object.keys(examAnswers).length !== questions.length) {
      toast.error('Debes responder todas las preguntas');
      return;
    }

    try {
      setSubmitting(true);
      const answers: ExamAnswer[] = Object.entries(examAnswers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));

      await evaluationService.submitExamAnswers(evaluationId, answers);
      toast.success('Evaluación enviada exitosamente');
      navigate(`/dashboard/evaluation/${evaluationId}/results`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar la evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRubric = async () => {
    if (!evaluationId || !rubric) return;

    // Validar que todos los criterios tienen nivel seleccionado
    if (Object.keys(rubricScores).length !== rubric.criteria.length) {
      toast.error('Debes evaluar todos los criterios');
      return;
    }

    // Si es coevaluación, validar que se seleccionó un estudiante
    const evaluationMode = (evaluation as any)?.evaluationMode || evaluation?.type;
    if (evaluationMode === 'peer' && !selectedEvaluatedStudent) {
      toast.error('Debes seleccionar un estudiante para evaluar');
      return;
    }

    try {
      setSubmitting(true);
      const scores: RubricScore[] = Object.entries(rubricScores).map(([criteriaId, levelId]) => {
        const criterion = rubric.criteria.find((c) => c.id === criteriaId);
        const level = criterion?.levels.find((l) => l.id === levelId);
        return {
          criteriaId,
          levelId,
          score: parseFloat(level?.score.toString() || '0'),
        };
      });

      await evaluationService.submitEvaluation(evaluationId, {
        evaluatedId: selectedEvaluatedStudent || user?.id || '',
        scores,
        comments: comments || undefined,
      });

      toast.success('Evaluación enviada exitosamente');
      navigate(`/dashboard/evaluation/${evaluationId}/results`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar la evaluación');
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

  // Determinar si es examen o rúbrica basándose en el tipo de evaluación
  const evaluationTypeName = (evaluation as any).evaluationType?.name || 
                             (evaluation as any).evaluationTypeName || 
                             '';
  const isExamen = evaluationTypeName.toLowerCase() === 'examen';
  
  // Es examen si el tipo es "Examen" y tiene preguntas
  const isExam = isExamen && questions.length > 0;
  // Es rúbrica si NO es examen y tiene rúbrica cargada
  const isRubric = !isExamen && !!rubric;

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
          {evaluation.name}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {evaluation.description || 'Completa la evaluación'}
      </Typography>

      {/* Selección de estudiante para coevaluación */}
      {isRubric && ((evaluation as any).evaluationMode || evaluation.type) === 'peer' && classmates.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Selecciona un estudiante para evaluar</InputLabel>
            <Select
              value={selectedEvaluatedStudent}
              onChange={(e) => setSelectedEvaluatedStudent(e.target.value)}
              label="Selecciona un estudiante para evaluar"
            >
              {classmates.map((classmate) => (
                <MenuItem key={classmate.student?.id} value={classmate.student?.id}>
                  {classmate.student?.name} {classmate.student?.lastNameFather}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Formulario de Examen */}
      {isExam && (
        <Box>
          {questions.map((question, index) => (
            <Card key={question.id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pregunta {index + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {question.label}
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={examAnswers[question.id] || ''}
                    onChange={(e) => handleExamAnswerChange(question.id, e.target.value)}
                  >
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        value={option.id}
                        control={<Radio />}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleSubmitExam}
              disabled={submitting || Object.keys(examAnswers).length !== questions.length}
            >
              {submitting ? 'Enviando...' : 'Enviar Evaluación'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Formulario de Rúbrica */}
      {isRubric && rubric && (
        <Box>
          {rubric.criteria.map((criterion, index) => (
            <Card key={criterion.id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Criterio {index + 1}: {criterion.name}
                </Typography>
                {criterion.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {criterion.description}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                  Peso: {criterion.weight}
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Selecciona un nivel:</FormLabel>
                  <RadioGroup
                    value={rubricScores[criterion.id] || ''}
                    onChange={(e) => {
                      handleRubricScoreChange(criterion.id, e.target.value);
                    }}
                  >
                    {criterion.levels.map((level) => (
                      <FormControlLabel
                        key={level.id}
                        value={level.id}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1">{level.name}</Typography>
                            {level.description && (
                              <Typography variant="body2" color="text.secondary">
                                {level.description}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                              Puntaje: {level.score}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          ))}

          {/* Campo de comentarios */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentarios (opcional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Agrega comentarios adicionales sobre la evaluación..."
            />
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleSubmitRubric}
              disabled={
                submitting ||
                Object.keys(rubricScores).length !== rubric.criteria.length ||
                (evaluation.type === 'peer' && !selectedEvaluatedStudent)
              }
            >
              {submitting ? 'Enviando...' : 'Enviar Evaluación'}
            </Button>
          </Box>
        </Box>
      )}

      {!isExam && !isRubric && (
        <Alert severity="warning">
          Esta evaluación no tiene preguntas ni rúbrica asignada. Contacta al docente.
        </Alert>
      )}
    </Box>
  );
};

export default EvaluationFormPage;

