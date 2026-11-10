import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useAssinaturaBloqueada } from "../../store/useAssinaturaBloqueada";
import { useAuth } from "../../hooks/useAuth";

/**
 * Resposta visual ao 402 da API: mostra o motivo que o backend devolveu e o
 * caminho para assinar. Montado uma vez no App para valer em qualquer recurso
 * pago, não só no gerador de simulado.
 */
export function AssinaturaBloqueadaDialog() {
  const { open, mensagem, fechar } = useAssinaturaBloqueada();
  const { user } = useAuth();
  const navigate = useNavigate();

  const verPlanos = () => {
    fechar();
    if (user?.role === "escola") {
      navigate("/escola/assinatura");
    } else if (user?.role === "aluno") {
      // cai na tela de pagamento com o checkout do plano individual já aberto
      navigate("/aluno/assinatura?pagar=individual");
    } else {
      navigate("/planos");
    }
  };

  return (
    <Dialog open={open} onClose={fechar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
        <LockOutlinedIcon color="primary" />
        Assinatura necessária
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {mensagem ||
            "Sua assinatura não está ativa. Assine para continuar usando os simulados."}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={fechar} color="inherit">
          Agora não
        </Button>
        <Button onClick={verPlanos} variant="contained" disableElevation>
          {user?.role === "aluno" ? "Pagar com PIX" : "Ver planos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
