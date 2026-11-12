import { z } from "zod";

export const esqueciSenhaSchema = z.object({
  email: z
    .string({ required_error: "Informe o e-mail" })
    .trim()
    .toLowerCase()
    .email("E-mail inválido"),
});

export const redefinirSenhaSchema = z.object({
  token: z
    .string({ required_error: "Token ausente" })
    .min(20, "Link inválido"),
  password: z
    .string({ required_error: "Informe a nova senha" })
    .min(8, "A nova senha precisa ter ao menos 8 caracteres"),
});
