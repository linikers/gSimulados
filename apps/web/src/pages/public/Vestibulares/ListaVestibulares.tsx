import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  VestibularesService,
  type IVestibular,
} from "../../../services/vestibulares.service";
import { useToast } from "../../../store/useToast";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SchoolIcon from "@mui/icons-material/School";

export function ListaVestibulares() {
  const [vestibulares, setVestibulares] = useState<IVestibular[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadVestibulares();
  }, []);

  const loadVestibulares = async () => {
    try {
      const data = await VestibularesService.list();
      setVestibulares(data.filter((v) => v.ativo));
    } catch (error) {
      showToast(`Erro ao carregar vestibulares: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vestibulares Disponíveis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Confira os principais vestibulares e processos seletivos
      </Typography>

      {/* CSS Grid - Mais estável que MUI Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {vestibulares.map((vestibular) => (
          <Card
            key={vestibular._id}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SchoolIcon color="primary" />
                  <Typography variant="h6">{vestibular.nome}</Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {vestibular.nomeCompleto}
                </Typography>

                <Typography variant="body2">{vestibular.descricao}</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {vestibular.cidade && vestibular.estado && (
                    <Chip
                      label={`${vestibular.cidade}/${vestibular.estado}`}
                      size="small"
                      variant="outlined"
                    />
                  )}

                  {vestibular.regiao && (
                    <Chip
                      label={vestibular.regiao}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {vestibular.proximaProva?.data && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Próxima Prova:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(
                        vestibular.proximaProva.data
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                href={vestibular.siteOficial}
                target="_blank"
                startIcon={<OpenInNewIcon />}
              >
                Site Oficial
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {vestibulares.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Nenhum vestibular disponível no momento
          </Typography>
        </Box>
      )}
    </Box>
  );
}
