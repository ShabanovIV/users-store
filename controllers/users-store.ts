import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { SECRET_KEY } from "../middlewares/authenticateToken";

export const usersRouter = Router();

interface User {
  id: number;
  username: string;
  password: string;
}

const users: User[] = [
  { id: 1, username: "test", password: bcrypt.hashSync("password", 10) },
];

// Роут для регистрации пользователя
usersRouter.post("/register", (req: Request, res: Response) => {
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
usersRouter.post("/login", (req: Request, res: Response) => {
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

// Роут для получения всех пользователей
usersRouter.get("/users", (req: Request, res: Response) => {
  const sanitizedUsers = users.map(({ password, ...user }) => user);
  res.json(sanitizedUsers);
});
