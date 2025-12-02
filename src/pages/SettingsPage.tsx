import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';  
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SchoolIcon from '@mui/icons-material/School';
import { TabPanel } from '../components/settings/TabPanel';
import { TabCarrers } from '../components/settings/TabCarrers';
import { TabCycles } from '../components/settings/TabCycles';
import { TabModules } from '../components/settings/TabModules';
import { TabClasses } from '../components/settings/TabClasses';
import { TabTeachers } from '../components/settings/TabTeachers';

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        
        {/* Tab 3: Gestión de Módulos */}
        {tabValue === 2 && (
          <TabModules tabValue={tabValue} />
        )}
       
        {/* Tab 4: Clases por Módulo */}
        {tabValue === 3 && (
          <TabClasses tabValue={tabValue} />
        )}

        {/* Tab 5: Gestión de Docentes */}
        {tabValue === 4 && (
          <TabTeachers tabValue={tabValue} />
        )}

        {/* Tab 6: Importación Masiva */}
        <TabPanel value={tabValue} index={5}>
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
    </Box>
  );
};

export default SettingsPage;
