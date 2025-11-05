import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  // Checkbox,
  // FormControlLabel,
} from '@mui/material';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { useUserStore } from '../stores/user.store';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success, data, message } = await authService.login(email, password);
    if (success && data) {
      setUser(data.user);
      setToken(data.access_token);
      navigate('/dashboard');
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
      >
        <div className="w-full h-full bg-gradient-to-r from-blue-700/70 to-transparent"></div>
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-center p-8">
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontWeight: 'bold' }}
          >
            Bienvenido de nuevo
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Inicia sesión en tu cuenta para continuar aprendiendo.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />

            {/*  Recordarme y Olvidé mi contraseña — Comentado por ahora */}
            {/*
            <Box className="flex justify-between items-center mt-1 mb-2">
              <FormControlLabel control={<Checkbox />} label="Recordarme" />
              <a href="#" className="text-sm text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </Box>
            */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ py: 1.3, mt: 1 }}
            >
              Ingresar
            </Button>

            {/*  Enlace de Registro — Comentado por ahora */}
            {/*
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 3, color: 'text.secondary' }}
            >
              ¿No tienes una cuenta?{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Regístrate
              </a>
            </Typography>
            */}

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-400">O continúa con</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<FcGoogle />}
              sx={{ py: 1.3, fontWeight: 'bold' }}
            >
              Google
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default LoginPage;