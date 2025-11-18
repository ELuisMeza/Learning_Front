import { Box, Typography, Paper, TextField, Button, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configura los parámetros generales del sistema
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta sección está en desarrollo. Aquí se configurarán los parámetros generales del sistema.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Parámetro 1"
            fullWidth
            disabled
            helperText="Funcionalidad próximamente"
          />
          <TextField
            label="Parámetro 2"
            fullWidth
            disabled
            helperText="Funcionalidad próximamente"
          />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled
            sx={{ alignSelf: 'flex-start' }}
          >
            Guardar Configuración
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;

