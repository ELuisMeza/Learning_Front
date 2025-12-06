import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useGetRubrics } from '../hooks/useGetRubrics';
import { FormCreateRubric } from '../components/rubrics/FormCreateRubric';
import { RubricDetailsModal } from '../components/rubrics/RubricDetailsModal';
import { FormUploadRubricExcel } from '../components/rubrics/FormUploadRubricExcel';

const RubricsPage = () => {
  const { rubrics, loading, refetch } = useGetRubrics();
  const [openDialog, setOpenDialog] = useState(false);
  const [openExcelDialog, setOpenExcelDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedRubricId, setSelectedRubricId] = useState<string | null>(null);


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Rúbricas</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenExcelDialog(true)}
          >
            Subir Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nueva Rúbrica
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Criterios</TableCell>
              <TableCell>Fecha de Creación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : rubrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay rúbricas creadas. Crea tu primera rúbrica o sube un archivo Excel.
                </TableCell>
              </TableRow>
            ) : (
              rubrics.map((rubric) => (
                <TableRow 
                  key={rubric.id}
                  onClick={() => {
                    setSelectedRubricId(rubric.id);
                    setOpenDetailsModal(true);
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <TableCell>{rubric.name}</TableCell>
                  <TableCell>{rubric.description || '-'}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    {/* La cantidad de criterios se mostrará cuando el backend lo proporcione */}
                    {rubric.criteriaCount ?? '-'}
                  </TableCell>
                  <TableCell>{new Date(rubric.createdat).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openDialog && (
        <FormCreateRubric 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          onSuccess={() => {
            setOpenDialog(false);
            refetch();
          }} 
        />
      )}

      <RubricDetailsModal
        open={openDetailsModal}
        rubricId={selectedRubricId}
        onClose={() => {
          setOpenDetailsModal(false);
          setSelectedRubricId(null);
        }}
      />

      <FormUploadRubricExcel
        open={openExcelDialog}
        onClose={() => setOpenExcelDialog(false)}
        onSuccess={() => {
          setOpenExcelDialog(false);
          refetch();
        }}
      />
    </Box>
  );
};

export default RubricsPage;

