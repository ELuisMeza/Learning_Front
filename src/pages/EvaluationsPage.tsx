import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { QRCodeSVG } from 'qrcode.react';
import { TypeEvaluationMode } from '../lib/globals';
import { useGetEvaluations } from '../hooks/useGetEvaluations';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { useGetClassesByTeacher } from '../hooks/useGetClassesByTeacher';
import { getEvaluationModeLabel } from '../utils/getLabel';
import { getStatusColor, getStatusLabel } from '../utils/configurations.utils';
import { FormCreateEvaluation } from '../components/classDetails/FormCreateEvaluation';
import { evaluationService } from '../services/evaluation.service';
import { googleSheetsService } from '../services/googleSheets.service';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const EvaluationsPage = () => {
  const navigate = useNavigate();
  const { evaluations, loading, pagination, params, setParams } = useGetEvaluations();
  const { searchInput, setSearchInput } = useDebouncedSearch({
    initialValue: params.search || '',
    delay: 500,
    onUpdate: (value) => setParams({ search: value })
  });
  
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [selectedEvaluationForQR, setSelectedEvaluationForQR] = useState<any>(null);
  const { classes, loading: loadingClasses, setParams: setClassesParams } = useGetClassesByTeacher();
  
  // Cargar todas las clases cuando se abre el diálogo
  const handleOpenNewEvaluation = () => {
    setClassesParams({ page: 1, limit: 1000, search: '' });
    setOpenClassDialog(true);
  };

  const handleGoToClasses = () => {
    setOpenClassDialog(false);
    navigate('/dashboard/classes');
  };


  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setOpenClassDialog(false);
    setOpenEvaluationDialog(true);
  };

  const handleCloseEvaluationDialog = () => {
    setOpenEvaluationDialog(false);
    setSelectedClassId(null);
  };

  const handleEvaluationSuccess = () => {
    handleCloseEvaluationDialog();
    // Recargar las evaluaciones
    window.location.reload();
  };

  // Función para ver detalles de la evaluación
  const handleViewEvaluation = (evaluation: any) => {
    // Navegar a la página de resultados de la evaluación
    // Pasar el estado para saber de dónde viene
    navigate(`/dashboard/evaluation/${evaluation.id}/results`, {
      state: { from: '/dashboard/evaluations' }
    });
  };

  // Función para mostrar QR de la evaluación
  const handleShowQR = (evaluation: any) => {
    setSelectedEvaluationForQR(evaluation);
    setOpenQRDialog(true);
  };

  // Función para exportar resultados de la evaluación a Excel
  const handleExportEvaluation = async (evaluation: any) => {
    try {
      toast.loading('Exportando resultados...', { id: 'export' });
      
      // Obtener los resultados de la evaluación
      const results = await evaluationService.getEvaluationResults(evaluation.id);
      
      if (!results || results.length === 0) {
        toast.error('No hay resultados para exportar', { id: 'export' });
        return;
      }

      // Preparar los datos para Excel
      const excelData = results.map((result, index) => ({
        'N°': index + 1,
        'Evaluador': result.evaluator?.name && result.evaluator?.lastNameFather 
          ? `${result.evaluator.name} ${result.evaluator.lastNameFather}` 
          : 'N/A',
        'Evaluado': result.evaluated?.name && result.evaluated?.lastNameFather 
          ? `${result.evaluated.name} ${result.evaluated.lastNameFather}` 
          : 'N/A',
        'Puntuación Total': result.totalScore,
        'Comentarios': result.comments || '-',
        'Fecha de Envío': new Date(result.submittedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
      }));

      // Crear el libro de trabajo de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar el ancho de las columnas
      const colWidths = [
        { wch: 5 },   // N°
        { wch: 25 },  // Evaluador
        { wch: 25 },  // Evaluado
        { wch: 15 },  // Puntuación Total
        { wch: 40 },  // Comentarios
        { wch: 20 },  // Fecha de Envío
      ];
      ws['!cols'] = colWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Resultados');

      // Generar el nombre del archivo
      const fileName = `Resultados_${evaluation.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(wb, fileName);
      
      toast.success('Resultados exportados exitosamente', { id: 'export' });
    } catch (error: any) {
      console.error('Error al exportar resultados:', error);
      toast.error(error.message || 'Error al exportar los resultados', { id: 'export' });
    }
  };

  // Función para exportar a Google Sheets
  const handleExportToGoogleSheets = async (evaluation: any) => {
    try {
      toast.loading('Preparando exportación a Google Sheets...', { id: 'google-sheets' });
      
      // Verificar si hay tokens guardados en localStorage
      const storedAccessToken = localStorage.getItem('google_sheets_access_token');
      const storedRefreshToken = localStorage.getItem('google_sheets_refresh_token');
      
      if (!storedAccessToken) {
        // Si no hay token, iniciar flujo OAuth
        toast.loading('Redirigiendo a Google para autenticación...', { id: 'google-sheets' });
        const authResult = await googleSheetsService.authenticate();
        if (authResult.success && authResult.authUrl) {
          // Guardar el ID de evaluación para después de la autenticación
          sessionStorage.setItem('pending_export_evaluation_id', evaluation.id);
          sessionStorage.setItem('pending_export_evaluation_name', evaluation.name);
          // Redirigir a Google para autenticación
          window.location.href = authResult.authUrl;
          return;
        } else {
          toast.error('Error al autenticar con Google', { id: 'google-sheets' });
          return;
        }
      }

      // Exportar resultados con tokens guardados
      toast.loading('Exportando a Google Sheets...', { id: 'google-sheets' });
      const exportResult = await googleSheetsService.exportEvaluationResults(
        evaluation.id,
        storedAccessToken,
        storedRefreshToken || undefined,
        {
          createNew: true,
          sheetName: `Resultados_${evaluation.name}`,
        }
      );

      if (exportResult.success && exportResult.data?.spreadsheetUrl) {
        toast.success(
          `Resultados exportados exitosamente. <a href="${exportResult.data.spreadsheetUrl}" target="_blank" style="color: white; text-decoration: underline;">Abrir en Google Sheets</a>`,
          { id: 'google-sheets', duration: 8000 }
        );
      } else {
        toast.error(exportResult.message || 'Error al exportar a Google Sheets', { id: 'google-sheets' });
      }
    } catch (error: any) {
      console.error('Error al exportar a Google Sheets:', error);
      // Si el token expiró, limpiar y pedir nueva autenticación
      if (error.response?.status === 401) {
        localStorage.removeItem('google_sheets_access_token');
        localStorage.removeItem('google_sheets_refresh_token');
        toast.error('Sesión expirada. Por favor, vuelve a autenticarte.', { id: 'google-sheets' });
      } else {
        toast.error(error.message || 'Error al exportar a Google Sheets', { id: 'google-sheets' });
      }
    }
  };
  


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Evaluaciones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewEvaluation}
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
                      onClick={() => handleViewEvaluation(evaluation)}
                    >
                      Ver
                    </Button>
                    <Button
                      size="small"
                      startIcon={<QrCodeIcon />}
                      sx={{ mr: 1 }}
                      onClick={() => handleShowQR(evaluation)}
                    >
                      QR
                    </Button>
                    <Button
                      size="small"
                      startIcon={<GetAppIcon />}
                      onClick={() => handleExportEvaluation(evaluation)}
                      sx={{ mr: 1 }}
                    >
                      Excel
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GetAppIcon />}
                      onClick={() => handleExportToGoogleSheets(evaluation)}
                    >
                      Google Sheets
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

      {/* Diálogo para seleccionar clase */}
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Selecciona una clase</DialogTitle>
        <DialogContent>
          {loadingClasses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : classes.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No tienes clases disponibles. Crea una clase primero.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleGoToClasses}
                fullWidth
              >
                Ir a Mis Clases
              </Button>
            </Box>
          ) : (
            <List>
              {classes.map((classItem) => (
                <ListItem key={classItem.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectClass(classItem.id)}>
                    <ListItemText
                      primary={classItem.name}
                      secondary={classItem.modulename || 'Sin módulo'}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para crear evaluación */}
      {selectedClassId && (
        <FormCreateEvaluation
          open={openEvaluationDialog}
          onClose={handleCloseEvaluationDialog}
          classId={selectedClassId}
          onSuccess={handleEvaluationSuccess}
        />
      )}

      {/* Dialog para mostrar QR de evaluación */}
      <Dialog
        open={openQRDialog}
        onClose={() => setOpenQRDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Código QR de la Evaluación</DialogTitle>
        <DialogContent>
          {selectedEvaluationForQR && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <QRCodeSVG value={selectedEvaluationForQR.id} size={256} />
              <Typography variant="body2" color="text.secondary">
                <strong>{selectedEvaluationForQR.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Los estudiantes pueden escanear este código QR para acceder directamente a la evaluación
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvaluationsPage;

