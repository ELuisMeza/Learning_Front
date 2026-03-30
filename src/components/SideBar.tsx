import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  InputBase,
  Avatar,
  Badge,
  Paper,
  Popper,
  ClickAwayListener,
  ListItemAvatar,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClassIcon from '@mui/icons-material/Class';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getMenuItemsByRole } from '../lib/menuItems';
import { useUserStore } from '../stores/user.store';
import type { TypeMenuItem } from '../types/utils.types';
import { classService } from '../services/class.service';
import { evaluationService } from '../services/evaluation.service';
import type { TypeClass } from '../types/class.types';
import type { TypeEvaluation } from '../types/evaluation.types';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const drawerWidth = 240;
/** Rail solo iconos en viewports estrechos (ahorra espacio horizontal) */
const drawerWidthCompact = 64;

const SideBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);

  const effectiveDrawerWidth = open ? (isMobile ? drawerWidthCompact : drawerWidth) : 0;
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);
  
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    classes: TypeClass[];
    evaluations: TypeEvaluation[];
  }>({ classes: [], evaluations: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPopperRef = useRef<HTMLDivElement>(null);
  
  // Debounce para la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Obtener items del menú según el rol del usuario
  const menuItems = getMenuItemsByRole(user?.role?.name);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para realizar búsqueda
  useEffect(() => {
    const performSearch = async () => {
      // Si la búsqueda está vacía o tiene menos de 2 caracteres, ocultar resultados
      if (!debouncedSearchQuery || !debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2) {
        setSearchResults({ classes: [], evaluations: [] });
        setSearchOpen(false);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      setSearchOpen(true);

      try {
        const userRole = user?.role?.name?.toLowerCase() || '';
        const query = debouncedSearchQuery.toLowerCase().trim();
        
        if (!userRole) {
          setSearchResults({ classes: [], evaluations: [] });
          setSearchLoading(false);
          return;
        }

        if (userRole === 'estudiante' || userRole === 'student') {
          // Buscar en clases y evaluaciones del estudiante
          const [classesData, evaluationsData] = await Promise.all([
            classService.getMyClasses().catch(() => []),
            evaluationService.getMyEvaluations().catch(() => []),
          ]);

          const filteredClasses = classesData.filter(
            (cls) =>
              cls.name?.toLowerCase().includes(query) ||
              cls.code?.toLowerCase().includes(query) ||
              cls.description?.toLowerCase().includes(query)
          );

          // Filtrar evaluaciones: mostrar todas las que coincidan con la búsqueda
          // La validación de acceso se hará cuando se haga clic en el resultado
          const filteredEvaluations = evaluationsData.filter((evaluation) => {
            // Solo verificar que coincida con la búsqueda
            return (
              evaluation.name?.toLowerCase().includes(query) ||
              evaluation.description?.toLowerCase().includes(query) ||
              evaluation.class?.name?.toLowerCase().includes(query)
            );
          });

          setSearchResults({
            classes: filteredClasses.slice(0, 5), // Limitar a 5 resultados
            evaluations: filteredEvaluations.slice(0, 5),
          });
        } else if (userRole === 'docente' || userRole === 'teacher') {
          // Buscar en clases y evaluaciones del docente
          const [classesResponse, evaluationsResponse] = await Promise.all([
            classService.getClassesByTeacher({ page: 1, limit: 100, search: query }).catch(() => ({ success: false, data: undefined })),
            evaluationService.getMyEvaluationsTeacher({ page: 1, limit: 100, search: query }).catch(() => ({ success: false, data: undefined })),
          ]);

          // Mapear clases del docente a TypeClass
          const classes: TypeClass[] = classesResponse.success && classesResponse.data?.data
            ? classesResponse.data.data.map((cls: any) => ({
                id: cls.id,
                name: cls.name,
                code: cls.code || '',
                description: cls.description || '',
                qrCode: cls.qrCode || '',
                teacherId: cls.teacherId || '',
                moduleId: cls.moduleId || '',
                status: cls.status || 'active',
                maxStudents: cls.maxStudents || 0,
                createdAt: cls.createdAt || new Date().toISOString(),
                updatedAt: cls.updatedAt || new Date().toISOString(),
              }))
            : [];

          // Mapear evaluaciones del docente a TypeEvaluation
          const evaluations: TypeEvaluation[] = evaluationsResponse.success && evaluationsResponse.data?.data
            ? evaluationsResponse.data.data.map((evalItem: any) => ({
                id: evalItem.id,
                rubricId: evalItem.rubricId,
                classId: evalItem.classId,
                name: evalItem.name,
                description: evalItem.description || '',
                type: evalItem.evaluationMode === 'teacher' ? 'individual' : 
                      evalItem.evaluationMode === 'self' ? 'self' : 
                      evalItem.evaluationMode === 'peer' ? 'peer' : 'group',
                status: evalItem.status || 'draft',
                startDate: evalItem.startDate,
                endDate: evalItem.endDate,
                createdAt: evalItem.createdAt || new Date().toISOString(),
                updatedAt: evalItem.updatedAt || new Date().toISOString(),
                evaluationMode: evalItem.evaluationMode,
                evaluationTypeId: evalItem.evaluationTypeId,
                evaluationTypeName: evalItem.evaluationTypeName,
              }))
            : [];

          setSearchResults({
            classes: classes.slice(0, 5),
            evaluations: evaluations.slice(0, 5),
          });
        } else {
          setSearchResults({ classes: [], evaluations: [] });
        }
      } catch (error) {
        console.error('Error al buscar:', error);
        setSearchResults({ classes: [], evaluations: [] });
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, user?.role?.name]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchResultClick = async (type: 'class' | 'evaluation', id: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    
    if (type === 'class') {
      const userRole = user?.role?.name?.toLowerCase() || '';
      if (userRole === 'estudiante' || userRole === 'student') {
        navigate('/dashboard/my-classes');
      } else {
        navigate(`/dashboard/classes/${id}`);
      }
    } else {
      // Para evaluaciones, verificar que esté disponible antes de navegar
      const userRole = user?.role?.name?.toLowerCase() || '';
      
      if (userRole === 'estudiante' || userRole === 'student') {
        try {
          // Primero obtener las evaluaciones del estudiante para verificar el estado de completado
          const myEvaluations = await evaluationService.getMyEvaluations();
          const myEvaluation = myEvaluations.find(e => e.id === id);
          
          // Si no se encuentra en las evaluaciones del estudiante, no permitir acceso
          if (!myEvaluation) {
            toast.error('No tienes acceso a esta evaluación');
            navigate('/dashboard/my-evaluations');
            return;
          }
          
          // Si ya está completada, redirigir directamente a resultados
          if (myEvaluation.completed === true) {
            toast.error('Ya has completado esta evaluación');
            navigate(`/dashboard/evaluation/${id}/results`);
            return;
          }
          
          // Obtener detalles completos de la evaluación
          const evaluation = await evaluationService.getEvaluationById(id);
          
          // Validar que la evaluación esté disponible
          const now = new Date();
          const startDate = new Date(evaluation.startDate);
          const endDate = new Date(evaluation.endDate);
          
          // Si no está activa, redirigir a mis evaluaciones
          if (evaluation.status !== 'active') {
            toast.error('Esta evaluación no está activa');
            navigate('/dashboard/my-evaluations');
            return;
          }
          
          // Si aún no ha iniciado, mostrar error y no navegar
          if (now < startDate) {
            toast.error('Esta evaluación aún no ha iniciado');
            return;
          }
          
          // Si ya terminó, mostrar error y redirigir
          if (now > endDate) {
            toast.error('Esta evaluación ya ha finalizado');
            navigate('/dashboard/my-evaluations');
            return;
          }
          
          // Si pasa todas las validaciones, navegar al formulario
          navigate(`/dashboard/evaluation/${id}`);
        } catch (error) {
          console.error('Error al verificar evaluación:', error);
          toast.error('Error al cargar la evaluación');
        }
      } else {
        // Para docentes, siempre permitir navegar (pueden ver resultados)
        navigate(`/dashboard/evaluation/${id}/results`);
      }
    }
  };

  const handleClickAway = () => {
    setSearchOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: open ? `calc(100% - ${effectiveDrawerWidth}px)` : '100%',
          ml: open ? `${effectiveDrawerWidth}px` : 0,
          backgroundColor: '#ffffff',
          color: 'text.primary',
          borderBottom: '1px solid #e0e0e0',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 600 }}>
            <IconButton
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2, color: 'text.primary' }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Box
              ref={searchPopperRef}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                flex: 1,
                maxWidth: 500,
                position: 'relative',
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                inputRef={searchInputRef}
                placeholder="Buscar clases, evaluaciones..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (debouncedSearchQuery.length >= 2 && (searchResults.classes.length > 0 || searchResults.evaluations.length > 0 || searchLoading)) {
                    setSearchOpen(true);
                  }
                }}
                sx={{ flex: 1, fontSize: '0.9rem' }}
              />
              
              {/* Popper para mostrar resultados */}
              <Popper
                open={searchOpen && debouncedSearchQuery.length >= 2}
                anchorEl={searchInputRef.current}
                placement="bottom-start"
                sx={{ zIndex: 1300, width: searchInputRef.current?.offsetWidth || 500, mt: 1 }}
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8],
                    },
                  },
                ]}
              >
                <ClickAwayListener onClickAway={handleClickAway}>
                  <Paper
                    elevation={4}
                    sx={{
                      maxHeight: 400,
                      overflow: 'auto',
                      width: '100%',
                    }}
                  >
                    {searchLoading ? (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Buscando...
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {searchResults.classes.length > 0 && (
                          <>
                            <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.100' }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                CLASES
                              </Typography>
                            </Box>
                            <List dense>
                              {searchResults.classes.map((cls) => (
                                <ListItem
                                  key={cls.id}
                                  disablePadding
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => handleSearchResultClick('class', cls.id)}
                                >
                                  <ListItemButton>
                                    <ListItemAvatar>
                                      <ClassIcon color="primary" />
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={cls.name}
                                      secondary={cls.code || cls.description}
                                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}
                        {searchResults.evaluations.length > 0 && (
                          <>
                            <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.100' }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                EVALUACIONES
                              </Typography>
                            </Box>
                            <List dense>
                              {searchResults.evaluations.map((evaluation) => (
                                <ListItem
                                  key={evaluation.id}
                                  disablePadding
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => handleSearchResultClick('evaluation', evaluation.id)}
                                >
                                  <ListItemButton>
                                    <ListItemAvatar>
                                      <AssessmentIcon color="success" />
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={evaluation.name}
                                      secondary={evaluation.class?.name || evaluation.description}
                                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}
                        {!searchLoading &&
                          searchResults.classes.length === 0 &&
                          searchResults.evaluations.length === 0 &&
                          debouncedSearchQuery.length >= 2 && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                No se encontraron resultados
                              </Typography>
                            </Box>
                          )}
                      </>
                    )}
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: 'primary.main',
                  fontSize: '0.9rem',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                {user?.name || 'Usuario'}
              </Typography>
            </Box>
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                ml: 2,
                color: 'text.primary',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: effectiveDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: effectiveDrawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            ...(!open ? { overflowX: 'hidden', width: 0 } : {}),
          },
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
        open={open}
      >
        {/* Logo y Header del Sidebar */}
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? (isMobile ? 'center' : 'flex-start') : 'center',
            px: isMobile ? 0.5 : 2,
            minHeight: isMobile ? '64px !important' : '80px !important',
          }}
        >
          {open && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  borderRadius: 1,
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                }}
              >
                L
              </Box>
              {!isMobile && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                    Learning
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {user?.role?.name || 'Usuario'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          {!open && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
        
        {open && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1, display: { xs: 'none', md: 'block' } }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>
                MENÚ PRINCIPAL
              </Typography>
            </Box>
            <List sx={{ px: isMobile ? 0.5 : 1 }}>
              {menuItems.map((item: TypeMenuItem) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip title={isMobile ? item.text : ''} placement="right" disableHoverListener={!isMobile}>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        px: isMobile ? 1 : 2,
                        minHeight: isMobile ? 48 : undefined,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: isMobile ? 0 : 40,
                          justifyContent: 'center',
                          color: location.pathname === item.path ? 'white' : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!isMobile && (
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: location.pathname === item.path ? 600 : 400,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: open ? `calc(100% - ${effectiveDrawerWidth}px)` : '100%',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default SideBar;

