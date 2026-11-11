/**
 * Envio de e-mail transacional.
 *
 * Com `RESEND_API_KEY` usa a API do Resend (sem SDK). Sem a chave, entra em
 * modo degradado: registra no log e segue — reset de senha nunca derruba a API
 * por falta de e-mail configurado.
 */
export interface MensagemEmail {
  to: string;
  subject: string;
  html: string;
}

export const EmailService = {
  configurado(): boolean {
    return Boolean(process.env.RESEND_API_KEY?.trim());
  },

  async enviar(mensagem: MensagemEmail): Promise<{ enviado: boolean; provider: string }> {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      console.log(
        `[email] modo degradado (sem RESEND_API_KEY): "${mensagem.subject}" -> ${mensagem.to}`,
      );
      return { enviado: false, provider: "log" };
    }

    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.EMAIL_FROM?.trim() ||
          "G-Simulados <onboarding@resend.dev>",
        to: [mensagem.to],
        subject: mensagem.subject,
        html: mensagem.html,
      }),
    });

    if (!resposta.ok) {
      const corpo = await resposta.text();
      throw new Error(`Resend ${resposta.status}: ${corpo.slice(0, 200)}`);
    }

    return { enviado: true, provider: "resend" };
  },
};
