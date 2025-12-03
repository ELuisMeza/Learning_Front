import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';  
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { TabCarrers } from '../components/settings/tabs/TabCarrers';
import { TabCycles } from '../components/settings/tabs/TabCycles';
import { TabModules } from '../components/settings/tabs/TabModules';
import { TabTeachers } from '../components/settings/tabs/TabTeachers';
import { TabClasses } from '../components/settings/tabs/TabClasses';
import { TabUsers } from '../components/settings/tabs/TabUsers';

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
          <Tab icon={<PersonIcon />} iconPosition="start" label="Estudiantes" />
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
        {tabValue === 5 && (
          <TabUsers tabValue={tabValue} />
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;
