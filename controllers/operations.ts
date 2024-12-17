import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../middlewares/authenticateToken";
import fs from "fs";
import path from "path";
import { ensureFileExists } from "../helpers/fileHelper";

export const operationsRouter = Router();

interface Operation {
  id: string;
  amount: number;
  category: string;
  title: string;
  description: string;
  date: Date;
}

// Путь к файлу с операциями
const OPERATIONS_FILE = path.join(__dirname, "../database/operations.json");

// Функция для чтения операций из файла
const readOperations = (): Operation[] => {
  ensureFileExists(OPERATIONS_FILE);
  const data = fs.readFileSync(OPERATIONS_FILE, "utf-8");
  return JSON.parse(data);
};

// Функция для записи операций в файл
const writeOperations = (operations: Operation[]): void => {
  ensureFileExists(OPERATIONS_FILE);
  fs.writeFileSync(OPERATIONS_FILE, JSON.stringify(operations, null, 2));
};

// Получить список всех операций
operationsRouter.get("/", authenticateToken, (req: Request, res: Response) => {
  const operations = readOperations();
  res.json(operations);
});

// Получить операцию по id
operationsRouter.get("/:id", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const operations = readOperations();
  const operation = operations.find((op) => op.id === id);

  if (!operation) {
    return res.status(404).json({ message: "Операция не найдена" });
  }

  res.status(200).json(operation);
});

// Добавить операцию
operationsRouter.post("/", authenticateToken, (req: Request, res: Response) => {
  const { amount, category, title, description } = req.body;

  if (!amount || !category || !title || !description) {
    return res.status(400).json({ message: "Все поля должны быть заполнены" });
  }

  const operations = readOperations();

  const operation: Operation = {
    id: uuidv4(),
    amount,
    category,
    title,
    description,
    date: new Date(),
  };

  operations.push(operation);
  writeOperations(operations);

  res.status(201).json({ message: "Операция успешно добавлена", id: operation.id });
});

// Удалить операцию по id
operationsRouter.delete("/:id", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  let operations = readOperations();

  const operationIndex = operations.findIndex((op) => op.id === id);

  if (operationIndex === -1) {
    return res.status(404).json({ message: "Операция не найдена" });
  }

  operations = operations.filter((op) => op.id !== id);
  writeOperations(operations);

  res.status(200).json({ message: "Операция успешно удалена" });
});
