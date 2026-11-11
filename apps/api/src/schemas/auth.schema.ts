import { z } from "zod";

const email = z
  .string({ required_error: "Informe o e-mail" })
  .trim()
  .toLowerCase()
  .email("E-mail inválido");

const senha = z
  .string({ required_error: "Informe a senha" })
  .min(6, "A senha precisa ter ao menos 6 caracteres");

export const loginSchema = z.object({
  email,
  password: senha,
});

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Informe o nome" })
      .trim()
      .min(2, "Informe o nome completo"),
    email,
    password: senha,
    // Admin nunca vem do cadastro público: o enum barra antes do controller.
    role: z.enum(["aluno", "escola"]).optional().default("aluno"),
    escolaId: z.string().trim().optional(),
  })
  .passthrough();

export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: "Informe o refreshToken" })
    .min(20, "refreshToken inválido"),
});
