/**
 * Erro de negócio com status HTTP explícito. O middleware central traduz para
 * JSON; o controller não precisa repetir `res.status(...).json(...)`.
 */
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 400, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
