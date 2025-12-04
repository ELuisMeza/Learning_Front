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
  InputLabel
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from "./TabPanel";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetTeachers } from "../../../hooks/useGetTeachers";
import { getStatusColor, getStatusLabel } from "../../../utils/configurations.utils";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";
import { ModalBase } from "../../ModalBase";
import { FormTeacher } from "../forms/FormTeacher";
import type { TypeTeacher } from "../../../types/teachers.types";
import { TypeStatus, TypeModality } from "../../../lib/globals";
import { formatDate } from "../../../utils/formatDate";
import { getTeachingModeLabel } from "../../../utils/getLabel";

interface Props {
  tabValue: number;
}

export const TabTeachers: React.FC<Props> = ({ tabValue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { teachers, loading: loadingTeachers, pagination, addTeacher, params, setParams } = useGetTeachers();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search,
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = (newTeacher: TypeTeacher) => {
    addTeacher(newTeacher);
    setOpenDialog(false);
  };

  return (
    <TabPanel value={tabValue} index={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gestión de Profesores</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Crear Profesor
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar profesores..."
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
          <InputLabel>Modo de Enseñanza</InputLabel>
          <Select
            value={params.typeTeaching || ''}
            label="Modo de Enseñanza"
            onChange={(e) => setParams({ typeTeaching: (e.target.value || undefined) as TypeModality | undefined })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={TypeModality.IN_PERSON}>Presencial</MenuItem>
            <MenuItem value={TypeModality.ONLINE}>En línea</MenuItem>
            <MenuItem value={TypeModality.HYBRID}>Híbrido</MenuItem>
          </Select>
        </FormControl>
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

      {loadingTeachers ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Cargando profesores...</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Grado Académico</TableCell>
                <TableCell>Años de Experiencia</TableCell>
                <TableCell>Modo de Enseñanza</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {params.search || params.status || params.typeTeaching
                        ? 'No se encontraron profesores con los filtros aplicados'
                        : 'No hay profesores registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {teacher.appellative}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {teacher.specialty || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {teacher.academicDegree || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {teacher.experienceYears || 0} {teacher.experienceYears === 1 ? 'año' : 'años'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTeachingModeLabel(teacher.teachingModes)}
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(teacher.status)}
                        color={getStatusColor(teacher.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(teacher.createdAt)}
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
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} profesores
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
            Mostrando {pagination.total} {pagination.total === 1 ? 'profesor' : 'profesores'}
          </Typography>
        </Box>
      )}

      {/* Diálogo: Crear Profesor */}
      <ModalBase open={openDialog} onClose={handleCloseDialog} title="Crear Nuevo Profesor" size="md">
        <FormTeacher onClose={handleCloseDialog} onSuccess={handleSuccess} />
      </ModalBase>
    </TabPanel>
  );
};
