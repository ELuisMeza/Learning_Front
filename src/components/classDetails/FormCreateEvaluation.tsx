import { useState} from 'react';
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
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { evaluationService } from '../../services/evaluation.service';
import type { TypeCreateEvaluation } from '../../types/evaluation.types';
import { TypeEvaluationMode } from '../../lib/globals';
import toast from 'react-hot-toast';
import { useGetRubrics } from '../../hooks/useGetRubrics';
import { useGetEvaluationType } from '../../hooks/useGetEvaluationType';
import { FormCreateRubric } from '../rubrics/FormCreateRubric';
import { FormCreateExam } from './FormCreateExam';

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

  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [openRubricDialog, setOpenRubricDialog] = useState(false);
  const [createdEvaluationId, setCreatedEvaluationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { rubrics, loading: loadingRubrics, refetch: refetchRubrics } = useGetRubrics();
  const { evaluationTypes, loading: loadingTypes } = useGetEvaluationType();

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

      // Validar que si NO es "Examen", debe tener una rúbrica asignada
      const evaluationType = evaluationTypes.find((type) => type.id === formData.evaluationTypeId);
      const isExamen = evaluationType && evaluationType.name.toLowerCase() === 'examen';
      
      if (!isExamen && !formData.rubricId) {
        toast.error('Las evaluaciones que no son de tipo "Examen" requieren una rúbrica asignada');
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
          setOpenExamDialog(true);
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


  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Evaluación</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Evaluación</InputLabel>
            <Select
              value={formData.evaluationTypeId}
              label="Tipo de Evaluación"
              disabled={loadingTypes}
              onChange={(e) => {
                const newTypeId = e.target.value;
                // Si cambia a "Examen", limpiar la rúbrica (no es necesaria)
                const selectedType = evaluationTypes.find((type) => type.id === newTypeId);
                if (selectedType && selectedType.name.toLowerCase() === 'examen') {
                  setFormData({ ...formData, evaluationTypeId: newTypeId, rubricId: '' });
                } else {
                  setFormData({ ...formData, evaluationTypeId: newTypeId });
                }
              }}
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
          
          {/* Mostrar campo de rúbrica solo si NO es "Examen" */}
          {formData.evaluationTypeId && (() => {
            const selectedType = evaluationTypes.find((type) => type.id === formData.evaluationTypeId);
            const isExamen = selectedType && selectedType.name.toLowerCase() === 'examen';
            
            if (!isExamen) {
              return (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Rúbrica *</InputLabel>
                    <Select
                      value={formData.rubricId}
                      label="Rúbrica *"
                      disabled={loadingRubrics}
                      onChange={(e) => setFormData({ ...formData, rubricId: e.target.value })}
                      error={!formData.rubricId}
                    >
                      {loadingRubrics ? (
                        <MenuItem disabled>Cargando rúbricas...</MenuItem>
                      ) : rubrics.length === 0 ? (
                        <MenuItem disabled>No hay rúbricas disponibles. Crea una primero.</MenuItem>
                      ) : (
                        rubrics.map((rubric) => (
                          <MenuItem key={rubric.id} value={rubric.id}>
                            {rubric.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <IconButton
                    color="primary"
                    onClick={() => setOpenRubricDialog(true)}
                    sx={{ mt: 1 }}
                    title="Crear nueva rúbrica"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              );
            }
            return null;
          })()}
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
      <FormCreateExam
        open={openExamDialog}
        onClose={() => {
          setOpenExamDialog(false);
          setCreatedEvaluationId(null);
        }}
        evaluationId={createdEvaluationId}
        onSuccess={() => {
          setOpenExamDialog(false);
          setCreatedEvaluationId(null);
          handleClose();
          onSuccess?.();
        }}
      />

      {/* Dialog para crear rúbrica */}
      <FormCreateRubric
        open={openRubricDialog}
        onClose={() => setOpenRubricDialog(false)}
        onSuccess={(rubricId) => {
          refetchRubrics();
          if (rubricId) {
            setFormData({ ...formData, rubricId });
          }
        }}
      />
    </>
  );
};
