import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import type { DialogProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps extends DialogProps {
  title?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({
  title,
  onClose,
  actions,
  children,
  ...props
}: ModalProps) {
  return (
    <Dialog onClose={onClose} {...props}>
      {title && (
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
