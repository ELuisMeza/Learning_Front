import { useState } from "react";
import { 
  Box, 
  TableRow, 
  TableHead, 
  Table, 
  TableContainer, 
  Button, 
  Typography, 
  TableCell, 
  Chip, 
  IconButton, 
  TableBody, 
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  CircularProgress
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from "./TabPanel";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetClasses } from "../../../hooks/useGetClasses";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";
import type { TypeClassWithPagination } from "../../../types/class.types";
import { getStatusColor, getStatusLabel } from "../../../utils/configurations.utils";
import { ModalBase } from "../../ModalBase";
import { FormClasses } from "../forms/FormClasses";
import { TypeStatus, TypeModality } from "../../../lib/globals";
import { useGetTeachers } from "../../../hooks/useGetTeachers";
import { useGetAcademicModules } from "../../../hooks/useGetAcademicModules";
import { formatDate } from "../../../utils/formatDate";
import { getTeachingModeLabel } from "../../../utils/getLabel";

interface Props {
  tabValue: number;
}

export const TabClasses: React.FC<Props> = ({ tabValue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { classes, loading: loadingClasses, pagination, addClass, params, setParams } = useGetClasses();
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
    teachers: teachersForFilter, 
    loading: loadingTeachers
  } = useGetTeachers({
    page: 1,
    limit: 1000,
    search: '',
  });
  
  const [moduleSearchInput, setModuleSearchInput] = useState('');
  const [teacherSearchInput, setTeacherSearchInput] = useState('');

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = (newClass: TypeClassWithPagination) => {
    addClass(newClass);
    setOpenDialog(false);
  };

  return (
    <TabPanel value={tabValue} index={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gestión de Clases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Crear Clase
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
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={params.status || ''}
            label="Estado"
            onChange={(e) => setParams({ status: (e.target.value || undefined) as TypeStatus | undefined })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={TypeStatus.ACTIVE}>Activo</MenuItem>
            <MenuItem value={TypeStatus.INACTIVE}>Inactivo</MenuItem>
          </Select>
        </FormControl>
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
          value={modulesForFilter.find((m) => m.id === params.moduleId) || null}
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
          options={teachersForFilter}
          getOptionLabel={(option) => option.appellative || ''}
          value={teachersForFilter.find((t) => t.id === params.teacherId) || null}
          onChange={(_, newValue) => {
            setParams({ teacherId: newValue ? newValue.id : undefined });
          }}
          inputValue={teacherSearchInput}
          onInputChange={(_, newInputValue) => {
            setTeacherSearchInput(newInputValue);
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
              label="Docente"
              placeholder="Buscar docente..."
              InputProps={{
                ...params.InputProps,
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
            loadingTeachers ? 'Cargando...' : teacherSearchInput ? 'No se encontraron docentes' : 'Seleccione un docente'
          }
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Por página</InputLabel>
          <Select
            value={params.limit}
            label="Por página"
            onChange={(e) => setParams({ limit: Number(e.target.value) })}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loadingClasses ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Cargando clases...</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Módulo</TableCell>
                <TableCell>Docente</TableCell>
                <TableCell>Cupo</TableCell>
                <TableCell>Tipo de Enseñanza</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {params.search || params.status || params.moduleId || params.teacherId || params.typeTeaching
                        ? 'No se encontraron clases con los filtros aplicados'
                        : 'No hay clases registradas'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {classItem.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>
                      {classItem.moduleName || '-'}
                    </TableCell>
                    <TableCell>
                      {classItem.appellative || '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classItem.maxStudents || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTeachingModeLabel(classItem.typeTeaching)}
                        size="small"
                        color="info"
                      />
                  </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(classItem.status)}
                        color={getStatusColor(classItem.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(classItem.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} clases
          </Typography>
          <Stack spacing={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(_event, page) => setParams({ page })}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}

      {/* Información de paginación cuando hay menos de una página */}
      {pagination && pagination.totalPages === 1 && pagination.total > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {pagination.total} {pagination.total === 1 ? 'clase' : 'clases'}
          </Typography>
        </Box>
      )}

      {/* Diálogo: Crear Clase */}
      <ModalBase open={openDialog} onClose={handleCloseDialog} title="Crear Nueva Clase" size="md">
        <FormClasses onClose={handleCloseDialog} onSuccess={handleSuccess} />
      </ModalBase>
    </TabPanel>
  );
};
