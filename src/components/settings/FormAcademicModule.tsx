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
import { useEffect, useState, useCallback, useRef } from 'react';
import type { TypeAcademicModuleCreate, TypeAcademicModule } from '../../types/academic-modules.types';
import { academicModulesService } from '../../services/academic-modules.service';
import { useGetAcademicCyles } from '../../hooks/useGetAcademicCyles';
import type { TypeAcademicCycle } from '../../types/academic-cycles';
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
  const [allCycles, setAllCycles] = useState<TypeAcademicCycle[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const loadingMoreRef = useRef(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSelectingRef = useRef(false);
  const lastSearchRef = useRef<string>('');

  const { 
    academicCycles, 
    loading, 
    pagination, 
    params, 
    setParams 
  } = useGetAcademicCyles();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  // Manejar búsqueda con debounce (solo cuando no se está seleccionando y hay cambio real)
  useEffect(() => {
    // Si se está seleccionando, no hacer búsqueda
    if (isSelectingRef.current) {
      return;
    }

    // Si el valor no cambió comparado con el último que se buscó, no hacer búsqueda
    if (lastSearchRef.current === searchInput) {
      return;
    }

    // Si el valor es igual al parámetro actual de búsqueda, no buscar
    if (params.search === searchInput) {
      lastSearchRef.current = searchInput;
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Verificar que el valor siga siendo el mismo y que no se esté seleccionando
      if (lastSearchRef.current !== searchInput && !isSelectingRef.current) {
        lastSearchRef.current = searchInput;
        setParams({ search: searchInput, page: 1 });
        setAllCycles([]); // Resetear cuando cambia la búsqueda
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, params.search, setParams]);

  // Acumular ciclos académicos activos
  useEffect(() => {
    const activeCycles = academicCycles.filter((cycle) => cycle.status === 'active');
    
    if (params.page === 1) {
      // Primera página o nueva búsqueda: reemplazar
      setAllCycles(activeCycles);
    } else {
      // Páginas siguientes: acumular
      setAllCycles((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newCycles = activeCycles.filter((c) => !existingIds.has(c.id));
        return [...prev, ...newCycles];
      });
    }
    loadingMoreRef.current = false;
  }, [academicCycles, params.page]);

  // Cargar más ciclos cuando se hace scroll
  const loadMoreCycles = useCallback(() => {
    if (
      !loading &&
      !loadingMoreRef.current &&
      pagination &&
      pagination.page < pagination.totalPages
    ) {
      loadingMoreRef.current = true;
      setParams({ page: pagination.page + 1 });
    }
  }, [loading, pagination, setParams]);

  // Cargar ciclos iniciales al montar el componente
  useEffect(() => {
    lastSearchRef.current = '';
    setParams({ page: 1, limit: 20, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {/* Ciclo Académico con búsqueda y scroll infinito */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="cycleId"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <FormControl fullWidth error={!!errors.cycleId}>
                <Autocomplete
                  {...field}
                  options={allCycles}
                  getOptionLabel={(option) => 
                    typeof option === 'string' 
                      ? option 
                      : `${option.name} (${option.code})`
                  }
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={allCycles.find((c) => c.id === value) || null}
                  onChange={(_, newValue) => {
                    isSelectingRef.current = true;
                    onChange(newValue ? newValue.id : '');
                    // Cuando se selecciona una opción, actualizar el inputValue sin activar búsqueda
                    if (newValue) {
                      const selectedText = `${newValue.name} (${newValue.code})`;
                      setSearchInput(selectedText);
                      lastSearchRef.current = selectedText; // Actualizar para evitar búsqueda
                    } else {
                      setSearchInput('');
                      lastSearchRef.current = ''; // Actualizar para evitar búsqueda
                    }
                    // Resetear el flag después de un breve delay
                    setTimeout(() => {
                      isSelectingRef.current = false;
                    }, 200);
                  }}
                  loading={loading && params.page === 1}
                  onInputChange={(_, newInputValue, reason) => {
                    // Solo activar búsqueda cuando el usuario escribe manualmente (reason === 'input')
                    if (reason === 'input') {
                      isSelectingRef.current = false;
                      setSearchInput(newInputValue);
                    } else if (reason === 'clear') {
                      isSelectingRef.current = false;
                      setSearchInput('');
                      lastSearchRef.current = '';
                    }
                    // Ignorar otros eventos (reset, etc.) para evitar búsquedas innecesarias
                  }}
                  inputValue={searchInput}
                  ListboxProps={{
                    onScroll: (event: React.SyntheticEvent) => {
                      const listboxNode = event.currentTarget;
                      if (
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                        listboxNode.scrollHeight - 10
                      ) {
                        loadMoreCycles();
                      }
                    },
                    style: { maxHeight: '300px' },
                  }}
                  renderInput={(textFieldParams) => (
                    <TextField
                      {...textFieldParams}
                      label="Ciclo Académico"
                      placeholder="Buscar ciclo académico..."
                      error={!!errors.cycleId}
                      helperText={errors.cycleId?.message}
                      InputProps={{
                        ...textFieldParams.InputProps,
                        endAdornment: (
                          <>
                            {loading && params.page === 1 ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {textFieldParams.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.code} - {option.careerName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    loading ? 'Cargando...' : 'No se encontraron ciclos académicos'
                  }
                />
                {loading && pagination && pagination.page > 1 && pagination.page < pagination.totalPages && (
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      Cargando más ciclos...
                    </Typography>
                  </Box>
                )}
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
