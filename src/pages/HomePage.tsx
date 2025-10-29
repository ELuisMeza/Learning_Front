import { Typography, Paper, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido al Dashboard
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          mt: 2,
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Card 1</Typography>
          <Typography variant="body2" color="text.secondary">
            Contenido de ejemplo
          </Typography>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Card 2</Typography>
          <Typography variant="body2" color="text.secondary">
            Contenido de ejemplo
          </Typography>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Card 3</Typography>
          <Typography variant="body2" color="text.secondary">
            Contenido de ejemplo
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;

