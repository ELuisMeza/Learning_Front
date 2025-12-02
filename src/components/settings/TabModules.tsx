import { 
  Chip, 
  IconButton, 
  TableCell, 
  Typography, 
  Box, 
  Button, 
  TableRow, 
  TableHead, 
  Table, 
  TableContainer, 
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from "./TabPanel";
import { useState } from "react";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useGetAcademicModules } from "../../hooks/useGetAcademicModules";
import { getStatusColor, getStatusLabel } from "../../utils/configurations.utils";
import { ModalBase } from "../ModalBase";
import { FormAcademicModule } from "./FormAcademicModule";
import type { TypeAcademicModule } from "../../types/academic-modules.types";

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

export const TabModules: React.FC<Props> = ({ tabValue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { academicModules, loading: loadingAcademicModules, pagination, addAcademicModule, params, setParams } = useGetAcademicModules();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search,
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = (academicModule: TypeAcademicModule) => {
    addAcademicModule(academicModule);
    setOpenDialog(false);
  };

  return (
    <TabPanel value={tabValue} index={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gestión de Módulos Académicos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Crear Módulo
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar módulos académicos..."
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

      {loadingAcademicModules ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Cargando módulos académicos...</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Ciclo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Orden</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {academicModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {params.search
                        ? 'No se encontraron módulos académicos con ese criterio de búsqueda'
                        : 'No hay módulos académicos registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                academicModules.map((academicModule) => (
                  <TableRow key={academicModule.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {academicModule.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{academicModule.name}</TableCell>
                    <TableCell>
                      {academicModule.cycleName || '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        maxWidth: 300, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {academicModule.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{academicModule.orderNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(academicModule.status)}
                        color={getStatusColor(academicModule.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(academicModule.createdAt)}
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
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} módulos académicos
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
            Mostrando {pagination.total} {pagination.total === 1 ? 'módulo académico' : 'módulos académicos'}
          </Typography>
        </Box>
      )}

      {/* Diálogo: Crear Módulo Académico */}
      <ModalBase open={openDialog} onClose={handleCloseDialog} title="Crear Nuevo Módulo Académico" size="md">
        <FormAcademicModule onClose={handleCloseDialog} onSuccess={handleSuccess} />
      </ModalBase>
    </TabPanel>
  );
};