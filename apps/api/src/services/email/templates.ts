/** Templates simples, sem dependência de engine. */

export function templateResetSenha(nome: string, link: string): string {
  const primeiroNome = (nome || "").split(" ")[0] || "aluno";
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2933">
    <h2 style="color:#1565c0">Redefinir sua senha</h2>
    <p>Olá, ${primeiroNome}.</p>
    <p>Recebemos um pedido para trocar a senha da sua conta no <b>G-Simulados</b>.
    O link vale por <b>1 hora</b> e só pode ser usado uma vez.</p>
    <p style="margin:28px 0">
      <a href="${link}" style="background:#1565c0;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">
        Criar nova senha
      </a>
    </p>
    <p style="font-size:13px;color:#607080">Se você não pediu, ignore este e-mail: sua senha continua a mesma.</p>
    <p style="font-size:12px;color:#8090a0;word-break:break-all">${link}</p>
  </div>`;
}

export function templateBoasVindas(nome: string): string {
  const primeiroNome = (nome || "").split(" ")[0] || "aluno";
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2933">
    <h2 style="color:#1565c0">Bem-vindo ao G-Simulados</h2>
    <p>Olá, ${primeiroNome}! Sua conta foi criada.</p>
    <p>Gere seu primeiro simulado em <a href="https://gsimulados-web.fly.dev/aluno/simulados/gerar">/aluno/simulados/gerar</a>.</p>
  </div>`;
}
