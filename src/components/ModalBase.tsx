import { Dialog, DialogTitle, DialogContent } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const ModalBase = ({ open, onClose, title, size = 'sm', children }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={size}
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  );
};
