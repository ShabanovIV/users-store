import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { usersRouter } from "./controllers/users-store";
import { operationsRouter } from "./controllers/operations";

const app = express();
const PORT = 3000;

// Разрешить запросы с любого источника
app.use(
  cors({
    origin: "*", // Разрешить запросы с любого клиента
    methods: "GET,POST,PUT,DELETE", // Укажите разрешенные методы
    allowedHeaders: "Content-Type,Authorization", // Укажите разрешенные заголовки
  })
);

// Настройка middleware
app.use(bodyParser.json());

// Подключение маршрутов
app.use("/api", usersRouter);
app.use("/api/operations", operationsRouter);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
