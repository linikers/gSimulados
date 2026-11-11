import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AutoAwesome, EmojiEventsOutlined } from "@mui/icons-material";
import { SimuladoService } from "../../../services/simulado.service";
import type { IDesempenho } from "../../../types/simulado";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

const corDoPercentual = (percentual: number) => {
  if (percentual >= 70) return "success.main";
  if (percentual >= 50) return "warning.main";
  return "error.main";
};

const corDoChip = (percentual: number) => {
  if (percentual >= 70) return "success" as const;
  if (percentual >= 50) return "warning" as const;
  return "error" as const;
};

const formatarData = (data: string) =>
  new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Desempenho() {
  const [dados, setDados] = useState<IDesempenho | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  const carregar = useCallback(async () => {
    try {
      setDados(await SimuladoService.desempenho());
    } catch (error) {
      handleError(error, "Erro ao carregar seu desempenho.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  const totais = dados?.totais;
  const semDados = !totais || totais.simulados === 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Meu Desempenho
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Seus simulados finalizados, evolução e pontos fracos por matéria.
      </Typography>

      {semDados ? (
        <Paper elevation={0} className="glass-container" sx={{ p: 6, textAlign: "center" }}>
          <EmojiEventsOutlined sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Você ainda não finalizou um simulado
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Gere seu primeiro simulado e, ao finalizar, seus números aparecem aqui.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => navigate("/aluno/simulados/gerar")}
          >
            Gerar simulado
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {[
              { rotulo: "Simulados", valor: String(totais.simulados), dica: "finalizados" },
              { rotulo: "Questões", valor: String(totais.questoes), dica: "respondidas" },
              {
                rotulo: "Acerto geral",
                valor: `${totais.percentual}%`,
                dica: `${totais.acertos} de ${totais.questoes}`,
              },
            ].map((kpi) => (
              <Grid size={{ xs: 6, md: 3 }} key={kpi.rotulo}>
                <Paper elevation={0} className="glass-container" sx={{ p: 2.5, height: "100%" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: ".04em" }}>
                    {kpi.rotulo}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {kpi.valor}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.dica}
                  </Typography>
                </Paper>
              </Grid>
            ))}
            <Grid size={{ xs: 6, md: 3 }}>
              <Paper elevation={0} className="glass-container" sx={{ p: 2.5, height: "100%" }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: ".04em" }}>
                  Ponto fraco
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: corDoPercentual(dados.porMateria[0]?.percentual ?? 0) }}>
                  {dados.porMateria[0]?.percentual ?? 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dados.porMateria[0]?.materia ?? "—"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={0} className="glass-container" sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={700}>
                  Evolução
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Acerto por simulado — últimos {dados.evolucao.length}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: { xs: 1, md: 2 }, height: 170, pt: 1 }}>
                  {dados.evolucao.map((item) => (
                    <Box
                      key={`${item.simuladoId}-${item.data}`}
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        height: "100%",
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5 }}>
                        {item.percentual}%
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: 44,
                          height: `${Math.max((item.percentual / 100) * 120, 4)}px`,
                          bgcolor: corDoPercentual(item.percentual),
                          borderRadius: "6px 6px 0 0",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "nowrap" }}>
                        {new Date(item.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                  {[
                    { cor: "error.main", texto: "até 49%" },
                    { cor: "warning.main", texto: "50–69%" },
                    { cor: "success.main", texto: "70%+" },
                  ].map((l) => (
                    <Box key={l.texto} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: l.cor }} />
                      <Typography variant="caption" color="text.secondary">
                        {l.texto}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} className="glass-container" sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={700}>
                  Acerto por matéria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Onde você ganha e onde perde pontos
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dados.porMateria.map((m) => (
                    <Box key={m.materia}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {m.materia}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={corDoPercentual(m.percentual)}>
                          {m.percentual}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={m.percentual}
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          bgcolor: "grey.100",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                            bgcolor: corDoPercentual(m.percentual),
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {m.acertos} de {m.questoes} questões
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} className="glass-container" sx={{ overflow: "hidden" }}>
                <Typography variant="h6" fontWeight={700} sx={{ px: 3, pt: 3, pb: 1 }}>
                  Últimos resultados
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Simulado</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Acertos</TableCell>
                        <TableCell>% de acerto</TableCell>
                        <TableCell align="right">Ação</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dados.resultados.map((r) => (
                        <TableRow key={`${r.simuladoId}-${r.data}`}>
                          <TableCell>{r.nome}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatarData(r.data)}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {r.acertos} de {r.total}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={`${r.percentual}%`}
                              color={corDoChip(r.percentual)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => navigate(`/aluno/simulados/${r.simuladoId}`)}>
                              Revisar →
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
