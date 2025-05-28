const express = require('express');
const authRouter = require('./authRouter');
const courseRouter = require('./courseRouter');
const userRouter = require('./userRouter');
const viewRouter = require('./viewRouter');

const router = express.Router();

router.use('/', viewRouter);
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/courses', courseRouter);
router.use('/api/v1/users', userRouter);

module.exports = router;
