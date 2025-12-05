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
  CircularProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { rubricService } from '../../services/rubric.service';
import type {
  TypeCreateRubricDto,
  TypeCreateRubricCriterionDto,
  TypeCreateRubricLevelDto,
} from '../../types/rubric.types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (rubricId?: string) => void;
}

export const FormCreateRubric = ({ open, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<Omit<TypeCreateRubricDto, 'criteria'>>({
    name: '',
    description: '',
  });

  const [criteria, setCriteria] = useState<TypeCreateRubricCriterionDto[]>([
    {
      name: '',
      description: '',
      weight: undefined,
      levels: [
        { name: '', description: '', score: 0 },
        { name: '', description: '', score: 0 },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleCreateRubric = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre de la rúbrica es requerido');
        return;
      }

      if (criteria.length === 0) {
        toast.error('Debe agregar al menos un criterio');
        return;
      }

      for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        if (!criterion.name.trim()) {
          toast.error(`El criterio ${i + 1} debe tener un nombre`);
          return;
        }

        if (!criterion.levels || criterion.levels.length < 2) {
          toast.error(`El criterio "${criterion.name}" debe tener al menos 2 niveles`);
          return;
        }

        // Validar niveles
        for (let j = 0; j < criterion.levels.length; j++) {
          const level = criterion.levels[j];
          if (!level.name.trim()) {
            toast.error(
              `El nivel ${j + 1} del criterio "${criterion.name}" debe tener un nombre`
            );
            return;
          }
          if (level.score < 0) {
            toast.error(
              `El nivel "${level.name}" del criterio "${criterion.name}" debe tener una puntuación válida`
            );
            return;
          }
        }
      }

      setLoading(true);

      // Preparar datos para enviar (eliminar campos vacíos opcionales)
      const dataToSend: TypeCreateRubricDto = {
        name: formData.name.trim(),
        ...(formData.description?.trim() && { description: formData.description.trim() }),
        criteria: criteria.map((criterion) => ({
          name: criterion.name.trim(),
          ...(criterion.description?.trim() && { description: criterion.description.trim() }),
          ...(criterion.weight !== undefined && criterion.weight > 0 && { weight: criterion.weight }),
          levels: criterion.levels.map((level) => ({
            name: level.name.trim(),
            description: level.description?.trim() || '',
            score: level.score,
            ...(level.description?.trim() && { description: level.description.trim() }),
          })),
        })),
      };

      const result = await rubricService.createRubric(dataToSend);
      if (result.success && result.data) {
        toast.success(result.message || 'Rúbrica creada exitosamente');
        handleClose();
        onSuccess?.(result.data.id);
      } else {
        toast.error(result.message || 'Error al crear la rúbrica');
      }
    } catch (error) {
      toast.error('Error al crear la rúbrica');
      console.error('Error creating rubric:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = () => {
    setCriteria([
      ...criteria,
      {
        name: '',
        description: '',
        weight: undefined,
        levels: [
          { name: '', description: '', score: 0 },
          { name: '', description: '', score: 0 },
        ],
      },
    ]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    } else {
      toast.error('Debe tener al menos un criterio');
    }
  };

  const handleUpdateCriterion = (
    index: number,
    field: keyof TypeCreateRubricCriterionDto,
    value: string | number | undefined
  ) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value,
    };
    setCriteria(updatedCriteria);
  };

  const handleAddLevel = (criterionIndex: number) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[criterionIndex].levels.push({
      name: '',
      description: '',
      score: 0,
    });
    setCriteria(updatedCriteria);
  };

  const handleRemoveLevel = (criterionIndex: number, levelIndex: number) => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[criterionIndex].levels.length > 2) {
      updatedCriteria[criterionIndex].levels = updatedCriteria[criterionIndex].levels.filter(
        (_, i) => i !== levelIndex
      );
      setCriteria(updatedCriteria);
    } else {
      toast.error('Debe tener al menos 2 niveles por criterio');
    }
  };

  const handleUpdateLevel = (
    criterionIndex: number,
    levelIndex: number,
    field: keyof TypeCreateRubricLevelDto,
    value: string | number
  ) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[criterionIndex].levels[levelIndex] = {
      ...updatedCriteria[criterionIndex].levels[levelIndex],
      [field]: value,
    };
    setCriteria(updatedCriteria);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
    });
    setCriteria([
      {
        name: '',
        description: '',
        weight: undefined,
        levels: [
          { name: '', description: '', score: 0 },
          { name: '', description: '', score: 0 },
        ],
      },
    ]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Crear Nueva Rúbrica</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Información básica de la rúbrica */}
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la rúbrica"
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
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Criterios */}
          <Typography variant="h6" gutterBottom>
            Criterios de Evaluación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Define los criterios y sus niveles de logro para la rúbrica
          </Typography>

          {criteria.map((criterion, criterionIndex) => (
            <Paper key={criterionIndex} sx={{ p: 2, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Criterio {criterionIndex + 1}</Typography>
                {criteria.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveCriterion(criterionIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <TextField
                fullWidth
                label="Nombre del criterio"
                value={criterion.name}
                onChange={(e) => handleUpdateCriterion(criterionIndex, 'name', e.target.value)}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Descripción del criterio"
                multiline
                rows={2}
                value={criterion.description || ''}
                onChange={(e) => handleUpdateCriterion(criterionIndex, 'description', e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Peso (opcional)"
                  type="number"
                  value={criterion.weight || ''}
                  onChange={(e) =>
                    handleUpdateCriterion(
                      criterionIndex,
                      'weight',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  inputProps={{ min: 0, step: 0.1 }}
                  sx={{ flex: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Niveles de Logro:
              </Typography>

              {criterion.levels.map((level, levelIndex) => (
                <Paper key={levelIndex} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      Nivel {levelIndex + 1}
                    </Typography>
                    {criterion.levels.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveLevel(criterionIndex, levelIndex)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label="Nombre del nivel"
                    size="small"
                    value={level.name}
                    onChange={(e) =>
                      handleUpdateLevel(criterionIndex, levelIndex, 'name', e.target.value)
                    }
                    sx={{ mb: 1 }}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Descripción del nivel"
                    multiline
                    rows={2}
                    size="small"
                    value={level.description || ''}
                    onChange={(e) =>
                      handleUpdateLevel(criterionIndex, levelIndex, 'description', e.target.value)
                    }
                    sx={{ mb: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Puntuación"
                    type="number"
                    size="small"
                    value={level.score}
                    onChange={(e) =>
                      handleUpdateLevel(
                        criterionIndex,
                        levelIndex,
                        'score',
                        Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 0, step: 0.5 }}
                    required
                  />
                </Paper>
              ))}

              <Button
                size="small"
                onClick={() => handleAddLevel(criterionIndex)}
                startIcon={<AddIcon />}
                sx={{ mt: 1 }}
              >
                Agregar Nivel
              </Button>
            </Paper>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddCriterion}
            fullWidth
            sx={{ mt: 2 }}
          >
            Agregar Criterio
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleCreateRubric} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Crear Rúbrica'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
