const express = require('express');
const router = express.Router()
const {createQuestion} = require('../controllers/QuizzController');
const {authenticateJWT} = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

router.use('/insert-questions',authenticateJWT, upload.single('media'), createQuestion)
module.exports = router
