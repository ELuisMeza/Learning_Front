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
import { useGetClasses } from "../../hooks/useGetClasses";
import { getStatusColor, getStatusLabel } from "../../utils/configurations.utils";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { ModalBase } from "../ModalBase";
import { FormClasses } from "./FormClasses";
import type { TypeClassWithPagination } from "../../types/class.types";

interface Props {
  tabValue: number;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};


export const TabClasses: React.FC<Props> = ({ tabValue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { classes, loading: loadingClasses, pagination, addClass, params, setParams } = useGetClasses();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search,
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });

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
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {params.search
                        ? 'No se encontraron clases con ese criterio de búsqueda'
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
