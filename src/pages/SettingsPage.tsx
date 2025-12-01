import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SchoolIcon from '@mui/icons-material/School';
import toast from 'react-hot-toast';
import { TabPanel } from '../components/settings/TabPanel';
import { TabCarrers } from '../components/settings/TabCarrers';
import { getStatusColor, getStatusLabel } from '../utils/configurations.utils';
import { TabCycles } from '../components/settings/TabCycles';

// Datos mockeados
const mockCycles = [
  { id: '1', name: '2025-I', status: 'active', startDate: '2025-01-15', endDate: '2025-06-30' },
  { id: '2', name: '2024-II', status: 'closed', startDate: '2024-07-15', endDate: '2024-12-20' },
  { id: '3', name: '2024-I', status: 'archived', startDate: '2024-01-15', endDate: '2024-06-30' },
];

const mockModules = [
  { id: '1', name: 'Programación I', cycleId: '1', quota: 30, enrolled: 25 },
  { id: '2', name: 'Base de Datos', cycleId: '1', quota: 25, enrolled: 20 },
  { id: '3', name: 'Algoritmos', cycleId: '1', quota: 35, enrolled: 32 },
];

const mockClasses = [
  { id: '1', name: 'Programación I - A', moduleId: '1', status: 'active', quota: 30, enrolled: 25, teacher: 'Juan Pérez' },
  { id: '2', name: 'Programación I - B', moduleId: '1', status: 'active', quota: 30, enrolled: 28, teacher: 'María García' },
  { id: '3', name: 'Base de Datos - A', moduleId: '2', status: 'closed', quota: 25, enrolled: 25, teacher: 'Carlos López' },
];

