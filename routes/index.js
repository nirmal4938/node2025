const express = require('express');
const deviceHistoryRoutes = require('./deviceHistoryRoutes')
const userRoutes = require('./usersRoutes')
const router = express.Router()

router.use('/device-history', deviceHistoryRoutes);
router.use('/users', userRoutes);

module.exports = router;
