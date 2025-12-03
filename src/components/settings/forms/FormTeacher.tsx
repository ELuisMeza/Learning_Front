import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputAdornment,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  PersonPin as PersonPinIcon,
} from '@mui/icons-material';
import type { TypeCreateTeacher, TypeTeacher } from '../../../types/teachers.types';
import { TypeModality, TypeGender } from '../../../lib/globals';
import toast from 'react-hot-toast';
import { userService } from '../../../services/user.service';

interface Props {
  onClose: () => void;
  onSuccess?: (teacher: TypeTeacher) => void;
}

const schema: yup.ObjectSchema<TypeCreateTeacher> = yup.object({
  // Campos del profesor
  appellative: yup.string().required('El apellativo es obligatorio').max(150, 'Máximo 150 caracteres'),
  specialty: yup.string().max(100, 'Máximo 100 caracteres').optional(),
  academicDegree: yup.string().max(100, 'Máximo 100 caracteres').optional(),
  experienceYears: yup
    .number()
    .typeError('Debe ser un número')
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .integer('Debe ser un número entero')
    .optional(),
  bio: yup.string().optional(),
  cvUrl: yup.string().url('Debe ser una URL válida').max(255, 'Máximo 255 caracteres').optional(),
  TypeModality: yup
    .string()
    .oneOf([TypeModality.IN_PERSON, TypeModality.ONLINE, TypeModality.HYBRID], 'Modo de enseñanza inválido')
    .required('El modo de enseñanza es obligatorio'),
  
  // Campos del usuario
  documentType: yup.string().max(20, 'Máximo 20 caracteres').optional(),
  documentNumber: yup.string().max(20, 'Máximo 20 caracteres').optional(),
  email: yup.string().email('Debe ser un email válido').required('El email es obligatorio').max(150, 'Máximo 150 caracteres'),
  password: yup.string().required('La contraseña es obligatoria').max(255, 'Máximo 255 caracteres'),
  roleId: yup.string().uuid('Debe ser un UUID válido').required('El rol es obligatorio'),
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  lastNameFather: yup.string().required('El apellido paterno es obligatorio').max(100, 'Máximo 100 caracteres'),
  lastNameMother: yup.string().max(100, 'Máximo 100 caracteres').optional(),
  gender: yup
    .string()
    .oneOf([TypeGender.MALE, TypeGender.FEMALE, TypeGender.OTHER], 'Género inválido')
    .required('El género es obligatorio'),
  birthdate: yup.string().required('La fecha de nacimiento es obligatoria'),
  phone: yup.string().max(20, 'Máximo 20 caracteres').optional(),
});

export const FormTeacher = ({ onClose, onSuccess }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TypeCreateTeacher>({
    resolver: yupResolver(schema),
    defaultValues: {
      // Campos del profesor
      appellative: '',
      specialty: '',
      academicDegree: '',
      experienceYears: undefined,
      bio: '',
      cvUrl: '',
      TypeModality: TypeModality.IN_PERSON,
      
      // Campos del usuario
      documentType: '',
      documentNumber: '',
      email: '',
      password: '',
      roleId: '',
      name: '',
      lastNameFather: '',
      lastNameMother: '',
      gender: TypeGender.MALE,
      birthdate: '',
      phone: '',
    },
  });

  const onSubmit = async (data: TypeCreateTeacher) => {
    try {
      const { success, data: createdTeacher, message } = await userService.createTeacher(data);
      if (success && createdTeacher) {
        toast.success(message);
        onSuccess?.(createdTeacher);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Error al crear el profesor');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} paddingTop={2}>
        {/* Información Personal del Usuario */}
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
                  <MenuItem value={TypeGender.OTHER}>Otro</MenuItem>
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
              <TextField
                {...field}
                label="Tipo de Documento"
                placeholder="Ej: DNI"
                fullWidth
                variant="outlined"
                error={!!errors.documentType}
                helperText={errors.documentType?.message}
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
                type="email"
                placeholder="Ej: juan.perez@example.com"
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
                placeholder="Ej: SuperSegura123"
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

        {/* Rol */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="ID del Rol"
                placeholder="Ej: f5f8b4f0-3f07-4c0f-8a0a-4b4a5b7a9a1c"
                fullWidth
                variant="outlined"
                error={!!errors.roleId}
                helperText={errors.roleId?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonPinIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Información del Profesor */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ typography: 'h6', mb: 2, mt: 2, fontWeight: 'bold' }}>Información del Profesor</Box>
        </Grid>

        {/* Nombre Completo (Appellative) */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="appellative"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellativo"
                placeholder="Ej: Dr. Juan Pérez González"
                fullWidth
                variant="outlined"
                error={!!errors.appellative}
                helperText={errors.appellative?.message}
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

        {/* Especialidad */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="specialty"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Especialidad"
                placeholder="Ej: Ingeniería de Software"
                fullWidth
                variant="outlined"
                error={!!errors.specialty}
                helperText={errors.specialty?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Grado Académico */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="academicDegree"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Grado Académico"
                placeholder="Ej: Magíster en Ingeniería de Software"
                fullWidth
                variant="outlined"
                error={!!errors.academicDegree}
                helperText={errors.academicDegree?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Años de Experiencia */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="experienceYears"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Años de Experiencia"
                type="number"
                placeholder="Ej: 5"
                fullWidth
                variant="outlined"
                error={!!errors.experienceYears}
                helperText={errors.experienceYears?.message}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Modo de Enseñanza */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="TypeModality"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.TypeModality}>
                <InputLabel>Modo de Enseñanza</InputLabel>
                <Select
                  {...field}
                  label="Modo de Enseñanza"
                  error={!!errors.TypeModality}
                >
                  <MenuItem value={TypeModality.IN_PERSON}>Presencial</MenuItem>
                  <MenuItem value={TypeModality.ONLINE}>En línea</MenuItem>
                  <MenuItem value={TypeModality.HYBRID}>Híbrido</MenuItem>
                </Select>
                {errors.TypeModality && (
                  <Box component="span" sx={{ fontSize: '0.75rem', color: 'error.main', mt: 0.5, ml: 1.75 }}>
                    {errors.TypeModality.message}
                  </Box>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Biografía */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Biografía"
                placeholder="Ej: Docente apasionado por la enseñanza de nuevas tecnologías."
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                error={!!errors.bio}
                helperText={errors.bio?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* URL del CV */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="cvUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="URL del CV"
                placeholder="Ej: https://example.com/cv/juan-perez.pdf"
                fullWidth
                variant="outlined"
                error={!!errors.cvUrl}
                helperText={errors.cvUrl?.message || 'URL completa del curriculum vitae'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FileIcon color="action" />
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
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
};