const mockTeachers = [
  { id: '1', name: 'Juan Pérez', email: 'juan.perez@example.com', status: 'active' },
  { id: '2', name: 'María García', email: 'maria.garcia@example.com', status: 'active' },
  { id: '3', name: 'Carlos López', email: 'carlos.lopez@example.com', status: 'active' },
];

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [cycles, setCycles] = useState(mockCycles);
  const [modules, setModules] = useState(mockModules);
  const [classes, setClasses] = useState(mockClasses);
  const [teachers, setTeachers] = useState(mockTeachers);
  
  // Estados para diálogos
  const [openCycleDialog, setOpenCycleDialog] = useState(false);
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [openTeacherDialog, setOpenTeacherDialog] = useState(false);

  // Estados para formularios
  const [cycleForm, setCycleForm] = useState({ name: '', startDate: '', endDate: '' });
  const [moduleForm, setModuleForm] = useState({ name: '', cycleId: '', quota: '' });
  const [classForm, setClassForm] = useState({ name: '', moduleId: '', quota: '', teacherId: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Gestión de Ciclos
  const handleCreateCycle = () => {
    if (!cycleForm.name || !cycleForm.startDate || !cycleForm.endDate) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    const newCycle = {
      id: String(cycles.length + 1),
      name: cycleForm.name,
      status: 'active' as const,
      startDate: cycleForm.startDate,
      endDate: cycleForm.endDate,
    };
    setCycles([...cycles, newCycle]);
    setCycleForm({ name: '', startDate: '', endDate: '' });
    setOpenCycleDialog(false);
    toast.success('Ciclo creado exitosamente');
  };

  // Gestión de Módulos
  const handleCreateModule = () => {
    if (!moduleForm.name || !moduleForm.cycleId || !moduleForm.quota) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    const newModule = {
      id: String(modules.length + 1),
      name: moduleForm.name,
      cycleId: moduleForm.cycleId,
      quota: Number(moduleForm.quota),
      enrolled: 0,
    };
    setModules([...modules, newModule]);
    setModuleForm({ name: '', cycleId: '', quota: '' });
    setOpenModuleDialog(false);
    toast.success('Módulo creado exitosamente');
  };

  // Gestión de Clases
  const handleCreateClass = () => {
    if (!classForm.name || !classForm.moduleId || !classForm.quota || !classForm.teacherId) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    const teacher = teachers.find(t => t.id === classForm.teacherId);
    const newClass = {
      id: String(classes.length + 1),
      name: classForm.name,
      moduleId: classForm.moduleId,
      status: 'active' as const,
      quota: Number(classForm.quota),
      enrolled: 0,
      teacher: teacher?.name || '',
    };
    setClasses([...classes, newClass]);
    setClassForm({ name: '', moduleId: '', quota: '', teacherId: '' });
    setOpenClassDialog(false);
    toast.success('Clase creada exitosamente');
  };

  const handleClassStatusChange = (classId: string, newStatus: 'active' | 'closed' | 'archived') => {
    setClasses(classes.map(c => c.id === classId ? { ...c, status: newStatus } : c));
    toast.success(`Clase ${newStatus === 'active' ? 'activada' : newStatus === 'closed' ? 'cerrada' : 'archivada'}`);
  };

  // Gestión de Docentes
  const handleCreateTeacher = () => {
    if (!teacherForm.name || !teacherForm.email || !teacherForm.password) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    const newTeacher = {
      id: String(teachers.length + 1),
      name: teacherForm.name,
      email: teacherForm.email,
      status: 'active' as const,
    };
    setTeachers([...teachers, newTeacher]);
    setTeacherForm({ name: '', email: '', password: '' });
    setOpenTeacherDialog(false);
    toast.success('Docente creado exitosamente');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gestiona la arquitectura del ciclo académico, módulos, clases y docentes
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Carreras" />
          <Tab icon={<CalendarTodayIcon />} iconPosition="start" label="Ciclos" />
          <Tab icon={<BookIcon />} iconPosition="start" label="Módulos" />
          <Tab icon={<ClassIcon />} iconPosition="start" label="Clases" />
          <Tab icon={<PersonAddIcon />} iconPosition="start" label="Asignación Docentes" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Docentes" />
          <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Importación Masiva" />
        </Tabs>

        
        {/* Tab 1: Gestión de Carreras */}
        {tabValue === 0 && (
          <TabCarrers tabValue={tabValue} />
        )}

        {/* Tab 2: Gestión de Ciclos */}
        {tabValue === 1 && (
          <TabCycles tabValue={tabValue} />
        )}
        
        {/* Tab 2: Gestión de Módulos */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Gestión de Módulos por Ciclo</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenModuleDialog(true)}
            >
              Crear Módulo
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Ciclo</TableCell>
                  <TableCell>Cupo</TableCell>
                  <TableCell>Matriculados</TableCell>
                  <TableCell>Disponibles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((module) => {
                  const cycle = cycles.find(c => c.id === module.cycleId);
                  return (
                    <TableRow key={module.id}>
                      <TableCell>{module.name}</TableCell>
                      <TableCell>{cycle?.name || 'N/A'}</TableCell>
                      <TableCell>{module.quota}</TableCell>
                      <TableCell>{module.enrolled}</TableCell>
                      <TableCell>
                        <Chip
                          label={module.quota - module.enrolled}
                          color={module.quota - module.enrolled > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 3: Clases por Módulo */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Clases por Módulo</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenClassDialog(true)}
            >
              Crear Clase
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Docente</TableCell>
                  <TableCell>Cupo</TableCell>
                  <TableCell>Matriculados</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((classItem) => {
                  const module = modules.find(m => m.id === classItem.moduleId);
                  return (
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.name}</TableCell>
                      <TableCell>{module?.name || 'N/A'}</TableCell>
                      <TableCell>{classItem.teacher}</TableCell>
                      <TableCell>{classItem.quota}</TableCell>
                      <TableCell>{classItem.enrolled}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(classItem.status)}
                          color={getStatusColor(classItem.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {classItem.status === 'active' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleClassStatusChange(classItem.id, 'closed')}
                              title="Cerrar clase"
                            >
                              <CloseIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleClassStatusChange(classItem.id, 'archived')}
                              title="Archivar clase"
                            >
                              <ArchiveIcon />
                            </IconButton>
                          </>
                        )}
                        {classItem.status === 'closed' && (
                          <IconButton
                            size="small"
                            onClick={() => handleClassStatusChange(classItem.id, 'archived')}
                            title="Archivar clase"
                          >
                            <ArchiveIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 4: Asignación de Docentes a Clases */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" sx={{ mb: 3 }}>Asignación de Docentes a Clases</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Selecciona una clase para asignar o cambiar el docente responsable. Puedes editar la asignación desde la tabla de Clases.
          </Alert>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Clase</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Docente Actual</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((classItem) => {
                  const module = modules.find(m => m.id === classItem.moduleId);
                  return (
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.name}</TableCell>
                      <TableCell>{module?.name || 'N/A'}</TableCell>
                      <TableCell>{classItem.teacher}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(classItem.status)}
                          color={getStatusColor(classItem.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setClassForm({
                              ...classForm,
                              name: classItem.name,
                              moduleId: classItem.moduleId,
                              teacherId: teachers.find(t => t.name === classItem.teacher)?.id || '',
                            });
                            setOpenClassDialog(true);
                          }}
                          title="Editar asignación"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 5: Gestión de Docentes */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Crear y Gestionar Docentes</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTeacherDialog(true)}
            >
              Crear Docente
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(teacher.status)}
                        color={getStatusColor(teacher.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="Editar">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" title="Eliminar">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 7: Importación Masiva */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" sx={{ mb: 3 }}>Importación Masiva de Usuarios</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Typography variant="h6">CSV</Typography>
                  <Button variant="outlined" startIcon={<UploadFileIcon />}>
                    Subir CSV
                  </Button>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <UploadFileIcon sx={{ fontSize: 48, color: 'success.main' }} />
                  <Typography variant="h6">Excel</Typography>
                  <Button variant="outlined" color="success" startIcon={<UploadFileIcon />}>
                    Subir Excel
                  </Button>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'info.main' }} />
                  <Typography variant="h6">Google Workspace</Typography>
                  <Button variant="outlined" color="info" startIcon={<CloudUploadIcon />}>
                    Conectar Google
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Alert severity="info">
            Formatos soportados: CSV, Excel (.xlsx, .xls). El archivo debe contener columnas: nombre, apellidos, email, rol, documento.
          </Alert>
        </TabPanel>
      </Paper>

      {/* Diálogo: Crear Ciclo */}
      <Dialog open={openCycleDialog} onClose={() => setOpenCycleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Ciclo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Ciclo"
            placeholder="Ej: 2025-I"
            fullWidth
            variant="outlined"
            value={cycleForm.name}
            onChange={(e) => setCycleForm({ ...cycleForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Fecha de Inicio"
            type="date"
            fullWidth
            variant="outlined"
            value={cycleForm.startDate}
            onChange={(e) => setCycleForm({ ...cycleForm, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Fecha de Fin"
            type="date"
            fullWidth
            variant="outlined"
            value={cycleForm.endDate}
            onChange={(e) => setCycleForm({ ...cycleForm, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCycleDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateCycle} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Crear Módulo */}
      <Dialog open={openModuleDialog} onClose={() => setOpenModuleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Módulo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Módulo"
            fullWidth
            variant="outlined"
            value={moduleForm.name}
            onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Ciclo</InputLabel>
            <Select
              value={moduleForm.cycleId}
              label="Ciclo"
              onChange={(e) => setModuleForm({ ...moduleForm, cycleId: e.target.value })}
            >
              {cycles.filter(c => c.status === 'active').map((cycle) => (
                <MenuItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Cupo Total"
            type="number"
            fullWidth
            variant="outlined"
            value={moduleForm.quota}
            onChange={(e) => setModuleForm({ ...moduleForm, quota: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModuleDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateModule} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Crear Clase */}
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Clase</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Clase"
            fullWidth
            variant="outlined"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Módulo</InputLabel>
            <Select
              value={classForm.moduleId}
              label="Módulo"
              onChange={(e) => setClassForm({ ...classForm, moduleId: e.target.value })}
            >
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Docente</InputLabel>
            <Select
              value={classForm.teacherId}
              label="Docente"
              onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Cupo"
            type="number"
            fullWidth
            variant="outlined"
            value={classForm.quota}
            onChange={(e) => setClassForm({ ...classForm, quota: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateClass} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Crear Docente */}
      <Dialog open={openTeacherDialog} onClose={() => setOpenTeacherDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Docente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre Completo"
            fullWidth
            variant="outlined"
            value={teacherForm.name}
            onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={teacherForm.email}
            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Contraseña Temporal"
            type="password"
            fullWidth
            variant="outlined"
            value={teacherForm.password}
            onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
            helperText="El docente deberá cambiar esta contraseña en su primer acceso"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeacherDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateTeacher} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
