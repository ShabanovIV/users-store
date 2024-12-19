import { Request, Response } from "express";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const SECRET_KEY = process.env.KEY || "super_secret";

export function verifyTokenMiddleware(
  req: Request,
  res: Response,
  next: Function
) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Данные авторизации не верные" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, SECRET_KEY) as JwtPayload;
    (req as any).user = decoded.user; // Сохраняем данные пользователя в запросе для последующего использования
    next(); // Продолжаем выполнение маршрута
  } catch (error) {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
}
