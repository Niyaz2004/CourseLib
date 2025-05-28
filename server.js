const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = 3000;
const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => console.log("Подключение к базе данных было установлено")).catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});