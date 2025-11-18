import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { useUserStore } from '../stores/user.store';
import { FcGoogle } from 'react-icons/fc';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  // Verificar si regresamos de Google sin pasar por el callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleError = urlParams.get('error');
    const fromGoogle = document.referrer.includes('google.com') || document.referrer.includes('accounts.google.com');
    
    if (fromGoogle && window.location.pathname === '/login' && !googleError) {
      console.error("========================================");
      console.error("ERROR: El backend NO redirigió al callback");
      console.error("========================================");
      console.error("El backend debe redirigir a: http://localhost:5173/auth/callback?token=...&user=...");
      console.error("Pero en su lugar redirigió a: /login");
      console.error("========================================");
      toast.error("Error de configuración: El backend no está redirigiendo correctamente después de autenticar con Google. Verifica la configuración del backend.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { success, data, message } = await authService.login(email, password);
    if (success && data) {
      setUser(data.user);
      setToken(data.access_token);
      navigate('/dashboard');
      toast.success(message);
    } else {
      toast.error(message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    console.log("========================================");
    console.log("INICIANDO LOGIN CON GOOGLE");
    console.log("========================================");
    const baseURL = import.meta.env.VITE_API_URL_BACKEND;
    const redirectURL = `${baseURL}/auth/google`;
    console.log("URL del backend:", baseURL);
    console.log("Redirigiendo a:", redirectURL);
    console.log("URL esperada del callback:", window.location.origin + "/auth/callback");
    console.log("========================================");
    
    // Agregar un listener para detectar cuando regresamos de Google
    const checkCallback = setInterval(() => {
      const currentURL = window.location.href;
      console.log("URL actual:", currentURL);
      
      if (currentURL.includes('/auth/callback')) {
        console.log("¡Llegamos al callback!");
        clearInterval(checkCallback);
      } else if (currentURL.includes('/login') && !currentURL.includes('google')) {
        console.log("Regresamos al login sin pasar por el callback");
        console.log("Esto significa que el backend NO está redirigiendo correctamente");
        clearInterval(checkCallback);
      }
    }, 500);
    
    // Limpiar el intervalo después de 30 segundos
    setTimeout(() => {
      clearInterval(checkCallback);
    }, 30000);
    
    setLoading(true);
    authService.redirectToGoogleLogin();
  };

  return (
    <div className="flex h-screen w-full">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
      >
        <div className="w-full h-full bg-linear-to-r from-blue-700/70 to-transparent"></div>
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
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <div className="flex items-center my-4">
              <div className="grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-400">O continúa con</span>
              <div className="grow border-t border-gray-300"></div>
            </div>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<FcGoogle />}
              sx={{ py: 1.3, fontWeight: 'bold' }}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? 'Conectando...' : 'Continuar con Google'}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default LoginPage;