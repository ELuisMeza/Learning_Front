export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'closed':
      return 'warning';
    case 'archived':
      return 'default';
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
    default:
      return status;
  }
};