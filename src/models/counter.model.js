const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true },

    seq: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Counter', counterSchema);
