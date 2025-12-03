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
import { useEffect, useState, useCallback, useRef } from 'react';
import type { TypeCreateClass, TypeClassWithPagination } from '../../../types/class.types';
import { classService } from '../../../services/class.service';
import { useGetAcademicModules } from '../../../hooks/useGetAcademicModules';
import { useGetTeachers } from '../../../hooks/useGetTeachers';
import type { TypeAcademicModule } from '../../../types/academic-modules.types';
import type { TypeTeacher } from '../../../types/teachers.types';
import type { TypeModality } from '../../../lib/globals';
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
  // Estados para módulos académicos
  const [allModules, setAllModules] = useState<TypeAcademicModule[]>([]);
  const [moduleSearchInput, setModuleSearchInput] = useState('');
  const moduleLoadingMoreRef = useRef(false);
  const moduleSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moduleIsSelectingRef = useRef(false);
  const moduleLastSearchRef = useRef<string>('');

  // Estados para profesores
  const [allTeachers, setAllTeachers] = useState<TypeTeacher[]>([]);
  const [teacherSearchInput, setTeacherSearchInput] = useState('');
  const teacherLoadingMoreRef = useRef(false);
  const teacherSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const teacherIsSelectingRef = useRef(false);
  const teacherLastSearchRef = useRef<string>('');

  const {
    academicModules,
    loading: loadingModules,
    pagination: modulesPagination,
    params: modulesParams,
    setParams: setModulesParams,
  } = useGetAcademicModules();

  const {
    teachers,
    loading: loadingTeachers,
    pagination: teachersPagination,
    params: teachersParams,
    setParams: setTeachersParams,
  } = useGetTeachers();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  // Manejar búsqueda de módulos con debounce
  useEffect(() => {
    if (moduleIsSelectingRef.current) {
      return;
    }

    if (moduleLastSearchRef.current === moduleSearchInput) {
      return;
    }

    if (modulesParams.search === moduleSearchInput) {
      moduleLastSearchRef.current = moduleSearchInput;
      return;
    }

    if (moduleSearchTimeoutRef.current) {
      clearTimeout(moduleSearchTimeoutRef.current);
    }

    moduleSearchTimeoutRef.current = setTimeout(() => {
      if (moduleLastSearchRef.current !== moduleSearchInput && !moduleIsSelectingRef.current) {
        moduleLastSearchRef.current = moduleSearchInput;
        setModulesParams({ search: moduleSearchInput, page: 1 });
        setAllModules([]);
      }
    }, 500);

    return () => {
      if (moduleSearchTimeoutRef.current) {
        clearTimeout(moduleSearchTimeoutRef.current);
      }
    };
  }, [moduleSearchInput, modulesParams.search, setModulesParams]);

  // Acumular módulos académicos activos
  useEffect(() => {
    const activeModules = academicModules.filter((module) => module.status === 'active');

    if (modulesParams.page === 1) {
      setAllModules(activeModules);
    } else {
      setAllModules((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newModules = activeModules.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newModules];
      });
    }
    moduleLoadingMoreRef.current = false;
  }, [academicModules, modulesParams.page]);

  // Cargar más módulos cuando se hace scroll
  const loadMoreModules = useCallback(() => {
    if (
      !loadingModules &&
      !moduleLoadingMoreRef.current &&
      modulesPagination &&
      modulesPagination.page < modulesPagination.totalPages
    ) {
      moduleLoadingMoreRef.current = true;
      setModulesParams({ page: modulesPagination.page + 1 });
    }
  }, [loadingModules, modulesPagination, setModulesParams]);

  // Manejar búsqueda de profesores con debounce
  useEffect(() => {
    if (teacherIsSelectingRef.current) {
      return;
    }

    if (teacherLastSearchRef.current === teacherSearchInput) {
      return;
    }

    if (teachersParams.search === teacherSearchInput) {
      teacherLastSearchRef.current = teacherSearchInput;
      return;
    }

    if (teacherSearchTimeoutRef.current) {
      clearTimeout(teacherSearchTimeoutRef.current);
    }

    teacherSearchTimeoutRef.current = setTimeout(() => {
      if (teacherLastSearchRef.current !== teacherSearchInput && !teacherIsSelectingRef.current) {
        teacherLastSearchRef.current = teacherSearchInput;
        setTeachersParams({ search: teacherSearchInput, page: 1 });
        setAllTeachers([]);
      }
    }, 500);

    return () => {
      if (teacherSearchTimeoutRef.current) {
        clearTimeout(teacherSearchTimeoutRef.current);
      }
    };
  }, [teacherSearchInput, teachersParams.search, setTeachersParams]);

  // Acumular profesores activos
  useEffect(() => {
    const activeTeachers = teachers.filter((teacher) => teacher.status === 'active');

    if (teachersParams.page === 1) {
      setAllTeachers(activeTeachers);
    } else {
      setAllTeachers((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTeachers = activeTeachers.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newTeachers];
      });
    }
    teacherLoadingMoreRef.current = false;
  }, [teachers, teachersParams.page]);

  // Cargar más profesores cuando se hace scroll
  const loadMoreTeachers = useCallback(() => {
    if (
      !loadingTeachers &&
      !teacherLoadingMoreRef.current &&
      teachersPagination &&
      teachersPagination.page < teachersPagination.totalPages
    ) {
      teacherLoadingMoreRef.current = true;
      setTeachersParams({ page: teachersPagination.page + 1 });
    }
  }, [loadingTeachers, teachersPagination, setTeachersParams]);

  // Cargar datos iniciales al montar
  useEffect(() => {
    moduleLastSearchRef.current = '';
    setModulesParams({ page: 1, limit: 20, search: '' });
    teacherLastSearchRef.current = '';
    setTeachersParams({ page: 1, limit: 20, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {/* Módulo Académico */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="moduleId"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <FormControl fullWidth error={!!errors.moduleId}>
                <Autocomplete
                  {...field}
                  options={allModules}
                  getOptionLabel={(option) =>
                    typeof option === 'string' ? option : `${option.name} (${option.code})`
                  }
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={allModules.find((m) => m.id === value) || null}
                  onChange={(_, newValue) => {
                    moduleIsSelectingRef.current = true;
                    onChange(newValue ? newValue.id : '');
                    if (newValue) {
                      const selectedText = `${newValue.name} (${newValue.code})`;
                      setModuleSearchInput(selectedText);
                      moduleLastSearchRef.current = selectedText;
                    } else {
                      setModuleSearchInput('');
                      moduleLastSearchRef.current = '';
                    }
                    setTimeout(() => {
                      moduleIsSelectingRef.current = false;
                    }, 200);
                  }}
                  loading={loadingModules && modulesParams.page === 1}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'input') {
                      moduleIsSelectingRef.current = false;
                      setModuleSearchInput(newInputValue);
                    } else if (reason === 'clear') {
                      moduleIsSelectingRef.current = false;
                      setModuleSearchInput('');
                      moduleLastSearchRef.current = '';
                    }
                  }}
                  inputValue={moduleSearchInput}
                  ListboxProps={{
                    onScroll: (event: React.SyntheticEvent) => {
                      const listboxNode = event.currentTarget;
                      if (
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                        listboxNode.scrollHeight - 10
                      ) {
                        loadMoreModules();
                      }
                    },
                    style: { maxHeight: '300px' },
                  }}
                  renderInput={(textFieldParams) => (
                    <TextField
                      {...textFieldParams}
                      label="Módulo Académico"
                      placeholder="Buscar módulo académico..."
                      error={!!errors.moduleId}
                      helperText={errors.moduleId?.message}
                      InputProps={{
                        ...textFieldParams.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <BookIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {loadingModules && modulesParams.page === 1 ? (
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
                        <Typography variant="body1">{option.name}</Typography>
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

        {/* Profesor */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="teacherId"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <FormControl fullWidth error={!!errors.teacherId}>
                <Autocomplete
                  {...field}
                  options={allTeachers}
                  getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.appellative
                  }
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={allTeachers.find((t) => t.id === value) || null}
                  onChange={(_, newValue) => {
                    teacherIsSelectingRef.current = true;
                    onChange(newValue ? newValue.id : '');
                    if (newValue) {
                      setTeacherSearchInput(newValue.appellative);
                      teacherLastSearchRef.current = newValue.appellative;
                    } else {
                      setTeacherSearchInput('');
                      teacherLastSearchRef.current = '';
                    }
                    setTimeout(() => {
                      teacherIsSelectingRef.current = false;
                    }, 200);
                  }}
                  loading={loadingTeachers && teachersParams.page === 1}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'input') {
                      teacherIsSelectingRef.current = false;
                      setTeacherSearchInput(newInputValue);
                    } else if (reason === 'clear') {
                      teacherIsSelectingRef.current = false;
                      setTeacherSearchInput('');
                      teacherLastSearchRef.current = '';
                    }
                  }}
                  inputValue={teacherSearchInput}
                  ListboxProps={{
                    onScroll: (event: React.SyntheticEvent) => {
                      const listboxNode = event.currentTarget;
                      if (
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                        listboxNode.scrollHeight - 10
                      ) {
                        loadMoreTeachers();
                      }
                    },
                    style: { maxHeight: '300px' },
                  }}
                  renderInput={(textFieldParams) => (
                    <TextField
                      {...textFieldParams}
                      label="Profesor"
                      placeholder="Buscar profesor..."
                      error={!!errors.teacherId}
                      helperText={errors.teacherId?.message}
                      InputProps={{
                        ...textFieldParams.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {loadingTeachers && teachersParams.page === 1 ? (
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
                      <Typography variant="body1">{option.appellative}</Typography>
                    </Box>
                  )}
                  noOptionsText={loadingTeachers ? 'Cargando...' : 'No se encontraron profesores'}
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
