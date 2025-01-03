import { Request, Response } from "express";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { parseToken } from "../helpers/tokenHelper";

dotenv.config();
export const SECRET_KEY = process.env.KEY || "super_secret";

export function verifyTokenMiddleware(
  req: Request,
  res: Response,
  next: Function
) {
  const token = req.headers["authorization"]?.split(" ")[1];
  const result = parseToken(token, SECRET_KEY);

  if (result.isValid) {
    (req as any).user = result.user;
    next();
  } else {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
}
