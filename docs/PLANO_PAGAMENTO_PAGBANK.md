# Plano — cobrança com PagBank (Orders API) no gSimulados

> Documento de trabalho. Nada aqui está implementado ainda.
> Contrato levantado na documentação oficial em 14/10/2026.

## 1. Decisões já tomadas

- **Não existe plano free.** Todo acesso é pago.
- Aluno **vinculado a escola** não é cobrado (a escola paga) — o model `Aluno` já tem `escolaId`.
- Para o aluno que se vincular depois, o benefício é **desconto/cupom**, não gratuidade.
- Gateway: **PagBank** (conta que você já usa), **não Mercado Pago**.
- Hoje **nada** verifica plano: aluno cadastra e usa ilimitado de graça (`PLANOS` existe só como catálogo).

## 2. Contrato do PagBank (API de Pedidos)

| Item | Valor |
|---|---|
| Criar pedido | `POST /orders` — `https://sandbox.api.pagseguro.com` (teste) · `https://api.pagseguro.com` (produção) |
| Auth | header `Authorization: Bearer <token>` |
| Token sandbox | Portal do Desenvolvedor → aba **Tokens** |
| Token produção | Desktop PagBank → **Vendas → Integrações → Gerar Token** |
| Meios suportados | PIX, boleto, cartão de crédito, débito (3DS), Pagar com PagBank |
| Certificado mTLS | **não** é exigido pela Orders (só Transferência/Pix Bacen) |
| Webhook | campo `notification_urls` no payload; o PagBank faz `POST` na URL a cada mudança de status |
| Payload do webhook | mesmo formato do response síncrono (`charges[].status`, `qr_code[]`, `reference_id`) |

Corpo mínimo (PIX):

```json
{
  "reference_id": "GS-XXXXXX",
  "customer": { "name": "...", "email": "...", "tax_id": "CPF ou CNPJ" },
  "items": [{ "name": "Assinatura Individual", "quantity": 1, "unit_amount": 1990 }],
  "charges": [{
    "reference_id": "GS-XXXXXX-1",
    "description": "Assinatura Individual - outubro/2026",
    "amount": { "value": 1990, "currency": "BRL" },
    "payment_method": { "type": "PIX", "pix": { "expiration_date": "..." } },
    "notification_urls": ["https://gsimulados-api.fly.dev/webhooks/pagbank"]
  }]
}
```

Valores são **em centavos** (`1990` = R$ 19,90). `tax_id` do comprador é **obrigatório**.

Resposta útil: `id` (ORDE_...), `charges[].id` (CHAR_...), `charges[].status`
(`WAITING` → aguardando pagamento, `PAID`, `DECLINED`, `CANCELED`), `qr_code[].text`
(copia-e-cola do PIX) e links do PNG/BASE64 do QR.

## 3. Recorrência — atenção

A **API de Assinaturas** (planos/assinantes) é **restrita a conta PJ**; conta **PF** só tem
**Link de Pagamento Recorrente**.

👉 **Confirmado em 14/10/2026: a conta é PF.** Então o desenho abaixo é o definitivo —
esquece recorrência nativa e assinatura por API.

Por isso o desenho é **cobrança por ciclo na Orders API**, feita por nós:

1. Cron diário acha assinaturas vencendo.
2. Cria um pedido novo (PIX + boleto + cartão conforme preferência) e guarda o `id` do pedido.
3. O webhook confirma o pagamento → renova por mais um ciclo.
4. Não pagou em N dias → assinatura `atrasada` → acesso bloqueado (402 na API).

Vantagem: não depende de liberação do time de Integrações do PagBank, funciona em PF ou PJ,
e o desconto de escola/cupom fica 100% sob nosso controle. **Ponto a confirmar na homologação:**
se o PagBank exige PJ para liberar a API de Pedidos em produção (a restrição documentada é só
para Pagamentos Recorrentes, mas isso precisa ser perguntado ao time deles antes de apostar).

## 4. O que implementar no código

**Backend (`apps/api`)**

1. `models/Assinatura.ts` — `usuario`, `plano`, `status` (`pendente|ativa|atrasada|cancelada`),
   `cicloInicio`, `cicloFim`, `proximaCobrancaEm`, `desconto`, `origem` (`individual|escola`),
   `escolaId`.
2. `models/Pagamento.ts` (já existe) — ganha `gateway: "pagbank"`, `pagbankOrderId`,
   `pagbankChargeId`, `qrCodeTexto`, `qrCodePngUrl`, `pagoEm`. **O PIX manual atual fica como
   fallback** até a produção estar liberada.
