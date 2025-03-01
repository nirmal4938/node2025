const express = require('express');
const router = express.Router();
const { createTeam, assignPlayersToTeam, getAll } = require('../controllers/teamController');

/**
 * @route POST /teams/create
 * @desc Create a new team
 */
router.post('/create', createTeam);

router.get('/', getAll)
/**
 * @route POST /teams/assign
 * @desc Assign a player to a team using QR code data
 */
router.post('/assign-players', assignPlayersToTeam);

module.exports = router;
