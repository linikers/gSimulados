import { Snackbar, Alert } from "@mui/material";
import { useToast } from "../../store/useToast";

export function GlobalSnackbar() {
  const { open, message, severity, hideToast } = useToast();

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    hideToast();
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
