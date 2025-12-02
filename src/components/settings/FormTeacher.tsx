import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputAdornment,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { TypeCreateTeacher, TypeTeacher } from '../../types/teachers.types';
import { teacherService } from '../../services/teacher.service';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess?: (teacher: TypeTeacher) => void;
}

const schema = yup.object({
  appellative: yup.string().required('El nombre completo es obligatorio'),
  specialty: yup.string().required('La especialidad es obligatoria'),
  academicDegree: yup.string().required('El grado académico es obligatorio'),
  experienceYears: yup
    .number()
    .typeError('Debe ser un número')
    .required('Los años de experiencia son obligatorios')
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .integer('Debe ser un número entero'),
  bio: yup.string().required('La biografía es obligatoria'),
  cvUrl: yup.string().url('Debe ser una URL válida').required('La URL del CV es obligatoria'),
  teachingModes: yup.string().required('El modo de enseñanza es obligatorio'),
});

export const FormTeacher = ({ onClose, onSuccess }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TypeCreateTeacher>({
    resolver: yupResolver(schema),
    defaultValues: {
      appellative: '',
      specialty: '',
      academicDegree: '',
      experienceYears: 0,
      bio: '',
      cvUrl: '',
      teachingModes: 'in_person',
    },
  });

  const onSubmit = async (data: TypeCreateTeacher) => {
    try {
      const { success, data: createdTeacher, message } = await teacherService.createTeacher(data);
      if (success && createdTeacher) {
        toast.success(message);
        onSuccess?.(createdTeacher);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear el profesor');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Nombre Completo (Appellative) */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="appellative"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="Nombre Completo"
                placeholder="Ej: Dr. Juan Pérez García"
                fullWidth
                variant="outlined"
                error={!!errors.appellative}
                helperText={errors.appellative?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Especialidad */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="specialty"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Especialidad"
                placeholder="Ej: Matemáticas, Física, etc."
                fullWidth
                variant="outlined"
                error={!!errors.specialty}
                helperText={errors.specialty?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Grado Académico */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="academicDegree"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Grado Académico"
                placeholder="Ej: Doctorado, Maestría, Licenciatura"
                fullWidth
                variant="outlined"
                error={!!errors.academicDegree}
                helperText={errors.academicDegree?.message}
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

        {/* Años de Experiencia */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="experienceYears"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Años de Experiencia"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.experienceYears}
                helperText={errors.experienceYears?.message}
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

        {/* Modo de Enseñanza */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="teachingModes"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.teachingModes}>
                <InputLabel>Modo de Enseñanza</InputLabel>
                <Select
                  {...field}
                  label="Modo de Enseñanza"
                  error={!!errors.teachingModes}
                >
                  <MenuItem value="in_person">Presencial</MenuItem>
                  <MenuItem value="online">En línea</MenuItem>
                  <MenuItem value="hybrid">Híbrido</MenuItem>
                </Select>
                {errors.teachingModes && (
                  <Box component="span" sx={{ fontSize: '0.75rem', color: 'error.main', mt: 0.5, ml: 1.75 }}>
                    {errors.teachingModes.message}
                  </Box>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Biografía */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Biografía"
                placeholder="Descripción profesional y experiencia..."
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                error={!!errors.bio}
                helperText={errors.bio?.message}
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

        {/* URL del CV */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="cvUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="URL del CV"
                placeholder="https://ejemplo.com/cv.pdf"
                fullWidth
                variant="outlined"
                error={!!errors.cvUrl}
                helperText={errors.cvUrl?.message || 'URL completa del curriculum vitae'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FileIcon color="action" />
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
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
};
