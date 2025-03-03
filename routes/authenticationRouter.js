const express = require('express');
const { passport } = require('../middleware/passportConfig.js');
// const {passport} = require('passport') 
const jwt = require('jsonwebtoken');
const {GoogeAuthenticator} = require('passport-2fa-totp')
const { getOrCreateTransaction } = require('../utils/TransactionUtils.js');
const { totp } =  require('notp');

const speakeasy = require('speakeasy');  // Using speakeasy for TOTP validation
const Account = require('../models/AccountsModel.js');
const { error } = require('../utils/logging.js');
const { ensureLoggedIn } = require('../middleware/auth.js');
const util = require('util');
const router = express.Router();

// Promisified login function
const login = async (user, req) =>
  new Promise((res, rej) => {
    req.login(user, (err) => (err ? rej(err) : res(user)));
  });

// Send JWT token in a secure cookie
const sendCookie = (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 3600000, // 1 hour expiry for the token
  });
};
const prepMFAConfiguration = (req, res, user) => {
  const secret = GoogeAuthenticator.register(user.email);
  // @ts-ignore
  req.session.mfa_secret = secret.secret;
  return res.status(401).json({
    error: true,
    message: 'mfa_not_configured',
    mfa_secret: secret.secret,
  });
};
// Login route

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Auth route working' });
});
router.post('/login', (req, res) => (
  passport.authenticate('local', async (err, user, info) => {
    // const organization = await organizationService.findForUser(user);
    // const require_mfa_org_level = organization[0]?.settings?.require_mfa;
    // console.log("user", user)
    const require_mfa = user?.require_mfa;

    if (err) {
      // console.log("err", err)
      return res.status(200).json({
        error: true,
        message: 'error_occurred',
      });
    }

    // When credentials are missing usually
    if (info?.message === 'Missing credentials') {
      return res.status(200).json({
        error: true,
        message: 'credentials_missing',
      });
    }
    if (!user) {
      return res.status(200).json({
        error: true,
        message: 'credentials_invalid',
      });
    }

    // Short-circuit if MFA is not required
    if (!require_mfa) {
      await login(user, req);
      sendCookie(req, res);
      return res.status(200).json({ error: false });
    }

    // If the user doesn't have a secret, then we need to configure one for them
    if (!user.mfa_secret) {
      // If they didn't send a code, they haven't tried to configure yet
      if (!req.body.code && !req.query.code) {
        return prepMFAConfiguration(req, res, user);
      }

      // If they sent a code, but there's no session secret, then their session
      // likely expired, so just go again.
      if (!req.session.mfa_secret) {
        return prepMFAConfiguration(req, res, user);
      }

      // If they sent a code and we have a secret in session, then validate the
      // code, set the mfa_secret, save, and move on...
      const secret = GoogeAuthenticator.decodeSecret(req.session.mfa_secret);
      const isValid = totp.verify((req.body.code || req.query.code), secret, { time: 30 });
      if (!isValid) {
        return res.status(401).json({
          error: true,
          message: 'mfa_invalid',
        });
      }
      try {
        await getOrCreateTransaction(async (session) => {
          // Use updateOne to update the user's MFA details in the Account collection
          await Account.updateOne(
              { _id: user._id }, // Query to match the specific user
              {
                  $set: {
                      mfa_secret: req.session.mfa_secret,
                      require_mfa_configuration: false,
                  },
              },
              { session } // Pass the transaction session
          );
      });

        await login(user, req);
        sendCookie(req, res);
        return res.json({ error: false });
    } catch (transactionError) {
        console.error('Transaction failed:', transactionError);
        return res.status(500).json({
            error: true,
            message: 'mfa_configuration_error',
        });
    }
}

    if (!req.body.code && !req.query.code) {
      return res.status(401).json({
        error: true,
        message: 'mfa_required',
      });
    }

    // If the user has an MFA secret, validate and move on...
    const secret = GoogeAuthenticator.decodeSecret(user.mfa_secret);
    const isValid = totp.verify((req.body.code || req.query.code), secret, { time: 30 });
    if (!isValid || isValid.delta < -1) {
      return res.status(401).json({
        error: true,
        message: 'mfa_invalid',
      });
    }

    await login(user, req);
    sendCookie(req, res);
    return res.status(200).json({ error: false });
  })(req, res)));

  router.get('/configure-2fa', ensureLoggedIn, (req, res) => {
    const qrInfo = GoogeAuthenticator.register(req.user.email);
    // @ts-ignore
    req.session.qr = qrInfo.secret;
  
    return res.send(qrInfo.secret);
  });
  

  router.get('/status', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
      return res.status(200).json({
        error: false,
        payload: req.user.email,
      });
    }
    return res.status(200).json({ // This should probably be a 401 or 403
      error: true, // TODO This should probably not be an error
    });
  });
  router.post('/logout', async (req, res) => {
      const logout = util.promisify(req.logout).bind(req);
  
      try {
          await logout();
          return res.status(200).json({ error: false, message: 'logged_out' });
      } catch (err) {
          console.error('Error during logout:', err);
          return res.status(500).json({ error: true, message: 'logout_failed' });
      }
  });
// router.post('/login', (req, res) =>
//   passport.authenticate('local', async (err, user, info) => {
//     console.log("user passport", user)
//     // const account = await Account.findOne({ email: user.email });
//     if (err) {
//       console.error('Authentication error:', err);
//       return res.status(500).json({ error: true, message: 'error_occurred' });
//     }

//     if (!user) {
//       return res.status(401).json({ error: true, message: info?.message || 'credentials_invalid' });
//     }

//     const requireMFA = user.require_mfa;

//     // If MFA is required and code is not provided
//     if (requireMFA && !req.body.code) {
//       return res.status(401).json({ error: true, message: 'mfa_required' });
//     }

//     // If MFA is required, verify the code
//     if (requireMFA) {
//       const isValid = speakeasy.totp.verify({
//         secret:   google_2fa_secret.google_2fa_secret,
//         encoding: 'base32',
//         token: req.body.code,
//         window: 1,  // Allow a small time window for TOTP codes
//       });
//       if (!isValid) {
//         return res.status(401).json({ error: true, message: 'mfa_required' });
//       }
//     }

//     try {
//       await login(user, req);  // Establish session
//       sendCookie(req, res);    // Send JWT token as a cookie
//       res.status(200).json({ error: false, message: 'Login successful' });
//     } catch (loginError) {
//       console.error('Login error:', loginError);
//       res.status(500).json({ error: true, message: 'error_occurred' });
//     }
//   })(req, res)
// );

router.get('/strategies/:domain?', async (req, res) => {
    const result = {
      local: true, // TODO should be based on org config
      azure: false,
      strategies: [],
    };
  
    try {
      if (!req.params.domain) {
        return;
      }
    } catch (err) {
      error('Error: ', err);
      throw err;
    }
    console.log('result', result)
    res.send(result);
  });

module.exports = router;
