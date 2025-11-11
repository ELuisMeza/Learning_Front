import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../stores/user.store';
import { Box, CircularProgress, Typography } from '@mui/material';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Error al autenticar con Google');
      navigate('/login');
      return;
    }

    if (token && userParam) {
      try {
       
        const user = JSON.parse(decodeURIComponent(userParam));
        
       
        setToken(token);
        setUser(user);
        
        toast.success('Inicio de sesión exitoso');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error al procesar el callback:', error);
        toast.error('Error al procesar la autenticación');
        navigate('/login');
      }
    } else {
      toast.error('No se recibieron los datos de autenticación');
      navigate('/login');
    }
  }, [searchParams, navigate, setToken, setUser]);

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
      <Typography variant="body1" color="text.secondary">
        Procesando autenticación...
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;


