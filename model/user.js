const mongoose = require('mongoose');


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
