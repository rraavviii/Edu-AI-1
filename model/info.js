const mongoose = require('mongoose');

let infoSchema = mongoose.Schema({
    topic: String,
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reply' }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('info', infoSchema);
