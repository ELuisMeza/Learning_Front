import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import type { TypeClassByTeacher } from '../types/class.types';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { useGetAcademicModules } from '../hooks/useGetAcademicModules';
import { useGetAcademicCyles } from '../hooks/useGetAcademicCyles';
import { useGetCarrers } from '../hooks/useGetCarrers';
import { TypeStatus, TypeModality } from '../lib/globals';
import { getTeachingModeLabel } from '../utils/getLabel';
import { formatDate } from '../utils/formatDate';
import { useGetClassesByTeacher } from '../hooks/useGetClassesByTeacher';
import { FormClasses } from '../components/settings/forms/FormClasses';

const ClassesByTeacherPage = () => {
  const navigate = useNavigate();
  const { classes, loading, pagination, params, setParams, refetch } = useGetClassesByTeacher();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search,
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });

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
    academicCycles: cyclesForFilter,
    loading: loadingCycles
  } = useGetAcademicCyles({
    page: 1,
    limit: 1000,
    search: '',
    status: TypeStatus.ACTIVE,
  });

  const {
    carrers: careersForFilter,
    loading: loadingCareers
  } = useGetCarrers({
    page: 1,
    limit: 1000,
    search: '',
    status: TypeStatus.ACTIVE,
  });

  const [moduleSearchInput, setModuleSearchInput] = useState('');
  const [cycleSearchInput, setCycleSearchInput] = useState('');
  const [careerSearchInput, setCareerSearchInput] = useState('');

  const handleClassClick = (classItem: TypeClassByTeacher) => {
    navigate(`/dashboard/classes/${classItem.id}`);
  };

  const handleCreateSuccess = () => {
    setOpenCreateDialog(false);
    refetch();
  };


  const selectedModule = modulesForFilter.find((m) => m.id === params.moduleId) || null;
  const selectedCycle = cyclesForFilter.find((c) => c.id === params.cycleId) || null;
  const selectedCareer = careersForFilter.find((c) => c.id === params.carrerId) || null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mis Clases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Nueva Clase
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar clases..."
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo de Enseñanza</InputLabel>
          <Select
            value={params.typeTeaching || ''}
            label="Tipo de Enseñanza"
            onChange={(e) => setParams({ typeTeaching: (e.target.value || undefined) as TypeModality | undefined })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={TypeModality.IN_PERSON}>Presencial</MenuItem>
            <MenuItem value={TypeModality.ONLINE}>En línea</MenuItem>
            <MenuItem value={TypeModality.HYBRID}>Híbrido</MenuItem>
          </Select>
        </FormControl>
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={modulesForFilter}
          getOptionLabel={(option) => option.name || ''}
          value={selectedModule}
          onChange={(_, newValue) => {
            setParams({ moduleId: newValue ? newValue.id : undefined });
          }}
          inputValue={moduleSearchInput}
          onInputChange={(_, newInputValue) => {
            setModuleSearchInput(newInputValue);
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
              label="Módulo"
              placeholder="Buscar módulo..."
              InputProps={{
                ...params.InputProps,
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
                  {option.code}
                </Typography>
              </Box>
            </Box>
          )}
          noOptionsText={
            loadingModules ? 'Cargando...' : moduleSearchInput ? 'No se encontraron módulos' : 'Seleccione un módulo'
          }
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={cyclesForFilter}
          getOptionLabel={(option) => option.name || ''}
          value={selectedCycle}
          onChange={(_, newValue) => {
            setParams({ cycleId: newValue ? newValue.id : undefined });
          }}
          inputValue={cycleSearchInput}
          onInputChange={(_, newInputValue) => {
            setCycleSearchInput(newInputValue);
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
              label="Ciclo"
              placeholder="Buscar ciclo..."
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
                  {option.code}
                </Typography>
              </Box>
            </Box>
          )}
          noOptionsText={
            loadingCycles ? 'Cargando...' : cycleSearchInput ? 'No se encontraron ciclos' : 'Seleccione un ciclo'
          }
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={careersForFilter}
          getOptionLabel={(option) => option.name || ''}
          value={selectedCareer}
          onChange={(_, newValue) => {
            setParams({ carrerId: newValue ? newValue.id : undefined });
          }}
          inputValue={careerSearchInput}
          onInputChange={(_, newInputValue) => {
            setCareerSearchInput(newInputValue);
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
              placeholder="Buscar carrera..."
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
            loadingCareers ? 'Cargando...' : careerSearchInput ? 'No se encontraron carreras' : 'Seleccione una carrera'
          }
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Por página</InputLabel>
          <Select
            value={params.limit}
            label="Por página"
            onChange={(e) => setParams({ limit: Number(e.target.value) })}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Ciclo</TableCell>
              <TableCell>Carrera</TableCell>
              <TableCell>Tipo de Enseñanza</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Máx. Estudiantes</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  {params.search || params.moduleId || params.cycleId || params.carrerId || params.typeTeaching
                    ? 'No se encontraron clases con los filtros aplicados'
                    : 'No hay clases creadas. Crea tu primera clase.'}
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <TableRow 
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.description || '-'}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{classItem.modulename}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classItem.modulecode}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{classItem.cyclename}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classItem.cyclecode}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{classItem.careername}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {classItem.careercode}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTeachingModeLabel(classItem.typeteaching)}
                      color="info"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{classItem.credits}</TableCell>
                  <TableCell>{classItem.maxstudents}</TableCell>
                  <TableCell>{formatDate(classItem.createdat)}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => handleClassClick(classItem)}
                      color="primary"
                      title="Ver detalles"
                    >
                      <PeopleIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, page) => setParams({ page })}
            color="primary"
          />
        </Stack>
      )}

      {/* Diálogo para crear clase */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Crear Nueva Clase</DialogTitle>
        <DialogContent>
          <FormClasses 
            onClose={() => setOpenCreateDialog(false)} 
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ClassesByTeacherPage;

