import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../stores/user.store";
import { Box, CircularProgress, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import type { TypeUser } from "../types/user.types";

const AuthCallbackPage = () => {
  console.log(" ========================================");
  console.log(" AuthCallbackPage se está renderizando...");
  console.log(" URL actual:", window.location.href);
  console.log(" ========================================");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  const processAuth = async (token: string | null, userParam: string | null) => {
    if (!token) {
      console.error(" processAuth: No hay token");
      toast.error("No se recibió el token de autenticación");
      navigate("/login", { replace: true });
      return;
    }

    console.log(" Estableciendo token en el store...");
    // Establecer el token primero
    setToken(token);
    
    // Verificar que el token se estableció correctamente
    const { token: storedToken } = useUserStore.getState();
    console.log(" Token establecido:", storedToken ? " Confirmado" : " No se guardó");

    if (!storedToken) {
      console.error(" El token no se guardó en el store");
      toast.error("Error al guardar el token");
      navigate("/login", { replace: true });
      return;
    }

    // Si el backend devuelve el usuario directamente en los query params
    if (userParam) {
      try {
        console.log("👤 Parseando usuario de query params...");
        console.log("Usuario raw:", userParam);
        
        // Intentar parsear el usuario (puede venir como string JSON o ya como objeto)
        let user: TypeUser;
        try {
          // Primero intentar decodificar y parsear
          const decoded = decodeURIComponent(userParam);
          user = JSON.parse(decoded) as TypeUser;
        } catch (parseError) {
          // Si falla, intentar parsear directamente
          user = JSON.parse(userParam) as TypeUser;
        }
        
        console.log(" Usuario parseado:", user);
        
        // Verificar que el usuario tenga los campos necesarios
        if (!user || !user.id || !user.email) {
          console.error(" Usuario incompleto o inválido:", user);
          toast.error("Los datos del usuario están incompletos");
          navigate("/login", { replace: true });
          return;
        }
        
        setUser(user);
        
        // Verificar que el usuario se guardó correctamente
        await new Promise(resolve => setTimeout(resolve, 200));
        const { user: storedUser } = useUserStore.getState();
        console.log(" Usuario guardado:", storedUser ? " Confirmado" : " No se guardó");
        console.log(" Usuario completo en store:", storedUser);
        
        if (!storedUser) {
          console.error(" El usuario no se guardó en el store");
          toast.error("Error al guardar los datos del usuario");
          navigate("/login", { replace: true });
          return;
        }
        
        toast.success("Inicio de sesión exitoso");
        console.log(" Redirigiendo a /dashboard...");
        // Esperar un momento adicional para asegurar que todo esté sincronizado
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate("/dashboard", { replace: true });
        return;
      } catch (error) {
        console.error(" Error al parsear el usuario:", error);
        // Continuar con la llamada a getUserMe si falla el parseo
      }
    }

    // Si no hay usuario en los params, obtenerlo del backend
    console.log(" Obteniendo usuario del backend...");
    // Esperar un momento para asegurar que el token se haya establecido en el store
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const { success, data, message } = await userService.getUserMe();
      console.log("📡 Respuesta getUserMe:", { success, hasData: !!data, message });

      if (success && data) {
        console.log(" Usuario obtenido:", data);
        
        // Verificar que el usuario tenga los campos necesarios
        if (!data || !data.id || !data.email) {
          console.error(" Usuario incompleto o inválido del backend:", data);
          toast.error("Los datos del usuario están incompletos");
          navigate("/login", { replace: true });
          return;
        }
        
        setUser(data);
        
        // Verificar que el usuario se guardó correctamente
        await new Promise(resolve => setTimeout(resolve, 200));
        const { user: storedUser, token: storedTokenAfter } = useUserStore.getState();
        console.log("✅ Usuario guardado:", storedUser ? "✅ Confirmado" : "❌ No se guardó");
        console.log("✅ Token aún presente:", storedTokenAfter ? "✅ Sí" : "❌ No");
        console.log("📋 Usuario completo en store:", storedUser);
        
        if (!storedUser || !storedTokenAfter) {
          console.error("❌ El usuario o token no se guardaron correctamente");
          toast.error("Error al guardar los datos de autenticación");
          navigate("/login", { replace: true });
          return;
        }
        
        toast.success("Inicio de sesión exitoso");
        console.log("🚀 Redirigiendo a /dashboard...");
        // Esperar un momento adicional para asegurar que todo esté sincronizado
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate("/dashboard", { replace: true });
      } else {
        console.error("❌ Error al obtener usuario:", message);
        console.error("❌ Detalles del error:", {
          message,
          token: token ? "Presente" : "Ausente",
          url: window.location.href
        });
        
        // Mensaje más específico según el tipo de error
        let errorMessage = message || "Error al obtener los datos del usuario";
        if (message.includes("No autorizado") || message.includes("401")) {
          errorMessage = "El token de autenticación no es válido. Por favor, intenta iniciar sesión nuevamente.";
        } else if (message.includes("404")) {
          errorMessage = "Tu cuenta no está registrada en el sistema. Contacta al administrador.";
        }
        
        toast.error(errorMessage);
        
        // Limpiar el token inválido antes de redirigir
        useUserStore.getState().logout();
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("❌ Excepción al obtener el usuario:", error);
      console.error("❌ Detalles de la excepción:", {
        error,
        token: token ? "Presente" : "Ausente",
        url: window.location.href
      });
      toast.error("Error al obtener los datos del usuario. Por favor, intenta nuevamente.");
      
      // Limpiar el token antes de redirigir
      useUserStore.getState().logout();
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    console.log("========================================");
    console.log("AUTHCALLBACK PAGE - INICIANDO");
    console.log("========================================");
    console.log("URL completa:", window.location.href);
    console.log("Pathname:", window.location.pathname);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("========================================");
    
    // Intentar obtener el token con diferentes nombres que el backend podría usar
    const token = searchParams.get("token") || searchParams.get("access_token") || searchParams.get("accessToken");
    const userParam = searchParams.get("user") || searchParams.get("userData");
    const error = searchParams.get("error");

    console.log("Token recibido:", token ? "SÍ - " + token.substring(0, 20) + "..." : "NO");
    console.log("Usuario recibido:", userParam ? "SÍ" : "NO");
    console.log("Error recibido:", error || "NO");
    console.log("Todos los parámetros:", Object.fromEntries(searchParams.entries()));
    console.log("========================================");

    if (error) {
      console.error("❌ Error en callback:", error);
      const errorMessage = decodeURIComponent(error);
      
      // Mensajes específicos según el tipo de error
      let userFriendlyMessage = "Error al autenticar con Google";
      if (error === "user_not_found" || errorMessage === "user_not_found") {
        userFriendlyMessage = "Tu cuenta de Google no está registrada en el sistema. Por favor, contacta al administrador para registrarte.";
      } else if (error === "unauthorized" || errorMessage.includes("unauthorized")) {
        userFriendlyMessage = "No tienes autorización para acceder al sistema.";
      } else if (errorMessage) {
        userFriendlyMessage = `Error: ${errorMessage}`;
      }
      
      console.error("Mensaje de error:", userFriendlyMessage);
      toast.error(userFriendlyMessage);
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      console.log("✅ Procesando autenticación...");
      processAuth(token, userParam);
    } else {
      console.error("❌ No se recibió el token");
      console.error("Parámetros disponibles:", Object.fromEntries(searchParams.entries()));
      toast.error("No se recibió el token de autenticación. Verifica la configuración del backend.");
      navigate("/login", { replace: true });
    }
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
