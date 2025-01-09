const express = require('express');
const { getUsers, createAccount, activateAccount, login, verify2FA } = require('../controllers/userController')
const authenticateJWT = require('../middleware/auth');
const router = express.Router()
router.get('/', authenticateJWT, getUsers)
router.post('/create-account', createAccount)
router.post('/login/', login)
router.patch('/activate/:id', activateAccount)
router.post('/verify2FA', verify2FA)

module.exports = router