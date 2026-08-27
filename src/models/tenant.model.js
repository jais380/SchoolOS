const mongoose = require('mongoose');

const tenantSchema = mongoose.Schema({
    name: { type: String, trim: true, required: true },

    subdomain: { type: String, trim: true, required: true, lowercase: true, index: true, unique: true },

    plan: { type: String, enum: ['paid', 'free'], default: 'free' },

    studentLimit: { type: Number, default: 100 },

    status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Tenant', tenantSchema);
