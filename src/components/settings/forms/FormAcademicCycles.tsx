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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  School as SchoolIcon,
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  CreditCard as CreditCardIcon,
  Schedule as ScheduleIcon,
  List as ListIcon,
} from '@mui/icons-material';
import type { TypeCreateAcademicCycle, TypeAcademicCycle } from '../../../types/academic-cycles';
import { academicCyclesService } from '../../../services/academic-cycles.service';
import { useGetCarrers } from '../../../hooks/useGetCarrers';
import { TypeStatus } from '../../../lib/globals';
import { generateRandomCode } from '../../../utils/generateRandomCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess?: (academicCycle: TypeAcademicCycle) => void;
}

const schema = yup.object({
  careerId: yup.string().required('La carrera es obligatoria'),
  code: yup.string().required('El código es obligatorio'),
  name: yup.string().required('El nombre es obligatorio'),
  description: yup.string().required('La descripción es obligatoria'),
  orderNumber: yup
    .number()
    .typeError('Debe ser un número')
    .required('El número de orden es obligatorio')
    .min(1, 'El número de orden debe ser al menos 1')
    .integer('Debe ser un número entero'),
  creditsRequired: yup
    .number()
    .typeError('Debe ser un número')
    .required('Los créditos requeridos son obligatorios')
    .min(1, 'Los créditos deben ser al menos 1')
    .integer('Debe ser un número entero'),
  durationWeeks: yup
    .number()
    .typeError('Debe ser un número')
    .required('La duración en semanas es obligatoria')
    .min(1, 'La duración debe ser al menos 1 semana')
    .integer('Debe ser un número entero'),
});

export const FormAcademicCycles = ({ onClose, onSuccess }: Props) => {
  const { 
    carrers: careersForFilter, 
    loading: loadingCareers
  } = useGetCarrers({
    page: 1,
    limit: 1000,
    search: '',
    status: TypeStatus.ACTIVE,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TypeCreateAcademicCycle>({
    resolver: yupResolver(schema),
    defaultValues: {
      careerId: '',
      code: '',
      name: '',
      description: '',
      orderNumber: 1,
      creditsRequired: 120,
      durationWeeks: 16,
    },
  });

  const selectedCareerId = watch('careerId');
  const selectedCareer = careersForFilter.find((c) => c.id === selectedCareerId) || null;

  const handleGenerateCode = () => {
    const randomCode = generateRandomCode();
    setValue('code', randomCode);
  };

  const onSubmit = async (data: TypeCreateAcademicCycle) => {
    try {
      const { success, data: createdCycle, message } = await academicCyclesService.createAcademicCycle(data);
      if (success && createdCycle) {
        toast.success(message);
        onSuccess?.(createdCycle);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear el ciclo académico');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Carrera - ComboBox */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="careerId"
            control={control}
            render={({ field: { onChange } }) => (
              <FormControl fullWidth error={!!errors.careerId}>
                <Autocomplete
                  options={careersForFilter}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedCareer}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue.id : '');
                  }}
                  loading={loadingCareers}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) =>
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.code.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Carrera"
                      placeholder="Seleccionar carrera..."
                      error={!!errors.careerId}
                      helperText={errors.careerId?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCareers ? <CircularProgress color="inherit" size={20} /> : null}
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
                          {option.code}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    loadingCareers ? 'Cargando...' : 'No se encontraron carreras'
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
                placeholder="Ej: ING-C1"
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
                placeholder="Ej: Ciclo de Ingeniería"
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
                placeholder="Descripción del ciclo académico"
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

        {/* Número de Orden y Duración en la misma fila */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="orderNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Número de Orden"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.orderNumber}
                helperText={errors.orderNumber?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ListIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="durationWeeks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Duración (semanas)"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.durationWeeks}
                helperText={errors.durationWeeks?.message}
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

        {/* Créditos Requeridos */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="creditsRequired"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Créditos Requeridos"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.creditsRequired}
                helperText={errors.creditsRequired?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon color="action" />
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