import { Box, CircularProgress } from "@mui/material";
import type { CircularProgressProps } from "@mui/material";

interface LoadingSpinnerProps extends CircularProgressProps {
  fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen, ...props }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 9999,
        }}
      >
        <CircularProgress {...props} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
      <CircularProgress {...props} />
    </Box>
  );
}
