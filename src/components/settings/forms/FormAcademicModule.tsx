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
  List as ListIcon,
} from '@mui/icons-material';
import type { TypeAcademicModuleCreate, TypeAcademicModule } from '../../../types/academic-modules.types';
import { academicModulesService } from '../../../services/academic-modules.service';
import { useGetAcademicCyles } from '../../../hooks/useGetAcademicCyles';
import { TypeStatus } from '../../../lib/globals';
import { generateRandomCode } from '../../../utils/generateRandomCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess?: (academicModule: TypeAcademicModule) => void;
}

const schema = yup.object({
  cycleId: yup.string().required('El ciclo académico es obligatorio'),
  code: yup.string().required('El código es obligatorio'),
  name: yup.string().required('El nombre es obligatorio'),
  description: yup.string().required('La descripción es obligatoria'),
  orderNumber: yup
    .number()
    .typeError('Debe ser un número')
    .required('El número de orden es obligatorio')
    .min(1, 'El número de orden debe ser al menos 1')
    .integer('Debe ser un número entero'),
});

export const FormAcademicModule = ({ onClose, onSuccess }: Props) => {
  const { 
    academicCycles: cyclesForFilter, 
    loading: loadingCycles
  } = useGetAcademicCyles({
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
  } = useForm<TypeAcademicModuleCreate>({
    resolver: yupResolver(schema),
    defaultValues: {
      cycleId: '',
      code: '',
      name: '',
      description: '',
      orderNumber: 1,
    },
  });

  const selectedCycleId = watch('cycleId');
  const selectedCycle = cyclesForFilter.find((c) => c.id === selectedCycleId) || null;

  const handleGenerateCode = () => {
    const randomCode = generateRandomCode();
    setValue('code', randomCode);
  };

  const onSubmit = async (data: TypeAcademicModuleCreate) => {
    try {
      const { success, data: createdModule, message } = await academicModulesService.create(data);
      if (success && createdModule) {
        toast.success(message);
        onSuccess?.(createdModule);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear el módulo académico');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Ciclo Académico - ComboBox */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="cycleId"
            control={control}
            render={({ field: { onChange } }) => (
              <FormControl fullWidth error={!!errors.cycleId}>
                <Autocomplete
                  options={cyclesForFilter}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedCycle}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue.id : '');
                  }}
                  loading={loadingCycles}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) =>
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.code.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ciclo Académico"
                      placeholder="Seleccionar ciclo académico..."
                      error={!!errors.cycleId}
                      helperText={errors.cycleId?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCycles ? <CircularProgress color="inherit" size={20} /> : null}
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
                          {option.code} - {option.careerName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    loadingCycles ? 'Cargando...' : 'No se encontraron ciclos académicos'
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
                placeholder="Ej: MAT101"
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
                placeholder="Ej: Matemática Básica"
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
                placeholder="Descripción del módulo académico"
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

        {/* Número de Orden */}
        <Grid size={{ xs: 12 }}>
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
