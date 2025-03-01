const jwt = require('jsonwebtoken');

const debug = require('debug');
const log = debug('auth-middleware');

const ensureLoggedIn = async (req, res, next) => {
  log('[ensureLoggedIn] REQ User id: ', (req.user || {}).id);
  log('[ensureLoggedIn] REQ Authenticated: ', req.isAuthenticated());
  if (req.isAuthenticated() === false) {
    return res.sendStatus(401);
  }

  return next();
};

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }

        req.user = decoded; // Add decoded user information to the request object
        next(); // Pass control to the next handler
    });
};
module.exports = {authenticateJWT, ensureLoggedIn}
