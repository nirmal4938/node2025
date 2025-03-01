// const Account = require('../models/AccountsModel');
const User = require('../models/UsersModel')
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/AccountsModel')
const getUsers = async (req, res) => {
    try {
        let accounts = await Account.find();
        return res.json(accounts)
    } catch (err) {
        return res.send(err)
        throw err
    }
}
// Utility function for finding a user by ID
const findUserById = async (id) => {
    if (!id) {
        throw new Error('User ID is required.');
    }

    const user = await Account.findById(id);
    if (!user) {
        throw new Error('User not found.');
    }

    return user;
};

// Controller function
const getOrFindUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await findUserById(id);

        // Respond with user details
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                is_2fa_enabled: user.is_2fa_enabled,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (err) {
        console.error(err);
        const statusCode = err.message === 'User ID is required.' || err.message === 'User not found.' ? 400 : 500;
        res.status(statusCode).json({ error: err.message });
    }
};
const createAccount = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 1. Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        // 2. Check if the email or username already exists
        const existingAccount = await Account.findOne({ $or: [{ username }, { email }] });
        if (existingAccount) {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate a Google Authenticator 2FA secret
        // const secret = await speakeasy.generateSecret({ name: `YourAppName (${email})` });
        // console.log("secret", secret.base32)
        // 5. Create and save the new account
        const newAccount = new Account({
            username,
            email,
            password: hashedPassword,
            role: role || 'user',
            is_active: false, // Account starts as inactive
            // google_2fa_secret: secret.base32, // Save 2FA secret
            require_mfa: false, // 2FA not verified yet
            created_at: new Date(),
            updated_at: new Date(),
        });

        await newAccount.save();

        // 6. Generate a QR code for the 2FA secret
        // const qrCode = await qrcode.toDataURL(secret.otpauth_url);

        // 7. Respond with the user data and the QR code
        res.status(201).json({
            message: 'Account created successfully!',
            // qr_code: qrCode,
            user: {
                username: newAccount.username,
                email: newAccount.email,
                role: newAccount.role,
                is_active: newAccount.is_active,
                require_mfa: newAccount.require_mfa,
                created_at: newAccount.created_at,
                updated_at: newAccount.updated_at,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while creating the account.' });
    }
}

const activateAccount = async (id) => {
    try {

        // const { id } = req.params;
        const account = await Account.findById(id);
        // if (!account) {
        //     return res.status(404).json({ error: 'Account not found.' });
        // }
        account.is_active = true;
        account.updated_at = new Date();
        await account.save();

        // res.status(200).json({ message: 'Account activated successfully.' });
    } catch (err) {
        console.error(err);
        // res.status(500).json({ error: 'An error occurred during activation.' });
    }
}

// const login = async (req, res) => {
//     const { email, password } = req.body;
//     // console.log("process.env", process.env.JWT_SECRET)
//     try {
//         const account = await Account.findOne({ email });

//         // 4. Generate JWT Token
//         const token = jwt.sign({ userId: account._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // 5. Set JWT Token in HttpOnly Cookie
//         res.cookie('token', token, {
//             httpOnly: true,       // Prevents access to the cookie via JavaScript (prevents XSS)
//             secure: process.env.NODE_ENV === 'production', // Ensures cookie is only sent over HTTPS in production
//             sameSite: 'Strict',   // Ensures cookie is sent only in first-party context (prevents CSRF)
//             maxAge: 3600000,      // 1 hour (token expiration time, you can adjust it as needed)
//             path: '/',            // Path where the cookie is valid
//         });
//         // 6. Respond with a success message (without sending the token in the body)
//         res.status(200).json({ message: 'Login successful' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'An error occurred during activation.' });
//     }
// }

const verify2FA = async (req, res) => {
    const { email, code } = req.body;

    try {
        // Validate email and code
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Invalid email format.' });
        }
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Invalid 2FA code format.' });
        }

        // Find account by email
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        // Verify the 2FA code
        const isValid = speakeasy.totp.verify({
            secret: account.mfa_secret,
            encoding: 'base32',
            token: code,
        });

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid 2FA code.' });
        }

        // Enable 2FA and activate account
        account.require_mfa = true;
        account.require_mfa_configuration = false;
        account.is_active = true;
        await account.save();

        // Optional: Activate account by ID
        // await activateAccount(account._id);

        res.status(200).json({ message: '2FA setup completed successfully!' });
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        res.status(500).json({ error: 'Error verifying 2FA.' });
    }
};

const setup2FA = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user account
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        // Generate 2FA secret
        // const secret = speakeasy.generateSecret({ name: `YourAppName (${email})` });

        // Save secret and return QR code
        // account.mfa_secret = secret.base32;
        account.require_mfa = true;
        // account.require_mfa_configuration = true;
        await account.save();

        // const qrCode = await qrcode.toDataURL(secret.otpauth_url);

        res.status(200).json({
            message: '2FA setup initiated. Scan the QR code with your authenticator app.',
            // qr_code: qrCode,
        });
    } catch (err) {
        console.error('Error setting up 2FA:', err);
        res.status(500).json({ error: 'An error occurred while setting up 2FA.' });
    }
};

const reset2FA = async (req, res) => {
    const { email } = req.body;

    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        account.google_2fa_secret = null;
        account.is_2fa_enabled = !(account.is_2fa_enabled);
        account.is_2fa_verified = false;
        await account.save();

        res.status(200).json({ message: '2FA has been reset.' });
    } catch (err) {
        console.error('Error resetting 2FA:', err);
        res.status(500).json({ error: 'An error occurred while resetting 2FA.' });
    }
};



module.exports = {
    getUsers,
    createAccount,
    activateAccount,
    // login,
    verify2FA,
    setup2FA,
    reset2FA
}