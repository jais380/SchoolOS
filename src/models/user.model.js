const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require("./counter.model");
const { tenantScopePlugin } = require('../utils/tenantScopePlugin');

const userSchema = mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },

    firstName: { type: String, trim: true, required: true },

    lastName: { type: String, trim: true, required: true },

    isOwner: { type: Boolean, required: true, default: false },

    email: { type: String, trim: true, required: true, lowercase: true  },

    password: { type: String, trim: true, required: true, select: false, minLength: 6 },

    dob: { type: String, trim: true, required: true },

    authUserId: { type: String, trim: true, unique: true, required: true },

    role: {
        type: String,
        enum: ['superadmin', 'admin', 'staff', 'parent', 'student']
    }
}, { timestamps: true, versionKey: false });

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

//hash password
userSchema.pre('save', async function() {
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

//create authUserId
userSchema.pre('validate', async function() {
    if(!this.isNew) return;
    const newCount = await Counter.findOneAndUpdate(
        { id: `${this.role}Id` },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );

    const paddedId = newCount.seq.toString().padStart(3, '0');

    const prefixes = {
        'superadmin': 'SADM',
        'admin': 'ADM',
        'staff': 'STF',
        'parent': 'PRT',
        'student': 'STU'
    }

    const prefix = prefixes[this.role];

    this.authUserId = `${prefix}-${paddedId}`;
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.plugin(tenantScopePlugin);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
