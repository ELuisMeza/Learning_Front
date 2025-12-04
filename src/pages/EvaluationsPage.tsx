import { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import { evaluationService } from '../services/evaluation.service';
import { rubricService } from '../services/rubric.service';
import { classService } from '../services/class.service';
import type { TypeEvaluation } from '../types/evaluation.types';
import type { TypeRubric } from '../types/rubric.types';
import type { TypeClassByTeacher } from '../types/class.types';
import { TypeEvaluationMode } from '../lib/globals';
import toast from 'react-hot-toast';

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<TypeEvaluation[]>([]);
  const [classes, setClasses] = useState<TypeClassByTeacher[]>([]);
  const [rubrics, setRubrics] = useState<TypeRubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rubricId: '',
    classId: '',
    type: 'individual' as 'self' | 'peer' | 'individual' | 'group',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadClasses();
    loadEvaluations();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      loadRubricsByClass(formData.classId);
    }
  }, [formData.classId]);

  const loadClasses = async () => {
    try {
      const { success, data, message } = await classService.getClassesByTeacher({
        page: 1,
        limit: 1000,
        search: '',
      });
      if (success && data) {
        setClasses(data.data);
      } else {
        toast.error(message || 'Error al cargar las clases');
      }
    } catch (error) {
      toast.error('Error al cargar las clases');
    }
  };

  const loadRubricsByClass = async (classId: string) => {
    try {
      const data = await rubricService.getRubricsByClass(classId);
      setRubrics(data);
    } catch (error) {
      toast.error('Error al cargar las rúbricas');
    }
  };

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const allEvaluations: TypeEvaluation[] = [];
      for (const classItem of classes) {
        try {
          const classEvaluations = await evaluationService.getEvaluationsByClass(classItem.id);
          allEvaluations.push(...classEvaluations);
        } catch (error) {
          // Ignorar errores
        }
      }
      setEvaluations(allEvaluations);
    } catch (error) {
      toast.error('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classes.length > 0) {
      loadEvaluations();
    }
  }, [classes.length]);

  const handleCreateEvaluation = async () => {
    try {
      if (!formData.name.trim() || !formData.rubricId || !formData.classId) {
        toast.error('Completa todos los campos requeridos');
        return;
      }
      // Mapear formData al formato esperado por el backend
      const mappedFormData = {
        classId: formData.classId,
        name: formData.name,
        description: formData.description || '',
        rubricId: formData.rubricId || undefined,
        maxScore: 100, // Valor por defecto, debería venir de la rúbrica
        evaluationTypeId: formData.rubricId, // Usar rubricId temporalmente
        evaluationMode: (formData.type === 'self' ? TypeEvaluationMode.SELF : formData.type === 'peer' ? TypeEvaluationMode.PEER : TypeEvaluationMode.TEACHER) as TypeEvaluationMode,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      const { success, message } = await evaluationService.create(mappedFormData);
      if (!success) {
        toast.error(message || 'Error al crear la evaluación');
        return;
      }
      toast.success('Evaluación creada exitosamente');
      setOpenDialog(false);
      setFormData({
        name: '',
        description: '',
        rubricId: '',
        classId: '',
        type: 'individual',
        startDate: '',
        endDate: '',
      });
      loadEvaluations();
    } catch (error) {
      toast.error('Error al crear la evaluación');
    }
  };

  const handleExportToSheets = async (evaluationId: string) => {
    try {
      const result = await evaluationService.exportToGoogleSheets(evaluationId);
      if (result.url) {
        window.open(result.url, '_blank');
        toast.success('Exportación exitosa');
      }
    } catch (error) {
      toast.error('Error al exportar a Google Sheets');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'self':
        return 'Autoevaluación';
      case 'peer':
        return 'Coevaluación';
      case 'individual':
        return 'Individual';
      case 'group':
        return 'Grupal';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'default';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'draft':
        return 'Borrador';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Evaluaciones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nueva Evaluación
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
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
                <TableCell colSpan={8} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay evaluaciones creadas. Crea tu primera evaluación.
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{evaluation.name}</TableCell>
                  <TableCell>{getTypeLabel(evaluation.type)}</TableCell>
                  <TableCell>{evaluation.class?.name || '-'}</TableCell>
                  <TableCell>{evaluation.rubric?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(evaluation.status)}
                      color={getStatusColor(evaluation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.endDate).toLocaleDateString()}
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
                      onClick={() => handleExportToSheets(evaluation.id)}
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

      {/* Dialog para crear evaluación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Evaluación</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Clase</InputLabel>
            <Select
              value={formData.classId}
              label="Clase"
              onChange={(e) => setFormData({ ...formData, classId: e.target.value, rubricId: '' })}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Rúbrica</InputLabel>
            <Select
              value={formData.rubricId}
              label="Rúbrica"
              disabled={!formData.classId}
              onChange={(e) => setFormData({ ...formData, rubricId: e.target.value })}
            >
              {rubrics.map((rubric) => (
                <MenuItem key={rubric.id} value={rubric.id}>
                  {rubric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Evaluación</InputLabel>
            <Select
              value={formData.type}
              label="Tipo de Evaluación"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <MenuItem value="self">Autoevaluación</MenuItem>
              <MenuItem value="peer">Coevaluación</MenuItem>
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="group">Grupal</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la evaluación"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Fecha de Inicio"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Fecha de Fin"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateEvaluation} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvaluationsPage;

