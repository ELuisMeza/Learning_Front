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
import AddIcon from '@mui/icons-material/Add';
import { classService } from '../services/class.service';
import { evaluationService } from '../services/evaluation.service';
import { rubricService } from '../services/rubric.service';
import { evaluationsQuestionsService } from '../services/evaluations-questions.service';
import type { TypeClassDetails, TypeClassStudent } from '../types/class.types';
import type { TypeRubric } from '../types/rubric.types';
import type { TypeEvaluationType } from '../types/evaluation.types';
import type { TypeEvaluationMode } from '../lib/globals';
import type { Question, QuestionOption } from '../types/evaluations-questions.types';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassDetailsPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<TypeClassDetails | null>(null);
  const [students, setStudents] = useState<TypeClassStudent[]>([]);
  const [rubrics, setRubrics] = useState<TypeRubric[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<TypeEvaluationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [loadingEvaluationTypes, setLoadingEvaluationTypes] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [createdEvaluationId, setCreatedEvaluationId] = useState<string | null>(null);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState<TypeEvaluationType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    {
      label: '',
      score: 0,
      options: [
        { label: '', is_correct: false },
        { label: '', is_correct: false },
      ],
    },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rubricId: '',
    evaluationTypeId: '',
    evaluationMode: 'teacher' as TypeEvaluationMode,
    maxScore: 0,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (classId) {
      loadClassDetails();
      loadStudents();
      loadRubrics();
      loadEvaluationTypes();
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

  const loadRubrics = async () => {
    try {
      setLoadingRubrics(true);
      if (classId) {
        const data = await rubricService.getRubricsByClass(classId);
        setRubrics(data);
      }
    } catch (error) {
      toast.error('Error al cargar las rúbricas');
    } finally {
      setLoadingRubrics(false);
    }
  };

  const loadEvaluationTypes = async () => {
    try {
      setLoadingEvaluationTypes(true);
      const { success, data } = await evaluationService.getEvaluationTypes();
      if (success && data) {
        setEvaluationTypes(data);
      }
    } catch (error) {
      toast.error('Error al cargar los tipos de evaluación');
    } finally {
      setLoadingEvaluationTypes(false);
    }
  };

  const handleCreateEvaluation = async () => {
    try {
      if (!formData.name.trim() || !classId || !formData.evaluationTypeId || !formData.evaluationMode) {
        toast.error('Completa todos los campos requeridos');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error('Selecciona las fechas de inicio y fin');
        return;
      }

      if (!formData.maxScore || formData.maxScore <= 0) {
        toast.error('El puntaje máximo debe ser mayor a 0');
        return;
      }

      const { success, message, data } = await evaluationService.create({
        classId: classId,
        name: formData.name,
        description: formData.description,
        rubricId: formData.rubricId || undefined,
        maxScore: formData.maxScore,
        evaluationTypeId: formData.evaluationTypeId,
        evaluationMode: formData.evaluationMode,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      if (success && data) {
        const evaluationId = data.id;
        const evaluationType = evaluationTypes.find((type) => type.id === formData.evaluationTypeId);
        
        // Verificar si el tipo de evaluación es "Examen" (case insensitive)
        if (evaluationType && evaluationType.name.toLowerCase() === 'examen') {
          setCreatedEvaluationId(evaluationId);
          setSelectedEvaluationType(evaluationType);
          setOpenEvaluationDialog(false);
          setOpenFormDialog(true);
          toast.success('Evaluación creada. Ahora crea el formulario del examen.');
        } else {
          toast.success(message || 'Evaluación creada exitosamente');
          setOpenEvaluationDialog(false);
          setFormData({
            name: '',
            description: '',
            rubricId: '',
            evaluationTypeId: '',
            evaluationMode: 'teacher',
            maxScore: 0,
            startDate: '',
            endDate: '',
          });
        }
      } else {
        toast.error(message || 'Error al crear la evaluación');
      }
    } catch (error) {
      toast.error('Error al crear la evaluación');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        label: '',
        score: 0,
        options: [
          { label: '', is_correct: false },
          { label: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: 'label' | 'score', value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ label: '', is_correct: false });
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updatedQuestions);
  };

  const handleUpdateOption = (
    questionIndex: number,
    optionIndex: number,
    field: 'label' | 'is_correct',
    value: string | boolean
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleCreateForm = async () => {
    try {
      if (!createdEvaluationId) {
        toast.error('No hay evaluación seleccionada');
        return;
      }

      // Validar que todas las preguntas tengan al menos una opción correcta
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.label.trim()) {
          toast.error(`La pregunta ${i + 1} debe tener un texto`);
          return;
        }
        if (question.options.length < 2) {
          toast.error(`La pregunta ${i + 1} debe tener al menos 2 opciones`);
          return;
        }
        const hasCorrectOption = question.options.some((opt) => opt.is_correct);
        if (!hasCorrectOption) {
          toast.error(`La pregunta ${i + 1} debe tener al menos una opción correcta`);
          return;
        }
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].label.trim()) {
            toast.error(`La opción ${j + 1} de la pregunta ${i + 1} debe tener un texto`);
            return;
          }
        }
      }

      const { success, message } = await evaluationsQuestionsService.createForm({
        evaluation_id: createdEvaluationId,
        questions: questions.map((q) => ({
          label: q.label,
          score: q.score || undefined,
          options: q.options.map((opt) => ({
            label: opt.label,
            is_correct: opt.is_correct,
          })),
        })),
      });

      if (success) {
        toast.success(message || 'Formulario creado exitosamente');
        setOpenFormDialog(false);
        setQuestions([
          {
            label: '',
            score: 0,
            options: [
              { label: '', is_correct: false },
              { label: '', is_correct: false },
            ],
          },
        ]);
        setCreatedEvaluationId(null);
        setSelectedEvaluationType(null);
        setFormData({
          name: '',
          description: '',
          rubricId: '',
          evaluationTypeId: '',
          evaluationMode: 'teacher',
          maxScore: 0,
          startDate: '',
          endDate: '',
        });
      } else {
        toast.error(message || 'Error al crear el formulario');
      }
    } catch (error) {
      toast.error('Error al crear el formulario');
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

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={() => setOpenQRDialog(true)}
                  >
                    Ver Código QR
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenEvaluationDialog(true)}
                  >
                    Crear Evaluación
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

      {/* Dialog para crear evaluación */}
      <Dialog open={openEvaluationDialog} onClose={() => setOpenEvaluationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Evaluación</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Rúbrica (Opcional)</InputLabel>
            <Select
              value={formData.rubricId}
              label="Rúbrica (Opcional)"
              disabled={loadingRubrics}
              onChange={(e) => setFormData({ ...formData, rubricId: e.target.value })}
            >
              <MenuItem value="">
                <em>Sin rúbrica</em>
              </MenuItem>
              {loadingRubrics ? (
                <MenuItem disabled>Cargando rúbricas...</MenuItem>
              ) : rubrics.length === 0 ? (
                <MenuItem disabled>No hay rúbricas disponibles para esta clase</MenuItem>
              ) : (
                rubrics.map((rubric) => (
                  <MenuItem key={rubric.id} value={rubric.id}>
                    {rubric.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Evaluación</InputLabel>
            <Select
              value={formData.evaluationTypeId}
              label="Tipo de Evaluación"
              disabled={loadingEvaluationTypes}
              onChange={(e) => setFormData({ ...formData, evaluationTypeId: e.target.value })}
              required
            >
              {loadingEvaluationTypes ? (
                <MenuItem disabled>Cargando tipos...</MenuItem>
              ) : evaluationTypes.length === 0 ? (
                <MenuItem disabled>No hay tipos de evaluación disponibles</MenuItem>
              ) : (
                evaluationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Modo de Evaluación</InputLabel>
            <Select
              value={formData.evaluationMode}
              label="Modo de Evaluación"
              onChange={(e) => setFormData({ ...formData, evaluationMode: e.target.value as TypeEvaluationMode })}
              required
            >
              <MenuItem value="teacher">Evaluación del Docente</MenuItem>
              <MenuItem value="self">Autoevaluación</MenuItem>
              <MenuItem value="peer">Coevaluación</MenuItem>
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
            required
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
            label="Puntaje Máximo"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.maxScore}
            onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
            inputProps={{ min: 1, step: 1 }}
            sx={{ mb: 2 }}
            required
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
            required
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
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEvaluationDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateEvaluation} variant="contained" disabled={loadingRubrics}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear formulario de examen */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Formulario de Examen</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Agrega las preguntas y opciones para el examen
            </Typography>

            {questions.map((question, questionIndex) => (
              <Paper key={questionIndex} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Pregunta {questionIndex + 1}</Typography>
                  {questions.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Texto de la pregunta"
                  value={question.label}
                  onChange={(e) => handleUpdateQuestion(questionIndex, 'label', e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  label="Puntaje (opcional)"
                  type="number"
                  value={question.score || ''}
                  onChange={(e) => handleUpdateQuestion(questionIndex, 'score', Number(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Opciones:
                </Typography>

                {question.options.map((option, optionIndex) => (
                  <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Opción ${optionIndex + 1}`}
                      value={option.label}
                      onChange={(e) => handleUpdateOption(questionIndex, optionIndex, 'label', e.target.value)}
                      size="small"
                      required
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={option.is_correct}
                          onChange={(e) =>
                            handleUpdateOption(questionIndex, optionIndex, 'is_correct', e.target.checked)
                          }
                        />
                      }
                      label="Correcta"
                    />
                    {question.options.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  size="small"
                  onClick={() => handleAddOption(questionIndex)}
                  sx={{ mt: 1 }}
                >
                  Agregar Opción
                </Button>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              fullWidth
              sx={{ mt: 2 }}
            >
              Agregar Pregunta
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateForm} variant="contained">
            Crear Formulario
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassDetailsPage;

