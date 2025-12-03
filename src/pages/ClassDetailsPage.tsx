import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { classService } from '../services/class.service';
import type { TypeClassDetails, TypeClassStudent } from '../types/class.types';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import Grid from '@mui/material/Grid';

const ClassDetailsPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<TypeClassDetails | null>(null);
  const [students, setStudents] = useState<TypeClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);

  useEffect(() => {
    if (classId) {
      loadClassDetails();
      loadStudents();
    }
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      if (classId) {
        const { success, data, message } = await classService.getClassById(classId);
        if (success && data) {
          setClassData(data);
        } else {
          toast.error(message || 'Error al cargar los detalles de la clase');
        }
      }
    } catch (error) {
      toast.error('Error al cargar los detalles de la clase');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      if (classId) {
        const data = await classService.getClassStudents(classId);
        setStudents(data);
      }
    } catch (error) {
      toast.error('Error al cargar los estudiantes');
    } finally {
      setLoadingStudents(false);
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

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'success';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEnrollmentStatusLabel = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'Inscrito';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeTeachingLabel = (type: string) => {
    switch (type) {
      case 'in_person':
        return 'Presencial';
      case 'online':
        return 'En línea';
      case 'hybrid':
        return 'Híbrido';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!classData) {
    return (
      <Box>
        <Alert severity="error">No se pudo cargar la información de la clase.</Alert>
        <Button onClick={() => navigate('/dashboard/classes')} sx={{ mt: 2 }}>
          Volver a Mis Clases
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con botón de volver */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard/classes')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Detalles de la Clase</Typography>
      </Box>

      {/* Información de la clase */}
      <Box sx={{ flexGrow: 1, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {classData.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {classData.description || 'Sin descripción'}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(classData.status)}
                    color={getStatusColor(classData.status) as any}
                    size="medium"
                  />
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Código de la clase
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {classData.code}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de creación
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(classData.createdAt)}
                    </Typography>
                  </Grid>
                  {classData.module && (
                    <Grid size={6}>
                      <Typography variant="body2" color="text.secondary">
                        Módulo académico
                      </Typography>
                      <Typography variant="body1">
                        {classData.module.name} ({classData.module.code})
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Créditos
                    </Typography>
                    <Typography variant="body1">
                      {classData.credits}
                    </Typography>
                  </Grid>
                  {classData.teacher && (
                    <Grid size={6}>
                      <Typography variant="body2" color="text.secondary">
                        Docente
                      </Typography>
                      <Typography variant="body1">
                        {classData.teacher.appellative}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Modalidad
                    </Typography>
                    <Typography variant="body1">
                      {getTypeTeachingLabel(classData.typeTeaching)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Máximo de estudiantes
                    </Typography>
                    <Typography variant="body1">
                      {classData.maxStudents}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={() => setOpenQRDialog(true)}
                  >
                    Ver Código QR
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estadísticas */}
          <Grid size={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estadísticas
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h4" color="primary">
                    {students.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estudiantes inscritos
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de estudiantes */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6">Estudiantes Inscritos</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Fecha de inscripción</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingStudents ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay estudiantes inscritos en esta clase
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.student
                        ? `${student.student.name} ${student.student.lastNameFather} ${student.student.lastNameMother}`
                        : '-'}
                    </TableCell>
                    <TableCell>{student.student?.email || '-'}</TableCell>
                    <TableCell>
                      {student.student
                        ? `${student.student.documentType} ${student.student.documentNumber}`
                        : '-'}
                    </TableCell>
                    <TableCell>{formatDate(student.enrolledAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getEnrollmentStatusLabel(student.status)}
                        color={getEnrollmentStatusColor(student.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para mostrar QR */}
      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Código QR de la Clase</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <QRCodeSVG value={classData.code} size={256} />
            <Typography variant="body2" color="text.secondary">
              Código: <strong>{classData.code}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Los estudiantes pueden escanear este código para inscribirse a la clase
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassDetailsPage;

