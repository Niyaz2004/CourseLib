// Middleware для расширенных результатов (пагинация, фильтрация, сортировка)
const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
  
    // Копируем query-параметры
    const reqQuery = { ...req.query };
  
    // Поля, которые нужно исключить
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Создаем строку запроса
    let queryStr = JSON.stringify(reqQuery);
    
    // Создаем операторы ($gt, $gte и т.д.)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    // Находим ресурсы
    query = model.find(JSON.parse(queryStr));
  
    // Выбираем поля
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
  
    // Сортировка
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
  
    // Пагинация
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));
  
    query = query.skip(startIndex).limit(limit);
  
    // Популяция
    if (populate) {
      query = query.populate(populate);
    }
  
    // Выполняем запрос
    const results = await query;
  
    // Объект пагинации
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
  
    // Добавляем результаты в объект ответа
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    };
  
    next();
  };
  
  module.exports = advancedResults;