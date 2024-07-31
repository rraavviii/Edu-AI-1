const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/edutech');

let userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
   
    infos:[
        {type: mongoose.Schema.Types.ObjectId,
            ref: 'info'
        }
    ],
    reply:
    [
    {type: mongoose.Schema.Types.ObjectId,
        ref: 'reply'
    }
]
});

module.exports = mongoose.model('user', userSchema);
