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
  InputLabel,
  Autocomplete,
  CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { TabPanel } from "./TabPanel";
import { useState } from "react";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";
import { useGetAcademicCyles } from "../../../hooks/useGetAcademicCyles";
import type { TypeAcademicCycle } from "../../../types/academic-cycles";
import { getStatusColor, getStatusLabel } from "../../../utils/configurations.utils";
import { ModalBase } from "../../ModalBase";
import { FormAcademicCycles } from "../forms/FormAcademicCycles";
import { TypeStatus } from "../../../lib/globals";
import { useGetCarrers } from "../../../hooks/useGetCarrers";
import { formatDate } from "../../../utils/formatDate";

interface Props {
  tabValue: number;
} 

export const TabCycles = ({ tabValue }: Props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { academicCycles, loading: loadingAcademicCycles, pagination, addAcademicCycle, params, setParams } = useGetAcademicCyles();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search,
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
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
  
  const [careerSearchInput, setCareerSearchInput] = useState('');

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = (academicCycle: TypeAcademicCycle) => {
    addAcademicCycle(academicCycle);
  };

  const selectedCareer = careersForFilter.find((c) => c.id === params.careerId) || null;

  return (
    <TabPanel value={tabValue} index={1}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gestión de Ciclos Académicos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Crear Ciclo
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar ciclos académicos..."
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
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={careersForFilter}
          getOptionLabel={(option) => option.name || ''}
          value={selectedCareer}
          onChange={(_, newValue) => {
            setParams({ careerId: newValue ? newValue.id : undefined });
          }}
          inputValue={careerSearchInput}
          onInputChange={(_, newInputValue) => {
            setCareerSearchInput(newInputValue);
          }}
          filterOptions={(options, { inputValue }) =>
            options.filter((option) =>
              option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.code.toLowerCase().includes(inputValue.toLowerCase())
            )
          }
          loading={loadingCareers}
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
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loadingAcademicCycles ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Cargando ciclos académicos...</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Carrera</TableCell>
                <TableCell>Orden</TableCell>
                <TableCell>Créditos</TableCell>
                <TableCell>Duración (semanas)</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {academicCycles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {params.search || params.status || params.careerId
                        ? 'No se encontraron ciclos académicos con los filtros aplicados'
                        : 'No hay ciclos académicos registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                academicCycles.map((academicCycle) => (
                  <TableRow key={academicCycle.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {academicCycle.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{academicCycle.name}</TableCell>
                    <TableCell>
                      {academicCycle.careerName || '-'}
                    </TableCell>
                    <TableCell>{academicCycle.orderNumber}</TableCell>
                    <TableCell>{academicCycle.creditsRequired}</TableCell>
                    <TableCell>{academicCycle.durationWeeks}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(academicCycle.status)}
                        color={getStatusColor(academicCycle.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(academicCycle.createdAt)}
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
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} ciclos académicos
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
            Mostrando {pagination.total} {pagination.total === 1 ? 'ciclo académico' : 'ciclos académicos'}
          </Typography>
        </Box>
      )}

      {/* Diálogo: Crear Ciclo Académico */}
      <ModalBase open={openDialog} onClose={handleCloseDialog} title="Crear Nuevo Ciclo Académico" size="md">
        <FormAcademicCycles onClose={handleCloseDialog} onSuccess={handleSuccess} />
      </ModalBase>
    </TabPanel>
  );
};