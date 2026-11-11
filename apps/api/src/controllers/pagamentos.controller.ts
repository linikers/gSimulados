import { Request, Response } from "express";
import { PixConfig } from "../models/PixConfig";
import { Pagamento } from "../models/Pagamento";
import { User } from "../models/User";
import { PLANOS, getPlano } from "../config/planos";
import { AssinaturaService } from "../services/assinatura.service";
import { PagBankService } from "../services/pagbank/pagbank-client.service";
import { MercadoPagoService, descreverRejeicaoMP } from "../services/mercadopago/mercadopago-client.service";

/** Falha do gateway automático que justifica cair no PIX manual. */
interface FalhaGateway {
  codigo: string;
  motivo: string;
  statusDetalhe?: string;
  pedidoId?: string;
  pagamentoId?: string;
}

/** Gera um código curto de referência (também é a referência no PagBank). */
function gerarReferencia(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `GS-${codigo}`;
}

/** Só dígitos; aceita vazio. */
function normalizarDocumento(valor?: string): string {
  return String(valor ?? "").replace(/\D/g, "");
}

function urlWebhook(): string {
  const base =
    process.env.API_PUBLICA_URL?.trim().replace(/\/+$/, "") ||
    "https://gsimulados-api.fly.dev";
  return `${base}/webhooks/pagbank`;
}

export class PagamentosController {
  /** Catálogo de planos (público). */
  static async listarPlanos(_req: Request, res: Response) {
    res.json(PLANOS);
  }

  /** Dados do PIX manual (fallback enquanto a homologação não sai). */
  static async getPixPublico(_req: Request, res: Response) {
    const config = await PixConfig.findOne();
    if (!config || !config.ativo) {
      return res.json({ configurado: false });
    }
    res.json({
      configurado: true,
      chave: config.chave,
      nomeBeneficiario: config.nomeBeneficiario,
      cidade: config.cidade,
      instrucoes: config.instrucoes,
    });
  }

  /** (Admin) Lê a configuração completa do PIX. */
  static async getPixConfig(_req: Request, res: Response) {
    const config = await PixConfig.findOne();
    res.json(config ?? null);
  }

