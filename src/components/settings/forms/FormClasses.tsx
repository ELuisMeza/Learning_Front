import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  School as SchoolIcon,
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import type { TypeCreateClass, TypeClassWithPagination } from '../../../types/class.types';
import { classService } from '../../../services/class.service';
import { useGetAcademicModules } from '../../../hooks/useGetAcademicModules';
import { useGetTeachers } from '../../../hooks/useGetTeachers';
import { TypeStatus } from '../../../lib/globals';
import type { TypeModality } from '../../../lib/globals';
import { generateRandomCode } from '../../../utils/generateRandomCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess?: (newClass: TypeClassWithPagination) => void;
}

const schema = yup.object({
  moduleId: yup.string().required('El módulo académico es obligatorio'),
  teacherId: yup.string().required('El profesor es obligatorio'),
  code: yup.string().required('El código es obligatorio'),
  name: yup.string().required('El nombre es obligatorio'),
  description: yup.string().required('La descripción es obligatoria'),
  credits: yup
    .number()
    .typeError('Debe ser un número')
    .required('Los créditos son obligatorios')
    .min(1, 'Los créditos deben ser al menos 1')
    .integer('Debe ser un número entero'),
  maxStudents: yup
    .number()
    .typeError('Debe ser un número')
    .required('El cupo máximo es obligatorio')
    .min(1, 'El cupo debe ser al menos 1')
    .integer('Debe ser un número entero'),
  typeTeaching: yup.string().oneOf(['in_person', 'online', 'hybrid'] as const).required('El tipo de enseñanza es obligatorio'),
});

export const FormClasses = ({ onClose, onSuccess }: Props) => {
  // Hooks para obtener datos (primeras 1000)
  const { 
    academicModules: modulesForFilter, 
    loading: loadingModules
  } = useGetAcademicModules({
    page: 1,
    limit: 1000,
    search: '',
    status: TypeStatus.ACTIVE,
  });

  const { 
    teachers: teachersForFilter, 
    loading: loadingTeachers
  } = useGetTeachers({
    page: 1,
    limit: 1000,
    search: '',
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TypeCreateClass>({
    resolver: yupResolver(schema),
    defaultValues: {
      moduleId: '',
      teacherId: '',
      code: '',
      name: '',
      description: '',
      credits: 3,
      maxStudents: 30,
      typeTeaching: 'in_person' as TypeModality,
    },
  });

  const selectedModuleId = watch('moduleId');
  const selectedTeacherId = watch('teacherId');
  const selectedModule = modulesForFilter.find((m) => m.id === selectedModuleId) || null;
  const selectedTeacher = teachersForFilter.find((t) => t.id === selectedTeacherId) || null;

  const handleGenerateCode = () => {
    const randomCode = generateRandomCode();
    setValue('code', randomCode);
  };

  const onSubmit = async (data: TypeCreateClass) => {
    try {
      const { success, data: createdClass, message } = await classService.createClass(data);
      if (success && createdClass) {
        toast.success(message);
        onSuccess?.(createdClass as TypeClassWithPagination);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear la clase');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Módulo Académico - ComboBox */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="moduleId"
            control={control}
            render={({ field: { onChange } }) => (
              <FormControl fullWidth error={!!errors.moduleId}>
                <Autocomplete
                  options={modulesForFilter}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedModule}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue.id : '');
                  }}
                  loading={loadingModules}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) =>
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.code.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Módulo Académico"
                      placeholder="Seleccionar módulo académico..."
                      error={!!errors.moduleId}
                      helperText={errors.moduleId?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <BookIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {loadingModules ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.code} - {option.cycleName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    loadingModules ? 'Cargando...' : 'No se encontraron módulos académicos'
                  }
                />
              </FormControl>
            )}
          />
        </Grid>

        {/* Profesor - ComboBox */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="teacherId"
            control={control}
            render={({ field: { onChange } }) => (
              <FormControl fullWidth error={!!errors.teacherId}>
                <Autocomplete
                  options={teachersForFilter}
                  getOptionLabel={(option) => option.appellative || ''}
                  value={selectedTeacher}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue.id : '');
                  }}
                  loading={loadingTeachers}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) =>
                      option.appellative.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.email.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Profesor"
                      placeholder="Seleccionar profesor..."
                      error={!!errors.teacherId}
                      helperText={errors.teacherId?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {loadingTeachers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">
                          {option.appellative}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    loadingTeachers ? 'Cargando...' : 'No se encontraron profesores'
                  }
                />
              </FormControl>
            )}
          />
        </Grid>

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
                placeholder="Ej: MAT101-01"
                fullWidth
                variant="outlined"
                error={!!errors.code}
                helperText={errors.code?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={handleGenerateCode}
                        startIcon={<RefreshIcon />}
                        variant="outlined"
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Generar
                      </Button>
                    </InputAdornment>
                  ),
                }}
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
                placeholder="Ej: Matemática Básica - Grupo 01"
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
                placeholder="Descripción de la clase"
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

        {/* Créditos y Cupo Máximo */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="credits"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Créditos"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.credits}
                helperText={errors.credits?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="maxStudents"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cupo Máximo"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.maxStudents}
                helperText={errors.maxStudents?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Tipo de Enseñanza */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="typeTeaching"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.typeTeaching}>
                <InputLabel>Tipo de Enseñanza</InputLabel>
                <Select
                  {...field}
                  label="Tipo de Enseñanza"
                  error={!!errors.typeTeaching}
                >
                  <MenuItem value="in_person">Presencial</MenuItem>
                  <MenuItem value="online">En línea</MenuItem>
                  <MenuItem value="hybrid">Híbrido</MenuItem>
                </Select>
                {errors.typeTeaching && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.typeTeaching.message}
                  </Typography>
                )}
              </FormControl>
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
