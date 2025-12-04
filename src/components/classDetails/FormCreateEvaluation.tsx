import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { evaluationService } from '../../services/evaluation.service';
import { evaluationsQuestionsService } from '../../services/evaluations-questions.service';
import { rubricService } from '../../services/rubric.service';
import type { TypeCreateEvaluation, TypeEvaluationType } from '../../types/evaluation.types';
import type { TypeRubric } from '../../types/rubric.types';
import { TypeEvaluationMode } from '../../lib/globals';
import type { Question } from '../../types/evaluations-questions.types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  onSuccess?: () => void;
}

export const FormCreateEvaluation = ({ open, onClose, classId, onSuccess }: Props) => {
  const [formData, setFormData] = useState<Omit<TypeCreateEvaluation, 'classId'>>({
    name: '',
    description: '',
    rubricId: '',
    maxScore: 0,
    evaluationTypeId: '',
    evaluationMode: TypeEvaluationMode.TEACHER,
    startDate: '',
    endDate: '',
  });

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [createdEvaluationId, setCreatedEvaluationId] = useState<string | null>(null);
  const [evaluationTypes, setEvaluationTypes] = useState<TypeEvaluationType[]>([]);
  const [rubrics, setRubrics] = useState<TypeRubric[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    {
      label: '',
      score: 0,
      options: [
        { label: '', is_correct: false },
        { label: '', is_correct: false },
      ],
    },
  ]);

  useEffect(() => {
    if (open) {
      loadEvaluationTypes();
      loadRubrics();
    }
  }, [open, classId]);

  const loadEvaluationTypes = async () => {
    setLoadingTypes(true);
    try {
      const { success, data } = await evaluationService.getEvaluationTypes();
      if (success && data) {
        setEvaluationTypes(data);
      } else {
        toast.error('Error al cargar los tipos de evaluación');
      }
    } catch (error) {
      toast.error('Error al cargar los tipos de evaluación');
    } finally {
      setLoadingTypes(false);
    }
  };

  const loadRubrics = async () => {
    setLoadingRubrics(true);
    try {
      const data = await rubricService.getRubricsByClass(classId);
      setRubrics(data);
    } catch (error) {
      toast.error('Error al cargar las rúbricas');
    } finally {
      setLoadingRubrics(false);
    }
  };

  const handleCreateEvaluation = async () => {
    try {
      if (!formData.name.trim() || !classId || !formData.evaluationTypeId || !formData.evaluationMode) {
        toast.error('Completa todos los campos requeridos');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error('Selecciona las fechas de inicio y fin');
        return;
      }

      if (!formData.maxScore || formData.maxScore <= 0) {
        toast.error('El puntaje máximo debe ser mayor a 0');
        return;
      }

      setLoading(true);
      const { success, message, data } = await evaluationService.create({
        classId: classId,
        name: formData.name,
        description: formData.description,
        rubricId: formData.rubricId || undefined,
        maxScore: formData.maxScore,
        evaluationTypeId: formData.evaluationTypeId,
        evaluationMode: formData.evaluationMode,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      if (success && data) {
        const evaluationId = data.id;
        const evaluationType = evaluationTypes.find((type) => type.id === formData.evaluationTypeId);
        
        // Verificar si el tipo de evaluación es "Examen" (case insensitive)
        if (evaluationType && evaluationType.name.toLowerCase() === 'examen') {
          setCreatedEvaluationId(evaluationId);
          setOpenFormDialog(true);
          toast.success('Evaluación creada. Ahora crea el formulario del examen.');
        } else {
          toast.success(message || 'Evaluación creada exitosamente');
          handleClose();
          onSuccess?.();
        }
      } else {
        toast.error(message || 'Error al crear la evaluación');
      }
    } catch (error) {
      toast.error('Error al crear la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        label: '',
        score: 0,
        options: [
          { label: '', is_correct: false },
          { label: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: 'label' | 'score', value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ label: '', is_correct: false });
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updatedQuestions);
  };

  const handleUpdateOption = (
    questionIndex: number,
    optionIndex: number,
    field: 'label' | 'is_correct',
    value: string | boolean
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleCreateForm = async () => {
    try {
      if (!createdEvaluationId) {
        toast.error('No hay evaluación seleccionada');
        return;
      }

      // Validar que todas las preguntas tengan al menos una opción correcta
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.label.trim()) {
          toast.error(`La pregunta ${i + 1} debe tener un texto`);
          return;
        }
        if (question.options.length < 2) {
          toast.error(`La pregunta ${i + 1} debe tener al menos 2 opciones`);
          return;
        }
        const hasCorrectOption = question.options.some((opt) => opt.is_correct);
        if (!hasCorrectOption) {
          toast.error(`La pregunta ${i + 1} debe tener al menos una opción correcta`);
          return;
        }
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].label.trim()) {
            toast.error(`La opción ${j + 1} de la pregunta ${i + 1} debe tener un texto`);
            return;
          }
        }
      }

      setLoading(true);
      const { success, message } = await evaluationsQuestionsService.createForm({
        evaluation_id: createdEvaluationId,
        questions: questions.map((q) => ({
          label: q.label,
          score: q.score || undefined,
          options: q.options.map((opt) => ({
            label: opt.label,
            is_correct: opt.is_correct,
          })),
        })),
      });

      if (success) {
        toast.success(message || 'Formulario creado exitosamente');
        handleCloseFormDialog();
        handleClose();
        onSuccess?.();
      } else {
        toast.error(message || 'Error al crear el formulario');
      }
    } catch (error) {
      toast.error('Error al crear el formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      rubricId: '',
      maxScore: 0,
      evaluationTypeId: '',
      evaluationMode: 'teacher' as TypeEvaluationMode,
      startDate: '',
      endDate: '',
    });
    setCreatedEvaluationId(null);
    onClose();
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setQuestions([
      {
        label: '',
        score: 0,
        options: [
          { label: '', is_correct: false },
          { label: '', is_correct: false },
        ],
      },
    ]);
    setCreatedEvaluationId(null);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Evaluación</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Rúbrica (Opcional)</InputLabel>
            <Select
              value={formData.rubricId}
              label="Rúbrica (Opcional)"
              disabled={loadingRubrics}
              onChange={(e) => setFormData({ ...formData, rubricId: e.target.value })}
            >
              <MenuItem value="">
                <em>Sin rúbrica</em>
              </MenuItem>
              {loadingRubrics ? (
                <MenuItem disabled>Cargando rúbricas...</MenuItem>
              ) : rubrics.length === 0 ? (
                <MenuItem disabled>No hay rúbricas disponibles para esta clase</MenuItem>
              ) : (
                rubrics.map((rubric) => (
                  <MenuItem key={rubric.id} value={rubric.id}>
                    {rubric.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Evaluación</InputLabel>
            <Select
              value={formData.evaluationTypeId}
              label="Tipo de Evaluación"
              disabled={loadingTypes}
              onChange={(e) => setFormData({ ...formData, evaluationTypeId: e.target.value })}
              required
            >
              {loadingTypes ? (
                <MenuItem disabled>Cargando tipos...</MenuItem>
              ) : evaluationTypes.length === 0 ? (
                <MenuItem disabled>No hay tipos de evaluación disponibles</MenuItem>
              ) : (
                evaluationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Modo de Evaluación</InputLabel>
            <Select
              value={formData.evaluationMode}
              label="Modo de Evaluación"
              onChange={(e) => setFormData({ ...formData, evaluationMode: e.target.value as TypeEvaluationMode })}
              required
            >
              <MenuItem value="teacher">Evaluación del Docente</MenuItem>
              <MenuItem value="self">Autoevaluación</MenuItem>
              <MenuItem value="peer">Coevaluación</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la evaluación"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Puntaje Máximo"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.maxScore}
            onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
            inputProps={{ min: 1, step: 1 }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Fecha de Inicio"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Fecha de Fin"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleCreateEvaluation} variant="contained" disabled={loading || loadingTypes || loadingRubrics}>
            {loading ? <CircularProgress size={24} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear formulario de examen */}
      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} maxWidth="md" fullWidth>
        <DialogTitle>Crear Formulario de Examen</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Agrega las preguntas y opciones para el examen
            </Typography>

            {questions.map((question, questionIndex) => (
              <Paper key={questionIndex} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Pregunta {questionIndex + 1}</Typography>
                  {questions.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Texto de la pregunta"
                  value={question.label}
                  onChange={(e) => handleUpdateQuestion(questionIndex, 'label', e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  label="Puntaje (opcional)"
                  type="number"
                  value={question.score || ''}
                  onChange={(e) => handleUpdateQuestion(questionIndex, 'score', Number(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Opciones:
                </Typography>

                {question.options.map((option, optionIndex) => (
                  <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Opción ${optionIndex + 1}`}
                      value={option.label}
                      onChange={(e) => handleUpdateOption(questionIndex, optionIndex, 'label', e.target.value)}
                      size="small"
                      required
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={option.is_correct}
                          onChange={(e) =>
                            handleUpdateOption(questionIndex, optionIndex, 'is_correct', e.target.checked)
                          }
                        />
                      }
                      label="Correcta"
                    />
                    {question.options.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  size="small"
                  onClick={() => handleAddOption(questionIndex)}
                  sx={{ mt: 1 }}
                >
                  Agregar Opción
                </Button>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              fullWidth
              sx={{ mt: 2 }}
            >
              Agregar Pregunta
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Cancelar</Button>
          <Button onClick={handleCreateForm} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Crear Formulario'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
