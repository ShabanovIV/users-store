import express, { Request, Response } from "express";
import cors from "cors"; // Импортируем cors
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Замените на более сложный ключ

// Настраиваем CORS для разрешения запросов от любых источников
app.use(cors());

// Настраиваем BodyParser
app.use(bodyParser.json());

// Пример базы данных (может быть заменена на MongoDB, PostgreSQL и т.д.)
interface User {
  id: number;
  username: string;
  password: string;
}

interface Operation {
  id: string;
  amount: number;
  category: string;
  title: string;
  description: string;
  date: Date;
}

const users: User[] = [
  { id: 1, username: "test", password: bcrypt.hashSync("password", 10) }, // Пароль должен быть хэширован
];

const operations: Operation[] = [];

// Роут для регистрации пользователя
app.post("/api/register", (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;

  if (users.find((user) => user.username === username)) {
    return res
      .status(409)
      .json({ message: "Пользователь с таким именем уже существует" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
});

// Роут для авторизации
app.post("/api/login", (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  const user = users.find((user) => user.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res
      .status(401)
      .json({ message: "Неверное имя пользователя или пароль" });
  }

  const token = jsonwebtoken.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

// Роут для проверки токена
app.get("/api/protected", (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Токен отсутствует" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, SECRET_KEY) as JwtPayload;
    res.json({ message: "Доступ разрешен", data: decoded });
  } catch (error) {
    res.status(403).json({ message: "Токен недействителен" });
  }
});

app.get("/api/users", (req: Request, res: Response) => {
  const sanitizedUsers = users.map(({ password, ...user }) => user);
  res.json(sanitizedUsers);
});

// Операции

// Получить список всех операций
app.get("/api/operations", (req: Request, res: Response) => {
  res.json(operations);
});

// Получить операцию по id
app.get("/api/operations/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const operation = operations.find((op) => op.id === id);

  if (!operation) {
    return res.status(404).json({ message: "Операция не найдена" });
  }

  res.status(200).json(operation);
});

// Добавить операцию
app.post("/api/operations", (req: Request, res: Response) => {
  const {
    amount,
    category,
    title,
    description,
  }: {
    amount: number;
    category: string;
    title: string;
    description: string;
  } = req.body;

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
app.delete("/api/operations/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const operationIndex = operations.findIndex((op) => op.id === id);

  if (operationIndex === -1) {
    return res.status(404).json({ message: "Операция не найдена" });
  }

  operations.splice(operationIndex, 1);

  res.status(200).json({ message: "Операция успешно удалена" });
});

app.listen(PORT, () =>
  console.log(`Сервер запущен на http://localhost:${PORT}`)
);
