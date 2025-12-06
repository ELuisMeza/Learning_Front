import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CloseIcon from '@mui/icons-material/Close';
import { classService } from '../services/class.service';
import { evaluationService } from '../services/evaluation.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ScanQRPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const navigate = useNavigate();
  const scannerRef = useRef<HTMLDivElement>(null);
  const qrCodeScannerRef = useRef<any>(null);
  const scanningRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Función para detectar si es un UUID (evaluación) o código de clase
  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const processScannedCode = async (scannedCode: string) => {
    if (!scannedCode || loading) return;

    try {
      setLoading(true);
      stopScanning();

      const trimmedCode = scannedCode.trim();
      
      // Detectar si es un UUID (evaluación) o código de clase
      if (isUUID(trimmedCode)) {
        // Es una evaluación (UUID)
        try {
          const evaluation = await evaluationService.getEvaluationById(trimmedCode);
          
          // Verificar que la evaluación esté activa
          const now = new Date();
          const startDate = new Date(evaluation.startDate);
          const endDate = new Date(evaluation.endDate);
          
          if (evaluation.status !== 'active' || now < startDate || now > endDate) {
            toast.error('Esta evaluación no está disponible en este momento');
            return;
          }

          // Redirigir directamente a la evaluación
          toast.success(`Accediendo a la evaluación: ${evaluation.name}`);
          navigate(`/dashboard/evaluation/${evaluation.id}`);
        } catch (error: any) {
          // Si no es una evaluación válida, intentar como clase
          const classData = await classService.getClassByCode(trimmedCode);
          await classService.enrollStudent(classData.id);
          toast.success(`Te has inscrito exitosamente a la clase: ${classData.name}`);
          navigate('/dashboard/my-classes');
        }
      } else {
        // Es un código de clase
        const classData = await classService.getClassByCode(trimmedCode);
        await classService.enrollStudent(classData.id);
        toast.success(`Te has inscrito exitosamente a la clase: ${classData.name}`);
        navigate('/dashboard/my-classes');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al procesar el código';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCode = async () => {
    if (!code.trim()) {
      toast.error('Ingresa un código');
      return;
    }

    await processScannedCode(code.trim());
  };

  useEffect(() => {
    // Limpiar recursos cuando el componente se desmonte
    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = async () => {
    scanningRef.current = false;
    
    if (qrCodeScannerRef.current) {
      // Si es un MediaStream (API nativa)
      if (qrCodeScannerRef.current instanceof MediaStream) {
        qrCodeScannerRef.current.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      } 
      // Si es Html5Qrcode (librería CDN)
      else if (qrCodeScannerRef.current.stop) {
        try {
          await qrCodeScannerRef.current.stop();
          await qrCodeScannerRef.current.clear();
        } catch (error) {
          // Ignorar errores al detener
        }
      }
      qrCodeScannerRef.current = null;
    }
    
    // Limpiar el video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    
    // Limpiar el contenido del contenedor
    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
    }
    
    setScanning(false);
    setCameraError(null);
  };

  const processQRCode = async (qrCode: string) => {
    await processScannedCode(qrCode);
  };

  const loadQRScannerFromCDN = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Html5Qrcode) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar la librería de escaneo QR'));
      document.head.appendChild(script);
    });
  };

  const startQRScanner = () => {
    if (!scannerRef.current) return;

    const Html5Qrcode = (window as any).Html5Qrcode;
    const html5QrCode = new Html5Qrcode(scannerRef.current.id);

    html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText: string) => {
        processQRCode(decodedText);
      },
      (_errorMessage: string) => {
        // Ignorar errores de escaneo continuo
      }
    ).catch((err: Error) => {
      setCameraError('Error al iniciar el escáner: ' + err.message);
      toast.error('Error al iniciar el escáner');
      setScanning(false);
    });

    qrCodeScannerRef.current = html5QrCode;
  };

  const handleCameraScan = async () => {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      toast.error('Tu navegador no soporta el acceso a la cámara');
      return;
    }

    try {
      setScanning(true);
      scanningRef.current = true;
      setCameraError(null);

      // Intentar usar la API BarcodeDetector nativa (Chrome/Edge)
      const hasBarcodeDetector = 'BarcodeDetector' in window;
      
      if (hasBarcodeDetector) {
        // Usar API nativa BarcodeDetector
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Cámara trasera en móviles
        });
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.style.width = '100%';
        video.style.height = 'auto';
        
        if (scannerRef.current) {
          scannerRef.current.innerHTML = '';
          scannerRef.current.appendChild(video);
        }

        await video.play();
        qrCodeScannerRef.current = stream;
        videoRef.current = video;

        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        });

        const scanFrame = async () => {
          if (!scanningRef.current || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
            if (scanningRef.current) {
              requestAnimationFrame(scanFrame);
            }
            return;
          }

          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              processQRCode(barcodes[0].rawValue);
              return;
            }
          } catch (err) {
            // Continuar escaneando
          }

          if (scanningRef.current) {
            requestAnimationFrame(scanFrame);
          }
        };

        scanFrame();
      } else {
        // Fallback: Cargar librería desde CDN
        await loadQRScannerFromCDN();
        startQRScanner();
      }
    } catch (error: any) {
      setScanning(false);
      scanningRef.current = false;
      if (error.name === 'NotAllowedError') {
        setCameraError('Permisos de cámara denegados. Por favor, permite el acceso a la cámara.');
        toast.error('Permisos de cámara denegados');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No se encontró ninguna cámara en tu dispositivo.');
        toast.error('No se encontró ninguna cámara');
      } else {
        setCameraError('Error al acceder a la cámara: ' + error.message);
        toast.error('Error al acceder a la cámara');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Escanear Código QR
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Escanea el código QR de una clase para inscribirte o de una evaluación para acceder directamente
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Opción 1: Escanear con cámara */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <QrCodeScannerIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            <Typography variant="h6">Escanear Código QR</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Usa la cámara de tu dispositivo para escanear el código QR de una clase o evaluación
            </Typography>
            <Button
              variant="contained"
              onClick={handleCameraScan}
              disabled={loading || scanning}
              fullWidth
            >
              {scanning ? 'Escaneando...' : 'Abrir Cámara'}
            </Button>
            {cameraError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {cameraError}
              </Alert>
            )}
          </Box>
        </Paper>

        {/* Dialog para el escáner */}
        <Dialog
          open={scanning}
          onClose={stopScanning}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Escanear Código QR</Typography>
              <IconButton onClick={stopScanning}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              id="qr-scanner"
              ref={scannerRef}
              sx={{
                width: '100%',
                minHeight: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            />
            {cameraError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {cameraError}
              </Alert>
            )}
            <Button
              variant="outlined"
              onClick={stopScanning}
              fullWidth
              sx={{ mt: 2 }}
            >
              Cerrar Cámara
            </Button>
          </DialogContent>
        </Dialog>

        {/* Opción 2: Entrada manual */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Ingresar Código Manualmente</Typography>
            <Typography variant="body2" color="text.secondary">
              Si tienes el código de la clase o el ID de la evaluación, ingrésalo aquí
            </Typography>
            <TextField
              label="Código o ID"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: ABC123 o ID de evaluación"
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

