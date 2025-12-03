import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import type { TypeUserCreate, TypeUser } from '../../../types/user.types';
import { userService } from '../../../services/user.service';
import toast from 'react-hot-toast';
import { TypeDocumentType, TypeGender } from '../../../lib/globals';

interface Props {
  onClose: () => void;
  onSuccess?: (user: TypeUser) => void;
}


const schema: yup.ObjectSchema<TypeUserCreate> = yup.object({
  name: yup.string().required('El nombre es obligatorio'),
  lastNameFather: yup.string().required('El apellido paterno es obligatorio'),
  lastNameMother: yup.string().optional(),
  email: yup
    .string()
    .email('El email no es válido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  documentType: yup.string().optional(),
  documentNumber: yup.string().optional(),
  gender: yup
    .string()
    .required('El género es obligatorio'),
  birthdate: yup.string().required('La fecha de nacimiento es obligatoria'),
  phone: yup.string().optional(),
}) as yup.ObjectSchema<TypeUserCreate>;

export const FormUsers = ({ onClose, onSuccess }: Props) => {

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TypeUserCreate>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      lastNameFather: '',
      lastNameMother: '',
      email: '',
      password: '',
      documentType: '',
      documentNumber: '',
      gender: TypeGender.MALE,
      birthdate: '',
      phone: '',
    },
  });

  const onSubmit = async (data: TypeUserCreate) => {
    try {
      // Limpiar campos opcionales vacíos
      const cleanData: TypeUserCreate = {
        ...data,
        documentType: data.documentType || undefined,
        documentNumber: data.documentNumber || undefined,
        lastNameMother: data.lastNameMother || undefined,
        phone: data.phone || undefined,
      };

      const { success, data: createdUser, message } = await userService.createUser(cleanData);
      if (success && createdUser) {
        toast.success(message);
        onSuccess?.(createdUser);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear el usuario');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [TypeDocumentType.DNI]: 'DNI',
      [TypeDocumentType.CE]: 'Carnet de Extranjería',
      [TypeDocumentType.PASSPORT]: 'Pasaporte',
    };
    return labels[type] || type;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Información Personal */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ typography: 'h6', mb: 2, fontWeight: 'bold' }}>Información Personal</Box>
        </Grid>

        {/* Nombre */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="Nombre"
                placeholder="Ej: Juan"
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Apellido Paterno */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="lastNameFather"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido Paterno"
                placeholder="Ej: Pérez"
                fullWidth
                variant="outlined"
                error={!!errors.lastNameFather}
                helperText={errors.lastNameFather?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Apellido Materno */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="lastNameMother"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido Materno"
                placeholder="Ej: García"
                fullWidth
                variant="outlined"
                error={!!errors.lastNameMother}
                helperText={errors.lastNameMother?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Género */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Género</InputLabel>
                <Select {...field} label="Género">
                  <MenuItem value={TypeGender.MALE}>Masculino</MenuItem>
                  <MenuItem value={TypeGender.FEMALE}>Femenino</MenuItem>
                </Select>
                {errors.gender && (
                  <Box component="span" sx={{ fontSize: '0.75rem', color: 'error.main', mt: 0.5, ml: 1.75 }}>
                    {errors.gender.message}
                  </Box>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Fecha de Nacimiento */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="birthdate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de Nacimiento"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!errors.birthdate}
                helperText={errors.birthdate?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Teléfono */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Teléfono"
                placeholder="Ej: +51 987654321"
                fullWidth
                variant="outlined"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Información de Identificación */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ typography: 'h6', mb: 2, mt: 2, fontWeight: 'bold' }}>Información de Identificación</Box>
        </Grid>

        {/* Tipo de Documento */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="documentType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  {...field}
                  label="Tipo de Documento"
                  value={field.value || ''}
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {Object.values(TypeDocumentType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {/* Número de Documento */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="documentNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Número de Documento"
                placeholder="Ej: 12345678"
                fullWidth
                variant="outlined"
                error={!!errors.documentNumber}
                helperText={errors.documentNumber?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Información de Cuenta */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ typography: 'h6', mb: 2, mt: 2, fontWeight: 'bold' }}>Información de Cuenta</Box>
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                placeholder="Ej: juan.perez@example.com"
                type="email"
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Contraseña */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contraseña"
                type="password"
                fullWidth
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Botones */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting} variant="outlined">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </Box>
    </Box>
  );
};
