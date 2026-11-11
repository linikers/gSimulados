import { Box, Button, Container, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Link as RouterLink } from "react-router-dom";

/** Fallback para rota inexistente: antes o React Router deixava a tela branca. */
export function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <SearchOffIcon sx={{ fontSize: 64 }} color="primary" />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Página não encontrada
        </Typography>
        <Typography color="text.secondary">
          O endereço que você abriu não existe ou mudou de lugar.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          disableElevation
          sx={{ mt: 1 }}
        >
          Voltar para a home
        </Button>
      </Box>
    </Container>
  );
}
