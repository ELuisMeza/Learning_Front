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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PeopleIcon from '@mui/icons-material/People';
import { classService } from '../services/class.service';
import type { TypeClass } from '../types/class.types';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const ClassesPage = () => {
  const [classes, setClasses] = useState<TypeClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TypeClass | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getClasses();
      setClasses(data);
    } catch (error) {
      toast.error('Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre de la clase es requerido');
        return;
      }
      await classService.createClass(formData);
      toast.success('Clase creada exitosamente');
      setOpenDialog(false);
      setFormData({ name: '', description: '' });
      loadClasses();
    } catch (error) {
      toast.error('Error al crear la clase');
    }
  };

  const handleShowQR = (classItem: TypeClass) => {
    setSelectedClass(classItem);
    setOpenQRDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
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
      case 'inactive':
        return 'Inactiva';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mis Clases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nueva Clase
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Código</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay clases creadas. Crea tu primera clase.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.description || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(classItem.status)}
                      color={getStatusColor(classItem.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {classItem.code}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleShowQR(classItem)}
                      color="primary"
                      title="Ver código QR"
                    >
                      <QrCodeIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      title="Ver estudiantes"
                    >
                      <PeopleIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear clase */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Clase</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la clase"
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
          <Button onClick={handleCreateClass} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para mostrar QR */}
      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Código QR de la Clase</DialogTitle>
        <DialogContent>
          {selectedClass && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <QRCodeSVG value={selectedClass.code} size={256} />
              <Typography variant="body2" color="text.secondary">
                Código: <strong>{selectedClass.code}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Los estudiantes pueden escanear este código para inscribirse a la clase
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

export default ClassesPage;

