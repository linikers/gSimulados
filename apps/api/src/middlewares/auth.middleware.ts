import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [, token] = authorization.split(" ");

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const { id, role } = decoded as TokenPayload;

    req.userId = id;
    req.userRole = role;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalid" });
  }
}
