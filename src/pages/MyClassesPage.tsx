import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { classService } from '../services/class.service';
import type { TypeClass } from '../types/class.types';
import toast from 'react-hot-toast';

const MyClassesPage = () => {
  const [classes, setClasses] = useState<TypeClass[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyClasses();
  }, []);

  const loadMyClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getMyClasses();
      setClasses(data);
    } catch (error: any) {
      console.error('Error al cargar clases:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar tus clases';
      toast.error(errorMessage);
      setClasses([]);
    } finally {
      setLoading(false);
    }
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
      <Typography variant="h4" gutterBottom>
        Mis Clases
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Clases en las que estás inscrito
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Docente</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Inscripción</TableCell>
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
                  No estás inscrito en ninguna clase. Escanea un código QR para inscribirte.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.description || '-'}</TableCell>
                  <TableCell>
                    {classItem.teacher
                      ? `${classItem.teacher.name} ${classItem.teacher.lastNameFather}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(classItem.status)}
                      color={getStatusColor(classItem.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {classItem.enrollmentDate
                      ? new Date(classItem.enrollmentDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyClassesPage;

