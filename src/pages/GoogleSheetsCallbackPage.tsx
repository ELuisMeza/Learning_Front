import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { googleSheetsService } from '../services/googleSheets.service';
import toast from 'react-hot-toast';

const GoogleSheetsCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage('Error al autenticar con Google. Por favor, intenta de nuevo.');
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No se recibió el código de autorización.');
        return;
      }

      try {
        // Intercambiar código por tokens usando el servicio
        const tokenResult = await googleSheetsService.exchangeCodeForTokens(code);

        if (!tokenResult.success || !tokenResult.accessToken) {
          throw new Error(tokenResult.message || 'Error al obtener tokens');
        }

        // Guardar tokens en localStorage
        localStorage.setItem('google_sheets_access_token', tokenResult.accessToken);
        if (tokenResult.refreshToken) {
          localStorage.setItem('google_sheets_refresh_token', tokenResult.refreshToken);
        }

        setStatus('success');

        // Si hay una exportación pendiente, ejecutarla
        const pendingEvaluationId = sessionStorage.getItem('pending_export_evaluation_id');

        if (pendingEvaluationId) {
          sessionStorage.removeItem('pending_export_evaluation_id');
          sessionStorage.removeItem('pending_export_evaluation_name');
          
          toast.success('Autenticación exitosa. Redirigiendo...', { duration: 2000 });
          
          // Redirigir a la página de evaluaciones después de un breve delay
          setTimeout(() => {
            navigate('/dashboard/evaluations');
            // El usuario puede hacer clic en "Google Sheets" de nuevo para exportar
          }, 2000);
        } else {
          toast.success('Autenticación con Google Sheets exitosa', { duration: 3000 });
          setTimeout(() => {
            navigate('/dashboard/evaluations');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error en callback:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Error al procesar la autenticación');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Procesando autenticación con Google...</Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {errorMessage}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard/evaluations')}>
          Volver a Evaluaciones
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Alert severity="success" sx={{ maxWidth: 500 }}>
        Autenticación exitosa. Redirigiendo...
      </Alert>
    </Box>
  );
};

export default GoogleSheetsCallbackPage;

