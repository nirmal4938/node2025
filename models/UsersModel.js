const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    is_active: { type: Boolean, default: true },
    google_2fa_secret: { type: String, default: null }, // Store 2FA secret
    is_2fa_enabled: { type: Boolean, default: false }, // Track if 2FA is enabled
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
})


// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
