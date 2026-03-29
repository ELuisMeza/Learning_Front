import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { useUserStore } from '../stores/user.store';
import { FcGoogle } from 'react-icons/fc';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();


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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              columnGap: 1.5,
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 'bold', textAlign: 'center', m: 0 }}
            >
              Bienvenido de nuevo
            </Typography>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setDemoOpen(true)}
              aria-label="Ver credenciales de demostración"
              startIcon={<HelpOutlineIcon fontSize="small" />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                flexShrink: 0,
                animation: 'login-demo-pulse 2s ease-in-out infinite',
                '@keyframes login-demo-pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.06)', opacity: 0.88 },
                },
              }}
            >
              Credenciales de demo
            </Button>
          </Box>

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

          <Dialog
            open={demoOpen}
            onClose={() => setDemoOpen(false)}
            maxWidth="xs"
            fullWidth
            slotProps={{
              paper: { sx: { borderRadius: 2 } },
            }}
          >
            <DialogTitle sx={{ pb: 0.5, fontSize: '1rem' }}>
              Acceso de demostración
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Credenciales para acceder:
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Correo
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                admin@example.com
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Contraseña
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                admin123
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2 }}>
              <Button onClick={() => setDemoOpen(false)} size="small" variant="contained">
                Entendido
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>
    </div>
  );
};

export default LoginPage;