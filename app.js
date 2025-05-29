// Основной файл приложения - app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const methodOverride = require('method-override');
const session = require('express-session');
const errorHandler = require('./middleware/error');
const authRouter = require('./routes/authRouter');
// Инициализация Express приложения
const app = express();

// 1. Подключение маршрутов
const indexRouter = require('./routes/index');
const courseRouter = require('./routes/courseRouter');
/* Removed assignmentRouter as assignment-related files are deleted */
// const assignmentRouter = require('./routes/assignmentRouter');
const userRouter = require('./routes/userRouter');

// 2. Подключение базы данных
//require('./config/db')();

// 3. Middleware для обработки тела запроса
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// 4. Cookie parser
app.use(cookieParser());

// 5. Настройка шаблонизатора Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 6. Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// 7. Защита приложения
app.use(mongoSanitize()); // Защита от NoSQL-инъекций
app.use(helmet()); // Защита заголовков
app.use(xss()); // Защита от XSS-атак

// 8. Ограничение запросов
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 минут
  max: 100 // лимит 100 запросов с одного IP
});
app.use(limiter);

// 9. Защита от HTTP Parameter Pollution
app.use(hpp());

// 10. Включение CORS
app.use(cors());

// Add express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Add method-override middleware
app.use(methodOverride('_method'));

// 11. Логирование запросов в разработке
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// 12. Основные маршруты
app.use('/', indexRouter); // Маршруты для рендеринга
app.use('/api/v1/auth', authRouter);
app.use('/', courseRouter);
app.use('/api/v1/users', userRouter);
app.use('/', require('./routes/viewRouter')); 

// 13. Обработка 404 ошибки
app.use((req, res, next) => {
  res.status(404).render('error', {
    status: 404,
    message: 'Page Not Found',
    stack: process.env.NODE_ENV === 'development' ? `Route: ${req.url}` : undefined
  });
});

// 14. Обработчик ошибок (должен быть последним middleware!)
app.use(errorHandler);

module.exports = app;
