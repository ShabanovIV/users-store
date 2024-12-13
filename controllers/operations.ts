import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../middlewares/authenticateToken";

export const operationsRouter = Router();

interface Operation {
  id: string;
  amount: number;
  category: string;
  title: string;
  description: string;
  date: Date;
}

const operations: Operation[] = [];

// Получить список всех операций
operationsRouter.get("/", authenticateToken, (req: Request, res: Response) => {
  res.json(operations);
});

// Получить операцию по id
operationsRouter.get(
  "/:id",
  authenticateToken,
  (req: Request, res: Response) => {
    const { id } = req.params;
    const operation = operations.find((op) => op.id === id);

    if (!operation) {
      return res.status(404).json({ message: "Операция не найдена" });
    }

    res.status(200).json(operation);
  }
);

// Добавить операцию
operationsRouter.post("/", authenticateToken, (req: Request, res: Response) => {
  const {
    amount,
    category,
    title,
    description,
  }: { amount: number; category: string; title: string; description: string } =
    req.body;

  if (!amount || !category || !title || !description) {
    return res.status(400).json({ message: "Все поля должны быть заполнены" });
  }

  const operation: Operation = {
    id: uuidv4(),
    amount,
    category,
    title,
    description,
    date: new Date(),
  };

  operations.push(operation);

  res
    .status(201)
    .json({ message: "Операция успешно добавлена", id: operation.id });
});

// Удалить операцию по id
operationsRouter.delete(
  "/:id",
  authenticateToken,
  (req: Request, res: Response) => {
    const { id } = req.params;

    const operationIndex = operations.findIndex((op) => op.id === id);

    if (operationIndex === -1) {
      return res.status(404).json({ message: "Операция не найдена" });
    }

    operations.splice(operationIndex, 1);

    res.status(200).json({ message: "Операция успешно удалена" });
  }
);
