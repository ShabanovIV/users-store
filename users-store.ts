import express, { Request, Response } from 'express';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key'; // Замените на более сложный ключ

app.use(bodyParser.json());

// Пример базы данных (может быть заменена на MongoDB, PostgreSQL и т.д.)
interface User {
  id: number;
  username: string;
  password: string;
}

const users: User[] = [
  { id: 1, username: 'test', password: bcrypt.hashSync('password', 10) } // Пароль должен быть хэширован
];

// Роут для регистрации пользователя
app.post('/api/register', (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } = req.body;

  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
});

// Роут для авторизации
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } = req.body;
  const user = users.find(user => user.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
  }

  const token = jsonwebtoken.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Роут для проверки токена
app.get('/api/protected', (req: Request, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Токен отсутствует' });
  }

  try {
    const decoded = jsonwebtoken.verify(token, SECRET_KEY) as JwtPayload;
    res.json({ message: 'Доступ разрешен', data: decoded });
  } catch (error) {
    res.status(403).json({ message: 'Токен недействителен' });
  }
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
