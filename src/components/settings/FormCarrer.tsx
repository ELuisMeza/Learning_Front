import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  School as SchoolIcon,
  Description as DescriptionIcon,
  EmojiEvents as EmojiEventsIcon,
  Schedule as ScheduleIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import type { TypeCreateCareer, TypeCareer } from '../../types/carrers.types';
import { careersService } from '../../services/carres.service';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess?: (career: TypeCareer) => void;
}

const schema = yup.object({
  code: yup.string().required('El código es obligatorio'),
  name: yup.string().required('El nombre es obligatorio'),
  description: yup.string().required('La descripción es obligatoria'),
  degreeTitle: yup.string().required('El título es obligatorio'),
  modality: yup
    .string()
    .oneOf(['hybrid', 'in_person', 'online'], 'Modalidad inválida')
    .required('La modalidad es obligatoria'),
  durationYears: yup
    .number()
    .typeError('Debe ser un número')
    .required('La duración en años es obligatoria')
    .min(1, 'La duración debe ser al menos 1 año')
    .integer('Debe ser un número entero'),
  totalCredits: yup
    .number()
    .typeError('Debe ser un número')
    .required('El total de créditos es obligatorio')
    .min(1, 'El total de créditos debe ser al menos 1')
    .integer('Debe ser un número entero'),
});

export const FormCarrer = ({ onClose, onSuccess }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TypeCreateCareer>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      degreeTitle: '',
      modality: 'hybrid',
      durationYears: 4,
      totalCredits: 120,
    },
  });

  const onSubmit = async (data: TypeCreateCareer) => {
    try {
      const { success, data: createdCareer, message } = await careersService.create(data);
      if (success && createdCareer) {
        toast.success(message);
        onSuccess?.(createdCareer);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear la carrera');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Código */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="Código"
                placeholder="Ej: CS-001"
                fullWidth
                variant="outlined"
                error={!!errors.code}
                helperText={errors.code?.message}
              />
            )}
          />
        </Grid>

        {/* Nombre */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                placeholder="Ej: Ingeniería de Sistemas"
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Descripción */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                placeholder="Descripción de la carrera"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Título Profesional */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="degreeTitle"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Título Profesional"
                placeholder="Ej: Ingeniero de Sistemas"
                fullWidth
                variant="outlined"
                error={!!errors.degreeTitle}
                helperText={errors.degreeTitle?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmojiEventsIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Modalidad */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="modality"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.modality}>
                <InputLabel>Modalidad</InputLabel>
                <Select
                  {...field}
                  label="Modalidad"
                >
                  <MenuItem value="hybrid">Híbrida</MenuItem>
                  <MenuItem value="in_person">Presencial</MenuItem>
                  <MenuItem value="online">En línea</MenuItem>
                </Select>
                {errors.modality && (
                  <FormHelperText>{errors.modality.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Duración y Créditos en la misma fila */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="durationYears"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Duración (años)"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.durationYears}
                helperText={errors.durationYears?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="totalCredits"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Total de Créditos"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.totalCredits}
                helperText={errors.totalCredits?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StarsIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Botones */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting} variant="outlined">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
};