import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Pagination,
  Stack,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import { TypeEvaluationMode } from '../lib/globals';
import { useGetEvaluations } from '../hooks/useGetEvaluations';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { getEvaluationModeLabel } from '../utils/getLabel';
import { getStatusColor, getStatusLabel } from '../utils/configurations.utils';

const EvaluationsPage = () => {
  const { evaluations, loading, pagination, params, setParams } = useGetEvaluations();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search || '',
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });
  


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Evaluaciones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nueva Evaluación
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar evaluaciones..."
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
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Modo de Evaluación</InputLabel>
          <Select
            value={params.evaluationMode || ''}
            label="Modo de Evaluación"
            onChange={(e) => setParams({ evaluationMode: (e.target.value || undefined) as TypeEvaluationMode | undefined })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={TypeEvaluationMode.SELF}>Autoevaluación</MenuItem>
            <MenuItem value={TypeEvaluationMode.PEER}>Coevaluación</MenuItem>
            <MenuItem value={TypeEvaluationMode.TEACHER}>Docente</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Fecha Inicio"
          type="date"
          size="small"
          value={params.startDate || ''}
          onChange={(e) => setParams({ startDate: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Fecha Fin"
          type="date"
          size="small"
          value={params.endDate || ''}
          onChange={(e) => setParams({ endDate: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Modo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Rúbrica</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography>Cargando evaluaciones...</Typography>
                </TableCell>
              </TableRow>
            ) : evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    {params.search
                      ? 'No se encontraron evaluaciones con ese criterio de búsqueda'
                      : 'No hay evaluaciones creadas. Crea tu primera evaluación.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{evaluation.name}</TableCell>
                  <TableCell>{getEvaluationModeLabel(evaluation.evaluationMode)}</TableCell>
                  <TableCell>{evaluation.evaluationTypeName || '-'}</TableCell>
                  <TableCell>{evaluation.className || '-'}</TableCell>
                  <TableCell>{evaluation.rubricName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(evaluation.status)}
                      color={getStatusColor(evaluation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.startDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.endDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{ mr: 1 }}
                    >
                      Ver
                    </Button>
                    <Button
                      size="small"
                      startIcon={<GetAppIcon />}
                    >
                      Exportar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} evaluaciones
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
            Mostrando {pagination.total} {pagination.total === 1 ? 'evaluación' : 'evaluaciones'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EvaluationsPage;

