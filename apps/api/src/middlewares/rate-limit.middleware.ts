import rateLimit from "express-rate-limit";

const mensagem = {
  error: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
};

/**
 * Login: 10 falhas por IP a cada 15 min. Sucesso não conta, então quem só
 * errou a senha uma vez não fica travado.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: mensagem,
});

/** Cadastro: segura criação em massa de contas pelo mesmo IP. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: mensagem,
});

/**
 * Refresh é chamado pelo app sempre que o access expira; o limite é mais
 * folgado e existe só para conter abuso de rotação.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: mensagem,
});

/** Pedido de reset: 5 por IP/hora (e o service ainda limita por e-mail). */
export const esqueciSenhaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: mensagem,
});

/** Tentativas de troca: 10 por IP/hora. */
export const redefinirSenhaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: mensagem,
});
