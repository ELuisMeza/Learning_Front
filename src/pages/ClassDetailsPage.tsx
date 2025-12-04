import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";

import { QRCodeSVG } from "qrcode.react";
import Grid from "@mui/material/Grid";
import { useGetClassDetail } from "../hooks/useGetClassDetail";
import { useGetStudentsByClass } from "../hooks/useGetStudentsByClass";
import { FormCreateEvaluation } from "../components/classDetails/FormCreateEvaluation";
import AddIcon from "@mui/icons-material/Add";
import {
  getEnrollmentStatusLabel,
  getEvaluationModeLabel,
  getTeachingModeLabel,
} from "../utils/getLabel";
import { formatDate } from "../utils/formatDate";
import { TypeEnrollmentStatus, TypeEvaluationMode } from "../lib/globals";

const ClassDetailsPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);

  const { classData, loading: loadingClassDetails } =
    useGetClassDetail(classId);
  const { students, loading: loadingStudents } = useGetStudentsByClass(classId);

  const getEnrollmentStatusColor = (status: TypeEnrollmentStatus) => {
    switch (status) {
      case TypeEnrollmentStatus.IN_COURSE:
        return "success";
      case TypeEnrollmentStatus.COMPLETED:
        return "info";
      case TypeEnrollmentStatus.WITHDRAWN:
        return "error";
      default:
        return "default";
    }
  };

  const getEvaluationModeIcon = (mode: TypeEvaluationMode) => {
    switch (mode) {
      case TypeEvaluationMode.TEACHER:
        return <SchoolIcon fontSize="small" />;
      case TypeEvaluationMode.SELF:
        return <PersonIcon fontSize="small" />;
      case TypeEvaluationMode.PEER:
        return <GroupIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  const getEvaluationModeColor = (mode: TypeEvaluationMode) => {
    switch (mode) {
      case TypeEvaluationMode.TEACHER:
        return "primary";
      case TypeEvaluationMode.SELF:
        return "secondary";
      case TypeEvaluationMode.PEER:
        return "success";
      default:
        return "default";
    }
  };

  if (loadingClassDetails || loadingStudents) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!classData) {
    return (
      <Box>
        <Alert severity="error">
          No se pudo cargar la información de la clase.
        </Alert>
        <Button onClick={() => navigate("/dashboard/classes")} sx={{ mt: 2 }}>
          Volver a Mis Clases
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con botón de volver */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/dashboard/classes")}
          sx={{ mr: 1 }}
        >
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {classData.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {classData.description || "Sin descripción"}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Código de la clase
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
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
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Módulo académico
                    </Typography>
                    <Typography variant="body1">
                      {classData.moduleName} ({classData.moduleCode})
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ciclo
                    </Typography>
                    <Typography variant="body1">
                      {classData.cycleName} ({classData.cycleCode})
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Carrera
                    </Typography>
                    <Typography variant="body1">
                      {classData.careerName} ({classData.careerCode})
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Créditos
                    </Typography>
                    <Typography variant="body1">{classData.credits}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Docente
                    </Typography>
                    <Typography variant="body1">
                      {classData.teacherAppellative}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Modalidad
                    </Typography>
                    <Typography variant="body1">
                      {getTeachingModeLabel(classData.typeTeaching)}
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

                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
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
            <Card sx={{ mb: 3 }}>
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
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h4" color="secondary">
                    {classData.evaluations?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Evaluaciones creadas
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de estudiantes */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
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
                  <TableRow key={student.studentId}>
                    <TableCell>
                      {student.student
                        ? `${student.student.name} ${student.student.lastNameFather} ${student.student.lastNameMother}`
                        : "-"}
                    </TableCell>
                    <TableCell>{student.student?.email || "-"}</TableCell>
                    <TableCell>
                      {student.student
                        ? `${student.student.documentType} ${student.student.documentNumber}`
                        : "-"}
                    </TableCell>
                    <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
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

      {/* Sección de Evaluaciones */}
      <Paper sx={{ mt: 3 }}>
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Evaluaciones</Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Chip
              label={`${classData.evaluations?.length || 0} evaluaciones`}
              color="primary"
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenEvaluationDialog(true)}
              size="small"
            >
              Crear Evaluación
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: 2 }}>
          {!classData.evaluations || classData.evaluations.length === 0 ? (
            <Alert severity="info">
              No hay evaluaciones creadas para esta clase todavía
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {classData.evaluations.map((evaluation, index) => (
                <Grid size={6} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: 3,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AssignmentIcon color="primary" />
                          <Typography variant="h6" component="div">
                            {evaluation.name}
                          </Typography>
                        </Box>
                        <Chip
                          icon={getEvaluationModeIcon(evaluation.mode)}
                          label={getEvaluationModeLabel(evaluation.mode)}
                          color={getEvaluationModeColor(evaluation.mode) as any}
                          size="small"
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          minHeight: "40px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {evaluation.description || "Sin descripción"}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ flex: 1, minWidth: "120px" }}
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ flex: 1, minWidth: "120px" }}
                        >
                          Calificar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Dialog para mostrar QR */}
      <Dialog
        open={openQRDialog}
        onClose={() => setOpenQRDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Código QR de la Clase</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <QRCodeSVG value={classData.code} size={256} />
            <Typography variant="body2" color="text.secondary">
              Código: <strong>{classData.code}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Los estudiantes pueden escanear este código para inscribirse a la
              clase
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear evaluación */}
      {classId && (
        <FormCreateEvaluation
          open={openEvaluationDialog}
          onClose={() => setOpenEvaluationDialog(false)}
          classId={classId}
          onSuccess={() => {
            // Recargar los datos de la clase después de crear la evaluación
            window.location.reload();
          }}
        />
      )}
    </Box>
  );
};

export default ClassDetailsPage;
