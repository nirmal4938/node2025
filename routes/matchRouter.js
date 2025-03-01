const express = require('express');
const {AddBallData} = require('../controllers/BallByBallController');
const { startMatch } = require('../controllers/MatchController');
const router = express.Router();

router.post('/add-ball-data', AddBallData)
router.post('/', startMatch)
// router.get('/match-details', )

module.exports = router;