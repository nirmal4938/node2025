// routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const { createPlayer, getPlayerImage, getAll } = require('../controllers/playerController');
const { upload, getGridFSFile } = require('../middleware/fileUpload'); // Import upload middleware from fileUpload.js

// POST route to create a player
router.post('/', upload.single('player_image'), createPlayer);
router.get('/media/:fileId', getGridFSFile)
router.get('/', getAll)
module.exports = router;
