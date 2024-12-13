import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { usersRouter } from "./controllers/users-store";
import { operationsRouter } from "./controllers/operations";

const app = express();
const PORT = 3000;

// Настройка middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение маршрутов
app.use("/api", usersRouter);
app.use("/api/operations", operationsRouter);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
