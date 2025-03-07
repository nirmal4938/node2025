const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const AccountSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    // Operators monitor processes, engineers configure systems, and admins manage users and access.
    role: { type: String, enum: ['operator', 'engineer', 'admin'], default: null },
    is_active: { type: Boolean, default: false },
    mfa_secret: { type: String, default: null }, // Store 2FA secret
    require_mfa: { type: Boolean, default: false }, // Track if 2FA is enabled,
    require_mfa_configuration: {type: Boolean, default: false}, 
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
})

AccountSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
const Account = mongoose.model('Account', AccountSchema);
module.exports = Account;