# Указываем базовый образ Node.js
FROM node:20

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код проекта в контейнер
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build

# Указываем порт, на котором приложение будет работать
EXPOSE 3000

# Указываем команду для запуска приложения
CMD ["npm", "run", "start:prod"]