  /** (Admin) Salva a configuração do PIX manual. */
  static async salvarPixConfig(req: Request, res: Response) {
    try {
      const { chave, nomeBeneficiario, cidade, instrucoes, ativo } = req.body;

      if (!chave || !String(chave).trim()) {
        return res.status(400).json({ error: "A chave PIX é obrigatória" });
      }

      let config = await PixConfig.findOne();
      if (!config) {
        config = new PixConfig();
      }

      config.chave = String(chave).trim();
      config.nomeBeneficiario = nomeBeneficiario ?? "";
      config.cidade = cidade ?? "";
      config.instrucoes = instrucoes ?? "";
      config.ativo = Boolean(ativo);
      config.atualizadoPor = req.userId as unknown as typeof config.atualizadoPor;

      await config.save();
      res.json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Situação da assinatura de quem está logado — é o que o front usa para
   * decidir entre "usar o sistema" e "assinar".
   */
  static async assinaturaStatus(req: Request, res: Response) {
    const [assinatura, cobertura, acesso] = await Promise.all([
      AssinaturaService.assinaturaVigente(req.userId).catch(() => null),
      AssinaturaService.escolaPagante(req.userId).catch(() => null),
      AssinaturaService.acessoLiberado(req.userId),
    ]);

    res.json({
      liberado: acesso.liberado,
      motivo: acesso.motivo,
      assinatura: assinatura
        ? {
            plano: assinatura.plano,
            status: assinatura.status,
            cicloFim: assinatura.cicloFim,
          }
        : null,
      cobertaPorEscola: cobertura ? { escolaId: cobertura.escolaId } : null,
      planos: PLANOS.filter((p) =>
        req.userRole === "escola"
          ? p.publico === "escola"
          : p.publico === "individual",
      ),
    });
  }

  /**
   * Registra o pedido e responde 201 no PIX manual (chave + instruções).
   *
   * Usado no fluxo normal (gateways desligados) e como **fallback** quando o
   * gateway automático recusa a cobrança: o aluno precisa de uma saída que
   * venda, não de um 502. Devolve `false` quando o PIX manual não está ativo.
   */
  private static async responderPixManual(
    res: Response,
    dados: {
      base: Record<string, unknown>;
      valorFinal: number;
      descontoPercentual: number;
      falha?: FalhaGateway;
    },
  ): Promise<boolean> {
    const config = await PixConfig.findOne();
    if (!config || !config.ativo) return false;

    const pagamento = await Pagamento.create({
      ...dados.base,
      metodo: "pix",
      gateway: "manual",
      ...(dados.falha
        ? {
            statusDetalhe: dados.falha.statusDetalhe,
            mercadopagoPedidoId: dados.falha.pedidoId,
            mercadopagoPaymentId: dados.falha.pagamentoId,
            motivoFalha: dados.falha.motivo,
          }
        : {}),
    });

    res.status(201).json({
      pagamento,
      valorFinal: dados.valorFinal,
      descontoPercentual: dados.descontoPercentual,
      manual: true,
      ...(dados.falha
        ? {
            fallback: {
              de: "mercadopago",
              codigo: dados.falha.codigo,
              motivo: dados.falha.motivo,
              statusDetalhe: dados.falha.statusDetalhe,
            },
          }
        : {}),
      pix: {
        chave: config.chave,
        nomeBeneficiario: config.nomeBeneficiario,
        cidade: config.cidade,
        instrucoes: config.instrucoes,
      },
    });
    return true;
  }

  /**
   * (Aluno) Cria o pedido de assinatura.
   *
   * Com `PAGBANK_TOKEN` configurado, a cobrança real é criada no PagBank
   * (PIX ou boleto) e devolvemos o copia-e-cola / linha digitável. Sem token,
   * cai no PIX manual (fluxo antigo) para nada quebrar antes da homologação.
   */
  static async checkout(req: Request, res: Response) {
    try {
      const { plano, metodo = "pix", taxId } = req.body ?? {};
      const planoEscolhido = getPlano(plano);

      if (!planoEscolhido) {
        return res.status(400).json({ error: "Plano inválido" });
      }
      if (planoEscolhido.preco <= 0) {
        return res.status(400).json({ error: "Este plano não tem cobrança" });
      }
      if (!["pix", "boleto"].includes(metodo)) {
        return res.status(400).json({
          error:
            "Método não suportado. Use pix ou boleto (cartão entra com criptografia no front).",
        });
      }

      const usuario = await User.findById(req.userId);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Aluno coberto por escola não é cobrado — quem paga é a escola.
      const escolaPagante = await AssinaturaService.escolaPagante(req.userId);
      if (escolaPagante) {
        return res.status(409).json({
          error: "Sua escola já cobre seu acesso",
          escolaId: escolaPagante.escolaId,
          mensagem:
            "Você está vinculado a uma escola com assinatura ativa. Não precisa assinar.",
        });
      }

      // Desconto da escola quando ela existe mas não está com o ciclo ativo.
      const descontoPercentual = await AssinaturaService.descontoDoAluno(
        req.userId,
      );
      const valorFinal = AssinaturaService.valorComDesconto(
        planoEscolhido.preco,
        descontoPercentual,
      );

      const referencia = gerarReferencia();
      const descricao = `${planoEscolhido.nome} — ciclo mensal`;
      const base = {
        usuario: usuario._id,
        plano: planoEscolhido.codigo,
        valor: valorFinal,
        metodo: metodo as "pix" | "boleto",
        status: "pendente" as const,
        referencia,
        expiraEm: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };

      // Mercado Pago primeiro: é a conta que já tem credencial de produção e
      // PIX habilitado. PagBank segue como alternativa e o PIX manual fecha.
      // Se o MP recusar a cobrança, o aluno NÃO pode ficar sem saída: cai no
      // PIX manual quando ele está ativo, senão devolve 502 com motivo legível.
      if (metodo === "pix" && MercadoPagoService.configurado()) {
        let cobranca: Awaited<ReturnType<typeof MercadoPagoService.criarCobrancaPix>>;
        try {
          cobranca = await MercadoPagoService.criarCobrancaPix({
            referencia,
            valorCentavos: Math.round(valorFinal * 100),
            descricao,
            cliente: {
              nome: usuario.name,
              email: usuario.email,
              taxId: taxId || usuario.taxId,
            },
          });
        } catch (erroMP) {
          const rejeicao = descreverRejeicaoMP(erroMP);

          const caiuNoManual = await PagamentosController.responderPixManual(res, {
            base,
            valorFinal,
            descontoPercentual,
            falha: {
              codigo: rejeicao.codigo,
              motivo: rejeicao.motivo,
              statusDetalhe: rejeicao.statusDetalhe,
              pedidoId: rejeicao.pedidoId,
              pagamentoId: rejeicao.pagamentoId,
            },
          });
          if (caiuNoManual) return;

          // Sem PIX manual: a recusa precisa ficar registrada para o admin ver
          // (status_detail e id do pagamento) e o aluno recebe motivo legível.
          await Pagamento.create({
            ...base,
            gateway: "mercadopago",
            status: "recusado",
            statusDetalhe: rejeicao.statusDetalhe,
            mercadopagoPedidoId: rejeicao.pedidoId,
            mercadopagoPaymentId: rejeicao.pagamentoId,
            motivoFalha: rejeicao.motivo,
          }).catch(() => null);

          return res.status(502).json({
            error: rejeicao.motivo,
            motivo: rejeicao.motivo,
            codigo: rejeicao.codigo,
            statusDetalhe: rejeicao.statusDetalhe,
            gateway: "mercadopago",
            pixManualDisponivel: false,
          });
        }

        const pagamento = await Pagamento.create({
          ...base,
          gateway: "mercadopago",
          mercadopagoPedidoId: cobranca.pedidoId,
          mercadopagoPaymentId: cobranca.pagamentoId,
          statusDetalhe: cobranca.statusDetalhe,
          qrCodeTexto: cobranca.qrCodeTexto,
          qrCodePngUrl: cobranca.qrCodeImagem,
          status: cobranca.status === "pago" ? "pago" : "pendente",
        });

        // PIX raramente confirma na criação, mas se confirmar, libera agora.
        if (cobranca.status === "pago") {
          pagamento.pagoEm = new Date();
          await pagamento.save();
          await AssinaturaService.renovar({
            usuarioId: String(usuario._id),
            plano: planoEscolhido.codigo,
            agora: pagamento.pagoEm,
          });
        }

        return res.status(201).json({
          pagamento,
          valorFinal,
          descontoPercentual,
          mercadopago: {
            pedidoId: cobranca.pedidoId,
            status: cobranca.statusBruto,
            qrCode: cobranca.qrCodeTexto,
            qrCodeImagem: cobranca.qrCodeImagem,
            linkPagamento: cobranca.linkPagamento,
          },
        });
      }

      if (PagBankService.configurado()) {
        const documento = normalizarDocumento(taxId || usuario.taxId);
        if (!/^\d{11}$|^\d{14}$/.test(documento)) {
          return res.status(400).json({
            error: "Informe o CPF (11 dígitos) ou CNPJ (14 dígitos) do titular",
            campo: "taxId",
          });
        }

        // Boleto exige o endereço do pagador (PIX não).
        const endereco = (req.body?.enderecoCobranca ??
          (usuario as any).enderecoCobranca) as
          | {
              cep?: string;
              logradouro?: string;
              numero?: string;
              complemento?: string;
              bairro?: string;
              cidade?: string;
              uf?: string;
            }
          | undefined;

        if (metodo === "boleto") {
          const completo =
            endereco?.cep &&
            endereco?.logradouro &&
            endereco?.numero &&
            endereco?.bairro &&
            endereco?.cidade &&
            endereco?.uf;
          if (!completo) {
            return res.status(400).json({
              error:
                "O boleto precisa do endereço do pagador: CEP, logradouro, número, bairro, cidade e UF",
              campo: "enderecoCobranca",
            });
          }
        }

        let precisaSalvar = false;
        if (!usuario.taxId) {
          usuario.taxId = documento;
          precisaSalvar = true;
        }
        if (metodo === "boleto" && !(usuario as any).enderecoCobranca) {
          (usuario as any).enderecoCobranca = endereco;
          precisaSalvar = true;
        }
        if (precisaSalvar) await usuario.save();

        const pedido = await PagBankService.criarPedido({
          referencia,
          cliente: {
            nome: usuario.name,
            email: usuario.email,
            taxId: documento,
          },
          itens: [
            {
              nome: descricao,
              quantidade: 1,
              valorCentavos: Math.round(valorFinal * 100),
              referencia,
            },
          ],
          metodo: metodo === "boleto" ? "BOLETO" : "PIX",
          descricao,
          notificationUrls: [urlWebhook()],
          ...(metodo === "boleto"
            ? {
                boleto: {
                  holder: {
                    nome: usuario.name,
                    taxId: documento,
                    email: usuario.email,
                    endereco: endereco as any,
                  },
                },
              }
            : {}),
        });

        const pagamento = await Pagamento.create({
          ...base,
          gateway: "pagbank",
          pagbankPedidoId: pedido.pedidoId,
          pagbankChargeId: pedido.chargeId,
          qrCodeTexto: pedido.qrCodeTexto,
          qrCodePngUrl: pedido.qrCodePngUrl,
          boletoBarcode: pedido.boletoBarcode,
          boletoPdfUrl: pedido.boletoPdfUrl,
          status: pedido.status === "pago" ? "pago" : "pendente",
        });

        return res.status(201).json({
          pagamento,
          valorFinal,
          descontoPercentual,
          pagbank: {
            pedidoId: pedido.pedidoId,
            metodo,
            pix: pedido.qrCodeTexto
              ? { copiaECola: pedido.qrCodeTexto, qrPngUrl: pedido.qrCodePngUrl }
              : undefined,
            boleto: pedido.boletoBarcode
              ? { linhaDigitavel: pedido.boletoBarcode, pdfUrl: pedido.boletoPdfUrl }
              : undefined,
          },
        });
      }

      // Fallback: PIX manual conferido pelo admin.
      const caiuNoManual = await PagamentosController.responderPixManual(res, {
        base,
        valorFinal,
        descontoPercentual,
      });
      if (!caiuNoManual) {
        return res.status(503).json({
          error:
            "Nenhum meio de pagamento está configurado no momento. Fale com o suporte para assinar.",
        });
      }
    } catch (error: any) {
      const status = error?.status === 400 ? 400 : 502;
      res.status(status).json({ error: error.message });
    }
  }

  /** (Aluno) Lista os próprios pedidos. */
  static async meusPagamentos(req: Request, res: Response) {
    const pagamentos = await Pagamento.find({ usuario: req.userId }).sort({
      criadoEm: -1,
    });
    res.json(pagamentos);
  }

  /** (Admin) Lista todos os pedidos. */
  static async listarTodos(_req: Request, res: Response) {
    const pagamentos = await Pagamento.find()
      .populate("usuario", "name email role")
      .sort({ criadoEm: -1 });
    res.json(pagamentos);
  }

  /**
   * (Admin) Confirma o recebimento manualmente (PIX conferido à mão).
   * Ativa a assinatura — é a assinatura que libera o acesso, não o `plano` do
   * usuário (campo antigo, mantido por compatibilidade).
   */
  static async confirmar(req: Request, res: Response) {
    try {
      const pagamento = await Pagamento.findById(req.params.id);
      if (!pagamento) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      if (pagamento.status === "pago") {
        return res.json(pagamento);
      }

      // Só o PIX manual (chave estática conferida no extrato) pode ser
      // confirmado à mão. Cobrança automática (MP/PagBank) que ficou pendente
      // ou foi recusada NÃO vira acesso liberado por clique do admin — sem
      // dinheiro no extrato, sem assinatura.
      const gateway = pagamento.gateway ?? "manual";
      if (gateway !== "manual") {
        return res.status(409).json({
          error:
            "Cobrança automática: confirme o pagamento no gateway. Este registro não pode ser confirmado manualmente.",
          gateway,
          status: pagamento.status,
          statusDetalhe: pagamento.statusDetalhe ?? null,
        });
      }

      if (pagamento.status !== "pendente") {
        return res.status(409).json({
          error: `Pagamento com status "${pagamento.status}" não pode ser confirmado.`,
          gateway,
          status: pagamento.status,
        });
      }

      pagamento.status = "pago";
      pagamento.pagoEm = new Date();
      pagamento.confirmadoPor = req.userId as unknown as typeof pagamento.confirmadoPor;
      pagamento.confirmadoEm = new Date();
      await pagamento.save();

      const assinatura = await AssinaturaService.renovar({
        usuarioId: String(pagamento.usuario),
        plano: pagamento.plano,
      });

      await User.findByIdAndUpdate(pagamento.usuario, {
        plano: pagamento.plano,
        planoExpiraEm: assinatura.cicloFim,
      });

      res.json({ pagamento, assinaturaAte: assinatura.cicloFim });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
