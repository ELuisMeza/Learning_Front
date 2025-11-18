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
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { rubricService } from '../services/rubric.service';
import { classService } from '../services/class.service';
import type { TypeRubric } from '../types/rubric.types';
import type { TypeClass } from '../types/class.types';
import toast from 'react-hot-toast';

const RubricsPage = () => {
  const [rubrics, setRubrics] = useState<TypeRubric[]>([]);
  const [classes, setClasses] = useState<TypeClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', classId: '' });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (error) {
      toast.error('Error al cargar las clases');
    }
  };

  const loadRubrics = async (classesList?: TypeClass[]) => {
    try {
      setLoading(true);
      // Usar la lista proporcionada o el estado actual de clases
      const classesToUse = classesList || classes;
      
      if (classesToUse.length === 0) {
        setRubrics([]);
        setLoading(false);
        return;
      }
      
      // Cargar rúbricas de todas las clases
      const allRubrics: TypeRubric[] = [];
      for (const classItem of classesToUse) {
        try {
          const classRubrics = await rubricService.getRubricsByClass(classItem.id);
          allRubrics.push(...classRubrics);
        } catch (error) {
          // Ignorar errores de clases sin rúbricas
        }
      }
      setRubrics(allRubrics);
    } catch (error) {
      toast.error('Error al cargar las rúbricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classes.length > 0) {
      loadRubrics(classes);
    }
  }, [classes]);

  const handleCreateRubric = async () => {
    try {
      if (!formData.name.trim() || !formData.classId) {
        toast.error('Completa todos los campos requeridos');
        return;
      }
      await rubricService.createRubric(formData);
      toast.success('Rúbrica creada exitosamente');
      setOpenDialog(false);
      setFormData({ name: '', description: '', classId: '' });
      loadRubrics();
    } catch (error) {
      toast.error('Error al crear la rúbrica');
    }
  };

  const handleUploadExcel = async () => {
    try {
      if (!selectedFile || !selectedClassId) {
        toast.error('Selecciona un archivo y una clase');
        return;
      }
      await rubricService.uploadRubricExcel(selectedClassId, selectedFile);
      toast.success('Rúbrica subida exitosamente');
      setOpenUploadDialog(false);
      setSelectedFile(null);
      setSelectedClassId('');
      loadRubrics();
    } catch (error) {
      toast.error('Error al subir la rúbrica');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast.error('Por favor, selecciona un archivo Excel (.xlsx o .xls)');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Rúbricas</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Subir Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nueva Rúbrica
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Criterios</TableCell>
              <TableCell>Fecha de Creación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : rubrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay rúbricas creadas. Crea tu primera rúbrica o sube un archivo Excel.
                </TableCell>
              </TableRow>
            ) : (
              rubrics.map((rubric) => (
                <TableRow key={rubric.id}>
                  <TableCell>{rubric.name}</TableCell>
                  <TableCell>{rubric.description || '-'}</TableCell>
                  <TableCell>{rubric.class?.name || '-'}</TableCell>
                  <TableCell>{rubric.criteria?.length || 0} criterios</TableCell>
                  <TableCell>{new Date(rubric.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear rúbrica */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Rúbrica</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Clase</InputLabel>
            <Select
              value={formData.classId}
              label="Clase"
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la rúbrica"
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
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateRubric} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para subir Excel */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Rúbrica desde Excel</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            El archivo Excel debe contener los criterios y niveles de la rúbrica. 
            El backend procesará el archivo automáticamente.
          </Alert>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Clase</InputLabel>
            <Select
              value={selectedClassId}
              label="Clase"
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<UploadFileIcon />}
          >
            {selectedFile ? selectedFile.name : 'Seleccionar archivo Excel'}
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleUploadExcel}
            variant="contained"
            disabled={!selectedFile || !selectedClassId}
          >
            Subir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RubricsPage;

