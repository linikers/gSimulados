import { GatewayConfig, Gateway } from "../../models/GatewayConfig";
import { cifrar, decifrar, mascarar } from "./crypto";

export type CredenciaisMP = { accessToken: string; publicKey?: string };
export type CredenciaisPagBank = { token: string; email?: string };
export type CredenciaisGateway = CredenciaisMP | CredenciaisPagBank;

const ENV_VAR: Record<Gateway, string> = {
  mercadopago: "MP_ACCESS_TOKEN",
  pagbank: "PAGBANK_TOKEN",
};

/**
 * Credenciais vindas do painel ficam em memória (uma máquina no Fly) e no
 * banco cifradas. `hydrate()` roda no boot; salvar/remover atualiza o cache na
 * hora, então o checkout não precisa de redeploy.
 */
const cache = new Map<Gateway, CredenciaisGateway>();

export class GatewayConfigService {
  static async hydrate(): Promise<void> {
    try {
      const configs = await GatewayConfig.find({ ativo: true });
      for (const config of configs) {
        try {
          cache.set(
            config.gateway as Gateway,
            decifrar<CredenciaisGateway>(config.credenciaisCifradas),
          );
        } catch (error) {
          console.error(
            `[gateway-config] não foi possível decifrar ${config.gateway}:`,
            (error as Error).message,
          );
        }
      }
    } catch (error) {
      console.error(
        "[gateway-config] hydrate falhou:",
        (error as Error).message,
      );
    }
  }

  /** Síncrono de propósito: os clients de gateway chamam no meio da cobrança. */
  static token(gateway: Gateway): string | undefined {
    const creds = cache.get(gateway) as Record<string, string> | undefined;
    const doPainel = gateway === "mercadopago" ? creds?.accessToken : creds?.token;
    return (doPainel || process.env[ENV_VAR[gateway]])?.trim() || undefined;
  }

  static credenciais(gateway: Gateway): CredenciaisGateway | undefined {
    return cache.get(gateway);
  }

  static async status() {
    const configs = await GatewayConfig.find().populate(
      "atualizadoPor",
      "name email",
    );
    const porGateway = new Map(configs.map((c) => [c.gateway, c]));

    return (["mercadopago", "pagbank"] as Gateway[]).map((gateway) => {
      const config = porGateway.get(gateway);
      const doPainel = cache.get(gateway) as Record<string, string> | undefined;
      const tokenPainel =
        gateway === "mercadopago" ? doPainel?.accessToken : doPainel?.token;
      const tokenEnv = process.env[ENV_VAR[gateway]]?.trim();
      const efetivo = tokenPainel || tokenEnv;

      return {
        gateway,
        configurado: Boolean(efetivo),
        origem: tokenPainel ? "painel" : tokenEnv ? "ambiente" : "nenhum",
        tokenMascarado: mascarar(efetivo),
        atualizadoEm: config?.atualizadoEm ?? null,
        atualizadoPor:
          (config?.atualizadoPor as unknown as { name?: string })?.name ?? null,
      };
    });
  }

  static async salvar(
    gateway: Gateway,
    credenciais: CredenciaisGateway,
    usuarioId?: string,
  ) {
    const credenciaisCifradas = cifrar(credenciais);
    await GatewayConfig.findOneAndUpdate(
      { gateway },
      {
        $set: {
          credenciaisCifradas,
          ativo: true,
          ...(usuarioId ? { atualizadoPor: usuarioId } : {}),
        },
      },
      { upsert: true, new: true },
    );
    cache.set(gateway, credenciais);
  }

  static async remover(gateway: Gateway) {
    await GatewayConfig.deleteOne({ gateway });
    cache.delete(gateway);
  }
}
