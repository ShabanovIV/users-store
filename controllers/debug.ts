import { Router } from "express";
import fs from "fs";


export const debugRoute = Router();

debugRoute.get('/:filename', (req, res) => {
    const { filename } = req.params;
    const logPath = `/root/.npm/_logs/${filename}.log`;

    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send(`Ошибка чтения файла: ${err.message}`);
        }
        res.type('text/plain').send(data);
    });
});