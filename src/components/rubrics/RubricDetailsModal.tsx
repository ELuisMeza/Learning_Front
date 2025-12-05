import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { rubricService } from "../../services/rubric.service";
import type { TypeRubricDetails } from "../../types/rubric.types";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  rubricId: string | null;
  onClose: () => void;
}

export const RubricDetailsModal = ({ open, rubricId, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [rubric, setRubric] = useState<TypeRubricDetails | null>(null);

  useEffect(() => {
    if (open && rubricId) {
      loadRubricDetails();
    } else {
      setRubric(null);
    }
  }, [open, rubricId]);

  const loadRubricDetails = async () => {
    if (!rubricId) return;

    setLoading(true);
    const { success, data, message } = await rubricService.getRubricById(
      rubricId
    );
    if (success && data) {
      setRubric(data);
    } else {
      toast.error(message || "Error al cargar los detalles de la rúbrica");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Detalles de la Rúbrica
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : rubric ? (
          <Box sx={{ mt: 2 }}>
            {/* Información básica */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {rubric.name}
              </Typography>
              {rubric.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {rubric.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                <Chip
                  label={`Creada: ${new Date(
                    rubric.created_at
                  ).toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Creador: ${rubric.user_creator.name}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Email: ${rubric.user_creator.email}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* Criterios y niveles */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Criterios de Evaluación ({rubric.criteria.length})
            </Typography>

            {rubric.criteria.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                Esta rúbrica no tiene criterios definidos.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {rubric.criteria.map((criterion, index) => (
                  <Paper key={criterion.id} sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {index + 1}. {criterion.name}
                        </Typography>
                        {criterion.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {criterion.description}
                          </Typography>
                        )}
                      </Box>
                      {(typeof criterion.weight === "number"
                        ? criterion.weight
                        : parseFloat(String(criterion.weight))) > 0 && (
                        <Chip
                          label={`Peso: ${criterion.weight}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {criterion.levels.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ mb: 1 }}
                        >
                          Niveles ({criterion.levels.length}):
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Nivel</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell align="right">Puntuación</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {criterion.levels.map((level) => (
                                <TableRow key={level.id}>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {level.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {level.description || "-"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={level.score}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No se pudieron cargar los detalles de la rúbrica.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
