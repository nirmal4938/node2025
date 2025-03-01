const express = require('express');
const {passport} = require('../middleware/passportConfig.js')
const { getUsers, createAccount, activateAccount, login, verify2FA, setup2FA, reset2FA } = require('../controllers/userController')
const {authenticateJWT} = require('../middleware/auth');
const router = express.Router()
router.get('/', authenticateJWT, getUsers)
router.post('/create-account', createAccount)
    // router.post(
    //     '/login',
    //     passport.authenticate('local', { session: false }), // Use Passport's local strategy
    //     login
    // ),
// router.patch('/activate/:id', activateAccount)
router.post('/verify2FA', verify2FA)
router.post('/setup2FA', setup2FA)
router.post('/reset2FA', reset2FA)


module.exports = router