3. `services/pagbank/pagbank-client.service.ts` — cliente HTTP (`criarPedido`, `consultarPedido`,
   `cancelarCobranca`), com `PAGBANK_TOKEN` + `PAGBANK_BASE_URL` por env (sandbox × produção) e o
   mesmo padrão de retry/fallback que já usamos no Gemini.
4. `controllers/pagamentos.controller.ts` — `checkout` passa a criar pedido no PagBank e devolver
   QR/copia-e-cola; `GET /pagamentos/meus` mostra histórico.
5. `routes/webhooks.routes.ts` — `POST /webhooks/pagbank` **idempotente** (guarda o id do evento,
   ignora repetido), valida valor/reference_id e confirma o pagamento.
6. `middlewares/assinatura.middleware.ts` — `requireAssinaturaAtiva` nas rotas de valor
   (`/simulados/generate`, extração de PDF, questões) → **402** com link de checkout.
7. Cron (Fly scheduled machine ou rota interna protegida) — gera cobranças do ciclo e marca atrasadas.

**Regras de cobrança**

- Aluno com `escolaId` cuja escola tem assinatura ativa → **não cobra** (herda o acesso).
- Cupom de escola → desconto percentual no individual (ex.: 30% off).
- Trial de 7 dias opcional no lugar do antigo plano free.

**Frontend (`apps/web`)**

- Página pública de planos + CTA (o `Planos.tsx` já existe no código, mas **não está no ar**).
- Tela pós-checkout com QR/copia-e-cola e status "aguardando pagamento".
- Aviso de assinatura atrasada com botão de regularizar.

## 5. Homologação — o que o PagBank exige

1. Conta **sandbox** no Portal do Desenvolvedor (`portaldev.pagbank.com.br`).
2. Token do sandbox → testar `POST /orders` (PIX, boleto, cartão com cartões de teste) e o webhook.
3. **Solicitar homologação** — o time PagBank valida os **logs de request/response** de sandbox
   (e depois produção). SLA de até **4 dias úteis**.
4. Aprovado → token de produção (Vendas → Integrações → Gerar Token) e repetir os testes.

## 6. Testado AO VIVO no sandbox (14/10/2026, token do Portal do Desenvolvedor)

| Meio | Resultado real |
|---|---|
| **Boleto** | ✅ `201` com `charges[0].status = WAITING` e linha digitável (`03399853012970000024227020901016278150000015630`) |
| **Cartão** | ✅ VISA de teste → `201 / PAID`; VISA de negado → `201 / DECLINED`; MASTER → `201 / PAID` |
| **Webhook** | ✅ PagBank fez `POST` no coletor com o mesmo payload do response (`charges[0].status = PAID`, `reference_id`, `paid_at`) |
| **PIX** | ⛔ `400 Pix key was not found for pix payment method` |
| Token inválido | `401 Invalid credential. Review AUTHORIZATION header` |
| Sem `tax_id` | `400 must not be null` |

Formato **correto** do cartão (descoberto na prática — a doc não deixa claro):

```json
"payment_method": {
  "type": "CREDIT_CARD", "installments": 1, "capture": true,
  "soft_descriptor": "GSIMULADOS",
  "card": { "number": "…", "exp_month": "12", "exp_year": "2026", "security_code": "123",
            "holder": { "name": "ALUNO TESTE", "tax_id": "12345678909" } }
}
```

Mandar `soft_descriptor` dentro de um objeto `seller` devolve
`charges[0].seller.soft_descriptor: must not be empty` — `seller` não existe aqui.

**PIX está bloqueado por configuração da conta, não por código:** a doc exige que a conta
recebedora tenha **pelo menos uma chave PIX de endereçamento ativa**. O Portal do Desenvolvedor
não tem área para cadastrar chave PIX (menu: Página Inicial, Primeiros Passos, Tokens,
Transações, Logs, Cartões teste). **Ação: pedir ao time de integrações do PagBank.** Na conta de
produção (PF, que já usa PagBank) a chave PIX provavelmente já existe.

**Cartão em produção:** o sandbox aceita número puro. A doc de criptografia diz que a
criptografia de cartão (chave pública) *pode* ser usada — confirmar com o PagBank se produção
exige `card.encrypted` para quem não é PCI.

## 7. Pendências para começar

- [ ] Login no Portal do Desenvolvedor (feito por você, no painel).
- [ ] Confirmar se a conta PagBank é **PF ou PJ**.
- [ ] Definir preço final do individual e das faixas de escola (hoje no código: 19,90 / 497 por 100 alunos).
