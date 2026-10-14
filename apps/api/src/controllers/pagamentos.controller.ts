import { Request, Response } from "express";
import { PixConfig } from "../models/PixConfig";
import { Pagamento } from "../models/Pagamento";
import { User } from "../models/User";
import { PLANOS, getPlano } from "../config/planos";
import { AssinaturaService } from "../services/assinatura.service";
import { PagBankService } from "../services/pagbank/pagbank-client.service";

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
      planos: PLANOS.filter((p) => p.publico === "individual"),
    });
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
      const config = await PixConfig.findOne();
      if (!config || !config.ativo) {
        return res.status(503).json({
          error:
            "Cobrança via PagBank ainda não configurada. Fale com o suporte para assinar.",
        });
      }

      const pagamento = await Pagamento.create({
        ...base,
        metodo: "pix",
        gateway: "manual",
      });

      res.status(201).json({
        pagamento,
        valorFinal,
        descontoPercentual,
        manual: true,
        pix: {
          chave: config.chave,
          nomeBeneficiario: config.nomeBeneficiario,
          cidade: config.cidade,
          instrucoes: config.instrucoes,
        },
      });
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
