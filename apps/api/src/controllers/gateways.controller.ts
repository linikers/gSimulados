import { Request, Response } from "express";
import {
  GatewayConfigService,
  CredenciaisMP,
  CredenciaisPagBank,
} from "../services/gateway-config/gateway-config.service";
import { Gateway } from "../models/GatewayConfig";

const GATEWAYS: Gateway[] = ["mercadopago", "pagbank"];

function gatewayValido(valor: string): Gateway | null {
  return GATEWAYS.includes(valor as Gateway) ? (valor as Gateway) : null;
}

export class GatewaysController {
  /** Status dos gateways, sempre com token mascarado. */
  static async status(_req: Request, res: Response) {
    try {
      res.json(await GatewayConfigService.status());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async salvar(req: Request, res: Response) {
    try {
      const gateway = gatewayValido(req.params.gateway);
      if (!gateway) {
        return res.status(404).json({ error: "Gateway desconhecido" });
      }

      if (gateway === "mercadopago") {
        const accessToken = String(req.body?.accessToken ?? "").trim();
        if (!accessToken) {
          return res.status(400).json({ error: "Informe o Access Token" });
        }

        // Não grava credencial que o MP recusa: evita trocar um token bom por
        // um inválido e derrubar o checkout sem aviso.
        const resposta = await fetch(
          "https://api.mercadopago.com/users/me",
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!resposta.ok) {
          return res.status(400).json({
            error:
              "O Mercado Pago recusou este token. Use a credencial de produção (Suas integrações → Credenciais).",
            status: resposta.status,
          });
        }

        const credenciais: CredenciaisMP = {
          accessToken,
          ...(req.body?.publicKey
            ? { publicKey: String(req.body.publicKey).trim() }
            : {}),
        };
        await GatewayConfigService.salvar(
          gateway,
          credenciais,
          req.userId,
        );
        return res.json({
          ok: true,
          gateway,
          tokenMascarado: `••••${accessToken.slice(-4)}`,
        });
      }

      const token = String(req.body?.token ?? "").trim();
      if (!token) {
        return res.status(400).json({ error: "Informe o Token do PagBank" });
      }
      const credenciais: CredenciaisPagBank = {
        token,
        ...(req.body?.email ? { email: String(req.body.email).trim() } : {}),
      };
      await GatewayConfigService.salvar(gateway, credenciais, req.userId);
      return res.json({
        ok: true,
        gateway,
        tokenMascarado: `••••${token.slice(-4)}`,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async remover(req: Request, res: Response) {
    try {
      const gateway = gatewayValido(req.params.gateway);
      if (!gateway) {
        return res.status(404).json({ error: "Gateway desconhecido" });
      }
      await GatewayConfigService.remover(gateway);
      res.json({ ok: true, gateway, origem: "ambiente" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
