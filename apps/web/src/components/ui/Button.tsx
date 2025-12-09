import { Button as MuiButton, CircularProgress } from "@mui/material";
import type { ButtonProps as MuiButtonProps } from "@mui/material";

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

export function Button({ children, loading, disabled, ...props }: ButtonProps) {
  return (
    <MuiButton disabled={disabled || loading} {...props}>
      {loading && <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />}
      {children}
    </MuiButton>
  );
}
