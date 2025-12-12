import { Box, Container, Typography, Link, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const linkStyle = {
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "white",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 4,
          }}
        >
          {/* Sobre */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Prof. Jean Ribeiro
            </Typography>
            <Typography variant="body2">
              Mentoria educacional especializada em vestibulares do Paraná e
              ENEM.
            </Typography>
          </Box>

          {/* Links Rápidos */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Links Rápidos
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link sx={linkStyle} onClick={() => navigate("/sobre")}>
                Sobre
              </Link>
              <Link
                sx={linkStyle}
                onClick={() => navigate("/aulas-e-mentorias")}
              >
                Mentoria
              </Link>
              <Link sx={linkStyle} onClick={() => navigate("/vestibulares")}>
                Vestibulares
              </Link>
              <Link sx={linkStyle} onClick={() => navigate("/aprovacoes")}>
                Aprovações
              </Link>
            </Box>
          </Box>

          {/* Vestibulares */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Vestibulares
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                sx={linkStyle}
                onClick={() => navigate("/vestibulares/enem")}
              >
                ENEM
              </Link>
              <Link
                sx={linkStyle}
                onClick={() => navigate("/vestibulares/uem")}
              >
                UEM
              </Link>
              <Link
                sx={linkStyle}
                onClick={() => navigate("/vestibulares/uel")}
              >
                UEL
              </Link>
              <Link
                sx={linkStyle}
                onClick={() => navigate("/vestibulares/ufpr")}
              >
                UFPR
              </Link>
            </Box>
          </Box>

          {/* Contato */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contato
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <IconButton color="inherit" size="small" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" size="small" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" size="small" aria-label="YouTube">
                <YouTubeIcon />
              </IconButton>
              <IconButton color="inherit" size="small" aria-label="Email">
                <EmailIcon />
              </IconButton>
            </Box>
            <Typography variant="body2">
              contato@profjeanribeiro.com.br
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            mt: 4,
            pt: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Prof. Jean Ribeiro - Mentoria
            Educacional. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
