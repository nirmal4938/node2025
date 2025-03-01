// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// const Account = require('../models/AccountsModel');
// const speakeasy = require('speakeasy');
// const bcrypt = require('bcrypt');

// // Define strategies as variables
// const localStrategy = new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
//     try {
//         const user = await Account.findOne({ email });
//         if (!user) {
//             return done(null, false, { message: 'Invalid email or password.' });
//         }
        
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         // console.log("isPasswordValid", isPasswordValid);
//         if (!isPasswordValid) {
//             return done(null, false, { message: 'Invalid email or password.' });
//         }

//         if (user.is_2fa_enabled && !user.is_2fa_verified) {
//             return done(null, false, { message: '2FA verification is required.' });
//         }
//         if (!user.is_active) {
//             return done(null, false, { message: 'User is Inactive.' });
//         }

//         return done(null, user);
//     } catch (err) {
//         console.log("error", err);
//         return done(err);
//     }
// });

// const jwtStrategy = new JwtStrategy({
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET,
// }, async (jwtPayload, done) => {
//     try {
//         const user = await Account.findById(jwtPayload.userId);
//         if (!user) {
//             return done(null, false, { message: 'User not found.' });
//         }
//         return done(null, user);
//     } catch (err) {
//         return done(err, false);
//     }
// });

// // Use strategies in passport middleware
// passport.use('local', localStrategy);
// passport.use('jwt', jwtStrategy);

// // Serialize and deserialize user
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await Account.findById(id);
//         done(null, user);
//     } catch (err) {
//         done(err, null);
//     }
// });

// module.exports = {passport};
const passport = require('passport');
const {Strategy} = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Account = require('../models/AccountsModel');
const bcrypt = require('bcrypt');

// Local Strategy for email/password login
// const localStrategy = new LocalStrategy(
//   { usernameField: 'email' },
//   async (email, password, done) => {
//     try {
//       const user = await Account.findOne({ email });
//       if (!user) {
//         return done(null, false, { message: 'credentials_invalid' });
//       }

//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         return done(null, false, { message: 'credentials_invalid' });
//       }

//       if (user.require_mfa && !user.require_mfa_configuration) {
//         return done(null, false, { message: 'mfa_required' });
//       }

//       // if (!user.is_active) {
//       //   return done(null, false, { message: 'mfa_required' });
//       // }

//       return done(null, user);
//     } catch (err) {
//       console.error('Error in LocalStrategy:', err);
//       return done(err);
//     }
//   }
// );
 const localStrategy = new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    let user;
    try {
      // user = await userService.getByEmail(email, { unscoped: true });
       user = await Account.findOne({ email });
      //  console.log("user", user)
    } catch (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false);
    }

    // If the account is disabled, do not allow auth
    // if (!user.is_active) {
    //   return done(false);
    // }

    // Validate password
    try {
      if (await bcrypt.compare(password, user.password) === false) {
        return done(null, false);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return done(false);
    }

    return done(null, user);
  },
);

// JWT Strategy for token validation
const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwtPayload, done) => {
    try {
      const user = await Account.findById(jwtPayload.userId);
      if (!user) {
        return done(null, false, { message: 'User not found.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
);

// Register strategies with Passport
passport.use('local', localStrategy);
passport.use('jwt', jwtStrategy);

// Serialize and deserialize user for session-based authentication
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Account.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = { passport };
