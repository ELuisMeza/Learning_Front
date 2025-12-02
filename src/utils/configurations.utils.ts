export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'closed':
      return 'warning';
    case 'archived':
      return 'default';
    case 'inactive':
      return 'error';
    case 'completed':
      return 'info';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'closed':
      return 'Cerrado';
    case 'archived':
      return 'Archivado';
    case 'inactive':
      return 'Inactivo';
    case 'completed':
      return 'Completado';
    default:
      return status;
  }
};