const mongoose = require('mongoose');

let infoSchema = mongoose.Schema({
    topic: String,
    content: String,
    document: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reply' }],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('info', infoSchema);
