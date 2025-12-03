import { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PeopleIcon from '@mui/icons-material/People';
import { classService } from '../services/class.service';
import type { TypeClass } from '../types/class.types';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const ClassesPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TypeClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TypeClass | null>(null);

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

  const handleShowQR = (classItem: TypeClass, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedClass(classItem);
    setOpenQRDialog(true);
  };

  const handleClassClick = (classItem: TypeClass) => {
    navigate(`/dashboard/classes/${classItem.id}`);
  };

  const handleViewStudents = (classItem: TypeClass, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/classes/${classItem.id}`);
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
                <TableRow 
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
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
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleShowQR(classItem, e)}
                      color="primary"
                      title="Ver código QR"
                    >
                      <QrCodeIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleViewStudents(classItem, e)}
                      color="primary"
                      title="Ver detalles"
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

