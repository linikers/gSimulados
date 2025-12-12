import { Card, CardContent, Typography, Box } from "@mui/material";
import { ReactNode } from "react";

interface InfoCardProps {
  titulo: string;
  descricao?: string;
  icone?: ReactNode;
  children?: ReactNode;
  cor?: string;
}

export function InfoCard({
  titulo,
  descricao,
  icone,
  children,
  cor = "primary.main",
}: InfoCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {icone && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
              color: cor,
            }}
          >
            {icone}
          </Box>
        )}

        <Typography
          variant="h6"
          component="h3"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          {titulo}
        </Typography>

        {descricao && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {descricao}
          </Typography>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
