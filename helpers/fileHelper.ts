import fs from "fs";
import path from "path";

// Создание файла, если он отсутствует
export const ensureFileExists = (filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};
