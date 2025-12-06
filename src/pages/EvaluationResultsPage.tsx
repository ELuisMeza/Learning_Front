import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { evaluationService } from '../services/evaluation.service';
import { userService } from '../services/user.service';
import { teacherService } from '../services/teacher.service';
import { classService } from '../services/class.service';
import type { TypeEvaluation, TypeEvaluationResult } from '../types/evaluation.types';
import type { TypeUser } from '../types/user.types';
import type { TypeTeacher } from '../types/teachers.types';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/user.store';

interface Question {
  id: string;
  label: string;
  score: number;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
  }[];
}

interface ExamAnswer {
  questionId: string;
  optionId: string;
  isCorrect?: boolean;
}

const EvaluationResultsPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((s) => s.user);
  const [evaluation, setEvaluation] = useState<TypeEvaluation | null>(null);
  const [results, setResults] = useState<TypeEvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<ExamAnswer[]>([]);

  // Función para manejar el botón volver
  const handleGoBack = () => {
    // Si hay un estado que indica de dónde viene, usarlo
    const from = (location.state as any)?.from;
    
    if (from) {
      navigate(from);
      return;
    }

    // Si no hay estado, intentar usar el historial del navegador
    // Verificar si hay historial disponible
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback: usar la lógica basada en el rol
      const userRole = user?.role?.name?.toLowerCase() || '';
      
      if (userRole === 'estudiante' || userRole === 'student') {
        navigate('/dashboard/my-evaluations');
      } else if (userRole === 'docente' || userRole === 'teacher') {
        // Si tenemos el classId y venimos de los detalles de la clase, volver ahí
        const isFromClassDetails = location.pathname.includes('/classes/');
        if (evaluation?.classId && isFromClassDetails) {
          navigate(`/dashboard/classes/${evaluation.classId}`);
        } else {
          // Por defecto, volver a la lista de evaluaciones
          navigate('/dashboard/evaluations');
        }
      } else {
        navigate('/dashboard');
      }
    }
  };

  useEffect(() => {
    if (evaluationId) {
      loadEvaluationData();
    }
  }, [evaluationId]);

  const loadEvaluationData = async () => {
    try {
      setLoading(true);
      if (evaluationId) {
        const evaluationData = await evaluationService.getEvaluationById(evaluationId);
        setEvaluation(evaluationData);

        // Determinar si es examen o rúbrica
        const evaluationTypeName = (evaluationData as any).evaluationType?.name || 
                                   (evaluationData as any).evaluationTypeName || 
                                   '';
        const isExamen = evaluationTypeName.toLowerCase() === 'examen';
        
        // Determinar el modo de evaluación
        const evaluationMode = (evaluationData as any).evaluationMode || evaluationData.type;
        const isTeacherEvaluation = evaluationMode === 'teacher' || evaluationMode === 'individual';

        // Si es evaluación de tipo "teacher", obtener el docente de la clase
        let classTeacher: TypeTeacher | null = null;
        let classTeacherUser: TypeUser | null = null;
        if (isTeacherEvaluation && evaluationData.classId) {
          try {
            const classResponse = await classService.getClassById(evaluationData.classId);
            if (classResponse.success && classResponse.data) {
              const classData = classResponse.data;
              // Obtener el docente usando el teacherAppellative para buscar
              const teacherAppellative = (classData as any).teacherAppellative;
              
              if (teacherAppellative) {
                // Obtener todos los profesores y buscar por appellative y nombre
                const teachersResponse = await teacherService.getTeachers({
                  page: 1,
                  limit: 1000,
                  search: '',
                });
                
                if (teachersResponse.success && teachersResponse.data?.data) {
                  // Buscar el profesor que coincida con el appellative de la clase
                  classTeacher = teachersResponse.data.data.find((t: TypeTeacher) => 
                    t.appellative === teacherAppellative
                  ) || null;
                  
                  // Si encontramos el profesor, obtener el usuario asociado
                  if (classTeacher) {
                    const usersResponse = await userService.getAllUsers({
                      page: 1,
                      limit: 1000,
                      search: '',
                    });
                    
                    if (usersResponse.success && usersResponse.data?.data) {
                      classTeacherUser = usersResponse.data.data.find((u: TypeUser) => 
                        u.teacherId === classTeacher?.id
                      ) || null;
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error al obtener docente de la clase:', error);
          }
        }

        // Cargar resultados
        const resultsData = await evaluationService.getEvaluationResults(evaluationId).catch(() => []);
        
        // Si los resultados no tienen los objetos evaluator/evaluated completos, obtenerlos usando getAllUsers
        const userIds = new Set<string>();
        resultsData.forEach(result => {
          if (!result.evaluator && result.evaluatorId) {
            userIds.add(result.evaluatorId);
          }
          if (!result.evaluated && result.evaluatedId) {
            userIds.add(result.evaluatedId);
          }
        });
        
        // Obtener los usuarios que faltan usando getAllUsers con filtros
        const usersMap = new Map<string, TypeUser>();
        const teachersMap = new Map<string, TypeTeacher>();
        
        if (userIds.size > 0) {
          try {
            // Obtener todos los usuarios y filtrar por los IDs que necesitamos
            const usersResponse = await userService.getAllUsers({
              page: 1,
              limit: 1000,
              search: '',
            });
            
            if (usersResponse.success && usersResponse.data?.data) {
              const allUsers = usersResponse.data.data;
              const teacherIds = new Set<string>();
              
              // Filtrar solo los usuarios que necesitamos y recopilar IDs de profesores
              allUsers.forEach((user: TypeUser) => {
                if (userIds.has(user.id)) {
                  usersMap.set(user.id, user);
                  // Si el usuario es un docente, obtener su información de profesor
                  const isDocente = user.role?.name === 'Docente' || 
                                   user.role?.name === 'Teacher' ||
                                   user.role?.name?.toLowerCase() === 'docente' ||
                                   user.role?.name?.toLowerCase() === 'teacher';
                  
                  if (user.teacherId && isDocente) {
                    teacherIds.add(user.teacherId);
                    console.log('Usuario docente encontrado:', {
                      userId: user.id,
                      userName: user.name,
                      teacherId: user.teacherId,
                    });
                  }
                }
              });
              
              console.log('IDs de profesores a obtener:', Array.from(teacherIds));
              
              // Obtener información de los profesores si hay alguno
              if (teacherIds.size > 0) {
                try {
                  const teachersResponse = await teacherService.getTeachers({
                    page: 1,
                    limit: 1000,
                    search: '',
                  });
                  
                  console.log('Respuesta de profesores:', teachersResponse);
                  
                  if (teachersResponse.success && teachersResponse.data?.data) {
                    const allTeachers = teachersResponse.data.data;
                    console.log('Total de profesores obtenidos:', allTeachers.length);
                    allTeachers.forEach((teacher: TypeTeacher) => {
                      console.log('Profesor encontrado:', {
                        id: teacher.id,
                        name: teacher.name,
                        appellative: teacher.appellative,
                      });
                      if (teacherIds.has(teacher.id)) {
                        teachersMap.set(teacher.id, teacher);
                        console.log('Profesor agregado al mapa:', teacher.id);
                      }
                    });
                    console.log('Profesores en el mapa:', Array.from(teachersMap.keys()));
                  }
                } catch (error) {
                  console.error('Error al obtener profesores:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error al obtener usuarios:', error);
          }
        }
        
        // Debug: Verificar qué profesores se obtuvieron
        console.log('Profesores obtenidos:', Array.from(teachersMap.keys()));
        console.log('Usuarios obtenidos:', Array.from(usersMap.keys()));
        
        // Enriquecer los resultados con los datos de usuarios y profesores obtenidos
        const enrichedResults = resultsData.map(result => {
          let evaluator = result.evaluator || usersMap.get(result.evaluatorId);
          const evaluated = result.evaluated || usersMap.get(result.evaluatedId);
          
          // Si es evaluación de tipo "teacher", el evaluador siempre es el docente de la clase
          if (isTeacherEvaluation && classTeacher && classTeacherUser) {
            evaluator = {
              ...classTeacherUser,
              teacher: classTeacher,
              role: { name: 'Docente' } as any,
            } as any;
            console.log('Usando docente de la clase como evaluador:', {
              teacherName: classTeacher.name,
              teacherAppellative: classTeacher.appellative,
            });
          } else if (evaluator) {
            // Verificar si es docente
            const isDocente = evaluator.role?.name === 'Docente' || 
                             evaluator.role?.name === 'Teacher' ||
                             evaluator.role?.name?.toLowerCase() === 'docente' ||
                             evaluator.role?.name?.toLowerCase() === 'teacher';
            
            console.log('Procesando evaluador:', {
              id: evaluator.id,
              name: evaluator.name,
              role: evaluator.role?.name,
              isDocente,
              teacherId: evaluator.teacherId,
              hasTeacherInMap: evaluator.teacherId ? teachersMap.has(evaluator.teacherId) : false,
            });
            
            // Si es docente y tenemos el teacherId, obtener los datos del profesor
            if (isDocente && evaluator && evaluator.teacherId) {
              const teacherId = evaluator.teacherId;
              if (teachersMap.has(teacherId)) {
                const teacher = teachersMap.get(teacherId);
                const updatedEvaluator = {
                  ...evaluator,
                  teacher: teacher,
                } as any;
                evaluator = updatedEvaluator;
                console.log('Enriquecido evaluador con datos del profesor:', {
                  evaluatorId: updatedEvaluator.id,
                  teacherId: updatedEvaluator.teacherId,
                  teacherName: teacher?.name,
                  teacherAppellative: teacher?.appellative,
                });
              } else {
                console.warn('No se encontró profesor en el mapa para teacherId:', teacherId, 'Mapa tiene:', Array.from(teachersMap.keys()));
              }
            }
          }
          
          return {
            ...result,
            evaluator: evaluator,
            evaluated: evaluated,
          };
        });
        
        console.log('Resultados enriquecidos:', enrichedResults.map(r => ({
          evaluatorId: r.evaluatorId,
          evaluatorName: (r.evaluator as any)?.name,
          evaluatorRole: (r.evaluator as any)?.role?.name,
          evaluatorTeacherId: (r.evaluator as any)?.teacherId,
          hasTeacher: !!(r.evaluator as any)?.teacher,
          teacherName: (r.evaluator as any)?.teacher?.name,
        })));
        
        setResults(enrichedResults);

        // Si es examen, cargar preguntas y respuestas del estudiante
        if (isExamen && user?.id) {
          try {
            const questionsData = await evaluationService.getEvaluationQuestions(evaluationId);
            setQuestions(questionsData || []);
            
            // Intentar obtener respuestas del estudiante
            try {
              const answersData = await evaluationService.getExamAnswers(evaluationId, user.id);
              setExamAnswers(answersData || []);
            } catch (answerError) {
              console.warn('No se pudieron cargar las respuestas del examen:', answerError);
              // Continuar sin respuestas - se mostrarán las preguntas sin respuestas del estudiante
              setExamAnswers([]);
            }
          } catch (error) {
            console.error('Error al cargar detalles del examen:', error);
            toast.error('Error al cargar las preguntas del examen');
          }
        }
      }
    } catch (error) {
      toast.error('Error al cargar los resultados de la evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Determinar el rol del usuario
  const userRole = user?.role?.name?.toLowerCase() || '';
  const isStudent = userRole === 'estudiante' || userRole === 'student';
  const isTeacher = userRole === 'docente' || userRole === 'teacher';

  // Encontrar el resultado del usuario actual (solo para estudiantes)
  // Usar comparación de strings para evitar problemas de tipos
  const myResult = isStudent && user?.id
    ? results.find((r) => {
        const userId = String(user.id);
        const evaluatorId = r.evaluatorId ? String(r.evaluatorId) : null;
        const evaluatedId = r.evaluatedId ? String(r.evaluatedId) : null;
        return evaluatorId === userId || evaluatedId === userId;
      })
    : null;

  // Calcular promedio de todos los resultados
  const averageScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.totalScore, 0) / results.length
    : 0;

  // Determinar si es examen o rúbrica
  const evaluationTypeName = (evaluation as any)?.evaluationType?.name || 
                             (evaluation as any)?.evaluationTypeName || 
                             '';
  const isExamen = evaluationTypeName.toLowerCase() === 'examen';

  // Función para obtener la respuesta del estudiante para una pregunta
  const getStudentAnswer = (questionId: string) => {
    return examAnswers.find(answer => answer.questionId === questionId);
  };

  // Función para obtener la opción correcta de una pregunta
  const getCorrectOption = (question: Question) => {
    return question.options.find(option => option.isCorrect);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evaluation) {
    return (
      <Box>
        <Alert severity="error">No se pudo cargar la evaluación.</Alert>
        <Button onClick={handleGoBack} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Resultados de la Evaluación
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
        {evaluation.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {evaluation.description || 'Resultados de la evaluación completada'}
      </Typography>

      {/* Resumen de la Evaluación */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen de la Evaluación
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: isStudent ? 'repeat(2, 1fr)' : '1fr' }, gap: 2, mt: 2 }}>
            {isStudent && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tu Puntuación Total
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {myResult?.totalScore !== undefined && myResult?.totalScore !== null
                    ? myResult.totalScore.toFixed(2)
                    : 'N/A'}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">
                {isStudent ? 'Promedio de la Clase' : 'Promedio General'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {results.length > 0 ? averageScore.toFixed(2) : 'N/A'}
              </Typography>
            </Box>
            {isTeacher && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Resultados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {results.length}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Detalles de los Resultados (solo para estudiantes) */}
      {isStudent && myResult && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detalle de tu Evaluación
          </Typography>
          
          {isExamen && questions.length > 0 ? (
            // Detalles para EXÁMENES
            <Box sx={{ mt: 2 }}>
              {questions.map((question, index) => {
                const studentAnswer = getStudentAnswer(question.id);
                const correctOption = getCorrectOption(question);
                const selectedOption = question.options.find(opt => opt.id === studentAnswer?.optionId);
                const isCorrect = studentAnswer?.isCorrect ?? false;

                return (
                  <Card 
                    key={question.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid', 
                      borderColor: isCorrect ? 'success.main' : 'error.main',
                      backgroundColor: isCorrect ? 'success.50' : 'error.50',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                        Pregunta {index + 1}: {question.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isCorrect ? (
                          <>
                            <CheckCircleIcon sx={{ color: 'success.main' }} />
                            <Chip label="Correcta" color="success" size="small" />
                          </>
                        ) : (
                          <>
                            <CancelIcon sx={{ color: 'error.main' }} />
                            <Chip label="Incorrecta" color="error" size="small" />
                          </>
                        )}
                        <Chip label={`${question.score} pts`} size="small" variant="outlined" />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Tu respuesta:
                      </Typography>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: isCorrect ? 'success.main' : 'error.main',
                        }}
                      >
                        <Typography variant="body2">
                          {selectedOption?.label || 'No respondida'}
                        </Typography>
                      </Box>
                    </Box>

                    {!isCorrect && correctOption && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Respuesta correcta:
                        </Typography>
                        <Box 
                          sx={{ 
                            p: 1.5, 
                            borderRadius: 1, 
                            backgroundColor: 'success.50',
                            border: '1px solid',
                            borderColor: 'success.main',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'success.dark' }}>
                            {correctOption.label}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Card>
                );
              })}
            </Box>
          ) : (
            // Detalles para RÚBRICAS
            <Box sx={{ mt: 2 }}>
              {myResult.scores.length > 0 ? (
                <>
                  {myResult.scores.map((score) => (
                    <Card key={score.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {score.criteria?.name || 'Criterio'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {score.criteria?.description || ''}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${score.score} puntos`}
                          color="primary"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nivel seleccionado: <strong>{score.level?.name || 'N/A'}</strong>
                        </Typography>
                        {score.level?.description && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {score.level.description}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  ))}
                  
                  {myResult.comments && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Comentarios:
                      </Typography>
                      <Typography variant="body2">
                        {myResult.comments}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="info">
                  No hay detalles disponibles para esta evaluación.
                </Alert>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* Tabla de Todos los Resultados */}
      {(isTeacher || results.length > 1) && results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Todos los Resultados
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Evaluador</TableCell>
                  <TableCell>Evaluado</TableCell>
                  <TableCell align="right">Puntuación Total</TableCell>
                  <TableCell>Fecha de Envío</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => {
                  // Obtener nombres de evaluador y evaluado
                  // Si el evaluador es un docente, usar el nombre del profesor
                  let evaluatorName = 'N/A';
                  if (result.evaluator) {
                    const evaluator = result.evaluator as any;
                    
                    // Debug: Verificar datos del evaluador
                    console.log('Evaluador datos:', {
                      id: evaluator.id,
                      name: evaluator.name,
                      role: evaluator.role?.name,
                      teacherId: evaluator.teacherId,
                      teacher: evaluator.teacher,
                    });
                    
                    // Verificar si es docente por el rol
                    const isDocente = evaluator.role?.name === 'Docente' || 
                                     evaluator.role?.name === 'Teacher' ||
                                     evaluator.role?.name?.toLowerCase() === 'docente' ||
                                     evaluator.role?.name?.toLowerCase() === 'teacher';
                    
                    // Si es docente y tiene información del profesor, usar el nombre del profesor
                    if (isDocente && evaluator.teacher) {
                      const teacher = evaluator.teacher;
                      evaluatorName = `${teacher.appellative || ''} ${teacher.name || ''} ${teacher.lastNameFather || ''}`.trim();
                      console.log('Usando nombre del profesor:', evaluatorName);
                    } else if (isDocente && evaluator.teacherId) {
                      // Si es docente pero no tenemos los datos del profesor aún, intentar obtenerlos
                      console.warn('Evaluador es docente pero no tiene datos del profesor:', evaluator.teacherId);
                      evaluatorName = `${evaluator.name || ''} ${evaluator.lastNameFather || ''}`.trim();
                    } else {
                      // Usar el nombre del usuario (estudiante)
                      evaluatorName = `${evaluator.name || ''} ${evaluator.lastNameFather || ''}`.trim();
                    }
                  } else if (result.evaluatorId) {
                    evaluatorName = `Usuario ${result.evaluatorId.substring(0, 8)}...`;
                  }
                  
                  const evaluatedName = result.evaluated?.name 
                    ? `${result.evaluated.name} ${result.evaluated.lastNameFather || ''}`.trim()
                    : result.evaluatedId 
                      ? `Usuario ${result.evaluatedId.substring(0, 8)}...` 
                      : 'N/A';
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell>
                        {evaluatorName}
                      </TableCell>
                      <TableCell>
                        {evaluatedName}
                      </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={result.totalScore}
                        color={result.evaluatorId === user?.id ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {results.length === 0 && (
        <Alert severity="info">
          Aún no hay resultados disponibles para esta evaluación.
        </Alert>
      )}
    </Box>
  );
};

export default EvaluationResultsPage;
