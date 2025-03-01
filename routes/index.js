const express = require('express');
const authenticationRouter = require('./authenticationRouter')
const deviceHistoryRoutes = require('./deviceHistoryRoutes')
const userRoutes = require('./usersRoutes')
const teamRoutes = require('./teamRoutes')
const playerRoutes = require('./playerRoutes')

const quizzRoutes = require('./quizzRoutes')
const matchRoutes = require('./matchRouter')
const router = express.Router()

router.use("/auth", authenticationRouter);
router.use('/device-history', deviceHistoryRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/quizz', quizzRoutes);
router.use('/match', matchRoutes)

module.exports = router;
