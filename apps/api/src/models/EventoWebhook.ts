import mongoose, { Schema, Document } from "mongoose";

/**
 * Registro de webhook recebido — serve para **idempotência**.
 *
 * O `chave` é único: se o PagBank reenviar a mesma notificação (ele reenvia em
 * caso de erro/timeout), a segunda gravação falha com E11000 e o handler sabe
 * que já processou. Sem isso, um reenvio poderia renovar a assinatura 2x.
 */
export interface IEventoWebhook extends Document {
  chave: string;
  origem: "pagbank" | "manual";
  payload: unknown;
  recebidoEm: Date;
}

const EventoWebhookSchema: Schema = new Schema(
  {
    chave: { type: String, required: true, unique: true },
    origem: { type: String, enum: ["pagbank", "manual"], default: "pagbank" },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "recebidoEm", updatedAt: false } },
);

export const EventoWebhook = mongoose.model<IEventoWebhook>(
  "EventoWebhook",
  EventoWebhookSchema,
);
