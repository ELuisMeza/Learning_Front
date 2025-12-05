import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
import { evaluationsQuestionsService } from '../../services/evaluations-questions.service';
import type { Question } from '../../types/evaluations-questions.types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  evaluationId: string | null;
  onSuccess?: () => void;
}

export const FormCreateExam = ({ open, onClose, evaluationId, onSuccess }: Props) => {
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

  const [loading, setLoading] = useState(false);

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
      if (!evaluationId) {
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
        evaluation_id: evaluationId,
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
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleCreateForm} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Crear Formulario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
