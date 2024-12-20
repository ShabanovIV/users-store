import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { SECRET_KEY } from "../middlewares/verifyTokenMiddleware";
import fs from "fs";
import path from "path";
import { ensureFileExists } from "../helpers/fileHelper";
import { parseUser } from "../helpers/tokenHelper";

export const usersRouter = Router();

interface User {
  id: number;
  username: string;
  password: string;
}

// Путь к файлу с пользователями
const USERS_FILE = path.join(__dirname, "../database/users.json");

// Функция для чтения пользователей из файла
const readUsers = (): User[] => {
  ensureFileExists(USERS_FILE);
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
};

// Функция для записи пользователей в файл
const writeUsers = (users: User[]): void => {
  ensureFileExists(USERS_FILE);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Роут для проверки токена
usersRouter.get("/verify-token", (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const result = parseUser(token, SECRET_KEY);
  res
    .status(result.status)
    .json({ message: "Токен валиден", user: result.user });
});

// Роут для регистрации пользователя
usersRouter.post("/register", (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;

  const users = readUsers();
  if (users.find((user) => user.username === username)) {
    return res
      .status(409)
      .json({ message: "Пользователь с таким именем уже существует" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    password: hashedPassword,
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
});

// Роут для авторизации
usersRouter.post("/login", (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;

  const users = readUsers();
  const user = users.find((user) => user.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res
      .status(401)
      .json({ message: "Неверное имя пользователя или пароль" });
  }

  const userResult = { id: user.id, username: user.username };

  const token = jsonwebtoken.sign({ user: userResult }, SECRET_KEY, {
    expiresIn: "1h",
  });
  res.status(200).json({ token: token, user: userResult });
});

// Роут для получения всех пользователей
usersRouter.get("/users", (req: Request, res: Response) => {
  const users = readUsers();
  const sanitizedUsers = users.map(({ password, ...user }) => user);
  res.json(sanitizedUsers);
});
