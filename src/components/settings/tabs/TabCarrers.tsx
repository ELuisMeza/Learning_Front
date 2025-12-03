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
import { useGetCarrers } from "../../../hooks/useGetCarrers";
import { getStatusColor, getStatusLabel } from "../../../utils/configurations.utils";
import { FormCarrer } from "../forms/FormCarrer";
import type { TypeCareer } from "../../../types/carrers.types";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";
import { ModalBase } from "../../ModalBase";

interface Props {
  tabValue: number;
}

export const TabCarrers: React.FC<Props> = ({ tabValue }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { carrers, loading: loadingCarrers, pagination, addCareer, params, setParams } = useGetCarrers();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search,
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = (career: TypeCareer) => {
    addCareer(career);
  };

  return (
    <TabPanel value={tabValue} index={0}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h6">Gestión de Carreras</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Crear Carrera
      </Button>
    </Box>

    {/* Barra de búsqueda y filtros */}
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        placeholder="Buscar carreras..."
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
    {loadingCarrers ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Cargando carreras...</Typography>
      </Box>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Modalidad</TableCell>
              <TableCell>Duración (años)</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carrers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    {params.search
                      ? 'No se encontraron carreras con ese criterio de búsqueda'
                      : 'No hay carreras registradas'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              carrers.map((career) => (
                <TableRow key={career.id}>
                  <TableCell>{career.code}</TableCell>
                  <TableCell>{career.name}</TableCell>
                  <TableCell>{career.degreeTitle}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        career.modality === 'hybrid'
                          ? 'Híbrida'
                          : career.modality === 'in_person'
                          ? 'Presencial'
                          : 'En línea'
                      }
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>{career.durationYears}</TableCell>
                  <TableCell>{career.totalCredits}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(career.status)}
                      color={getStatusColor(career.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" title="Eliminar">
                      <DeleteIcon />
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
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} carreras
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
          Mostrando {pagination.total} {pagination.total === 1 ? 'carrera' : 'carreras'}
        </Typography>
      </Box>
    )}
    
    {/* Diálogo: Crear Carrera */}
    <ModalBase open={openDialog} onClose={handleCloseDialog} title="Crear Nueva Carrera" size="sm">
      <FormCarrer onClose={handleCloseDialog} onSuccess={handleSuccess} />
    </ModalBase>

  </TabPanel>
  );
};