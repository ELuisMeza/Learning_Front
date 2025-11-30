import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { classService } from '../services/class.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ScanQRPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleManualCode = async () => {
    if (!code.trim()) {
      toast.error('Ingresa un código');
      return;
    }

    try {
      setLoading(true);
      const classData = await classService.getClassByCode(code.trim());
      
      // Inscribirse a la clase
      await classService.enrollStudent(classData.id);
      
      toast.success(`Te has inscrito exitosamente a la clase: ${classData.name}`);
      navigate('/dashboard/my-classes');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al inscribirse a la clase';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = () => {
    // Usar API nativa del navegador para escanear QR
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      // Aquí se implementaría la lógica de escaneo con cámara
      // Por ahora, mostramos un mensaje informativo
      toast('Funcionalidad de escaneo con cámara próximamente. Usa la entrada manual.', {
        icon: 'ℹ',
      });
    } else {
      toast.error('Tu navegador no soporta el acceso a la cámara');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inscribirse a una Clase
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Escanea el código QR de tu docente o ingresa el código manualmente
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Opción 1: Escanear con cámara */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <QrCodeScannerIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            <Typography variant="h6">Escanear Código QR</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Usa la cámara de tu dispositivo para escanear el código QR de la clase
            </Typography>
            <Button
              variant="contained"
              onClick={handleCameraScan}
              disabled={loading}
              fullWidth
            >
              Abrir Cámara
            </Button>
            <Alert severity="info" sx={{ mt: 2 }}>
              Esta funcionalidad requiere permisos de cámara. Por ahora, usa la entrada manual.
            </Alert>
          </Box>
        </Paper>

        {/* Opción 2: Entrada manual */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Ingresar Código Manualmente</Typography>
            <Typography variant="body2" color="text.secondary">
              Si tienes el código de la clase, ingrésalo aquí
            </Typography>
            <TextField
              label="Código de la Clase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              fullWidth
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleManualCode}
              disabled={loading || !code.trim()}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Inscribirse'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ScanQRPage;

