import { z } from "zod";

export const faqSchema = z.object({
  pergunta: z
    .string({ required_error: "Informe a pergunta" })
    .trim()
    .min(5, "A pergunta precisa ter ao menos 5 caracteres"),
  resposta: z
    .string({ required_error: "Informe a resposta" })
    .trim()
    .min(10, "A resposta precisa ter ao menos 10 caracteres"),
  categoria: z.enum(["escola", "aluno", "geral"]).default("geral"),
  ordem: z.coerce.number().int().min(0).default(0),
  publicado: z.boolean().default(true),
});

export type FaqInput = z.infer<typeof faqSchema>;
