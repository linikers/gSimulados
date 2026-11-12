import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { AnalyticsService } from "../../services/analytics.service";
import type { IResumoAnalytics } from "../../services/analytics.service";
import { useErrorHandler } from "../../hooks/useErrorHandler";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Kpi({
  rotulo,
  valor,
  dica,
}: {
  rotulo: string;
  valor: string;
  dica?: string;
}) {
  return (
    <Paper elevation={0} className="glass-container" sx={{ p: 2.5, height: "100%" }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: ".04em" }}
      >
        {rotulo}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
        {valor}
      </Typography>
      {dica && (
        <Typography variant="caption" color="text.secondary">
          {dica}
        </Typography>
      )}
    </Paper>
  );
}

export function AdminAnalytics() {
  const [dados, setDados] = useState<IResumoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    AnalyticsService.resumo()
      .then(setDados)
      .catch((error) => handleError(error, "Erro ao carregar as métricas."))
      .finally(() => setLoading(false));
  }, [handleError]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (!dados) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography color="text.secondary">
          Não foi possível carregar as métricas.
        </Typography>
      </Container>
    );
  }

  const maiorVestibular = Math.max(
    1,
    ...dados.questoes.porVestibular.map((v) => v.total),
  );

  const funil = [
    { rotulo: "Pendentes", valor: dados.extracao.pendentes, cor: "warning.main" },
    { rotulo: "Aprovadas", valor: dados.extracao.aprovadas, cor: "success.main" },
    { rotulo: "Rejeitadas", valor: dados.extracao.rejeitadas, cor: "error.main" },
  ];
  const totalFunil = Math.max(
    1,
    funil.reduce((soma, item) => soma + item.valor, 0),
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
        Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visão rápida de uso, conteúdo e receita. Números calculados na hora.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi rotulo="Alunos" valor={String(dados.usuarios.alunos)} dica="contas de aluno" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi rotulo="Escolas" valor={String(dados.usuarios.escolas)} dica="contas de escola" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi
            rotulo="Assinaturas ativas"
            valor={String(dados.assinaturasAtivas)}
            dica="acesso liberado"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi
            rotulo="Receita confirmada"
            valor={brl(dados.receita.total)}
            dica={`${brl(dados.receita.ultimos30)} nos últimos 30 dias`}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi rotulo="Questões" valor={String(dados.questoes.total)} dica="no banco" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi
            rotulo="Simulados"
            valor={String(dados.simulados.total)}
            dica={`${dados.simulados.ultimos30} nos últimos 30 dias`}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi
            rotulo="Tentativas"
            valor={String(dados.simulados.tentativas)}
            dica="simulados finalizados"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Kpi
            rotulo="Pagamentos"
            valor={String(dados.receita.pagamentosConfirmados)}
            dica={`${dados.receita.pendentes} pendentes`}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} className="glass-container" sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700}>
              Funil de extração
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {dados.extracao.pdfsProcessados} PDFs processados
              {dados.extracao.pdfsComErro > 0
                ? ` · ${dados.extracao.pdfsComErro} com erro`
                : ""}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {funil.map((item) => (
                <Box key={item.rotulo}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">{item.rotulo}</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {item.valor}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.valor / totalFunil) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 99,
                      bgcolor: "grey.100",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 99,
                        bgcolor: item.cor,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} className="glass-container" sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700}>
              Questões por vestibular
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Onde o banco está concentrado
            </Typography>
            {dados.questoes.porVestibular.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma questão cadastrada.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {dados.questoes.porVestibular.map((item) => (
                  <Box key={item.vestibular}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
                        {item.vestibular}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {item.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.total / maiorVestibular) * 100}
                      sx={{ height: 8, borderRadius: 99, bgcolor: "grey.100" }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
