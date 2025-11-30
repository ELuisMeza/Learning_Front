import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/user.store";
import { Box, CircularProgress, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  const getDataMe = async (token: string | null) => {
    if (!token) {
      toast.error("No se recibió el token de autenticación");
      navigate("/login");
      return;
    }

    setToken(token);
    const { success, data, message } = await userService.getUserMe();

    if (success && data) {
      setUser(data);
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    } else {
      toast.error(message);
      navigate("/login");
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Error al autenticar con Google");
      navigate("/login");
      return;
    }

    getDataMe(token);
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
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
