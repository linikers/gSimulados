import { Box, Container, Typography, Button } from "@mui/material";
import type { ReactNode } from "react";

interface HeroProps {
  titulo: string;
  subtitulo?: string;
  imagemFundo?: string;
  altura?: string;
  children?: ReactNode;
  ctaTexto?: string;
  ctaOnClick?: () => void;
}

export function Hero({
  titulo,
  subtitulo,
  imagemFundo,
  altura = "400px",
  children,
  ctaTexto,
  ctaOnClick,
}: HeroProps) {
  return (
    <Box
      sx={{
        position: "relative",
        height: {
          xs: "250px",
          sm: "300px",
          md: altura,
        },
        backgroundImage: imagemFundo
          ? `url(${imagemFundo})`
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        color: "white",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Typography
          variant="h2"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
              md: "3.75rem",
            },
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {titulo}
        </Typography>

        {subtitulo && (
          <Typography
            variant="h5"
            sx={{
              mb: ctaTexto ? 3 : 0,
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
                md: "1.5rem",
              },
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {subtitulo}
          </Typography>
        )}

        {ctaTexto && ctaOnClick && (
          <Button
            variant="contained"
            size="large"
            onClick={ctaOnClick}
            sx={{
              backgroundColor: "white",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
              minHeight: 48,
              px: 4,
            }}
          >
            {ctaTexto}
          </Button>
        )}

        {children}
      </Container>
    </Box>
  );
}
