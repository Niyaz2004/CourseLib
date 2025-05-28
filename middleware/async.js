// Обертка для асинхронных функций, которая автоматически обрабатывает ошибки
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  module.exports = asyncHandler;