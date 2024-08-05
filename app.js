const express = require('express');
const app = express();
const path = require('path');
const port = 3030;
const usermodel = require('./model/user');
const infomodel = require('./model/info');
const cookieParser = require('cookie-parser');
const replymodel = require('./model/reply');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const {sendMail}=require('./helper/sendmail')
const multer = require('multer');
const ModerationApi = require("@moderation-api/sdk").default;
const key = require('./helper/generatekey');
const { spawn } = require('child_process');

// Multer setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, and DOCs Only!');
    }
}

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    let { name, email, password } = req.body;
    let user = await usermodel.findOne({ email });
    if (user) return res.status(300).send('User already exists');

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await usermodel.create({
                name,
                email,
                password: hash,
            });
            let token = jwt.sign({ email: email, userId: user._id }, key);
            res.cookie('token', token);
            res.redirect('/login');
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async function(req, res) {
    let { email, password } = req.body;
    let user = await usermodel.findOne({ email });
    if (!user) return res.status(500).send('something went wrong');

    bcrypt.compare(password, user.password, function(err, result) {
        if (result) {
            let token = jwt.sign({ email: email, userId: user._id }, key);
            res.cookie('token', token);
            return res.redirect('/threads');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/profile', isLoggedin, (req, res) => {
    res.render('profile');
});

app.get('/topic', (req, res) => {
    res.render('topic');
});

// app.post('/topic', isLoggedin, upload.single('doc'), async (req, res) => {
//     let { topic, content } = req.body;
//     let user = await usermodel.findOne({ email: req.user.email });
    
//     let newTopic = {
//         user: user._id,
//         topic,
//         content,
//     };

//     if (req.file) {
//         newTopic.document = req.file.filename; // Assuming your model has a document field
//     }

//     let message = await infomodel.create(newTopic);
//     user.infos.push(message._id);
//     await user.save();

//     res.redirect('/threads');
// });



app.post('/topic', isLoggedin, upload.single('doc'), async (req, res) => {
    let { topic, content } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });
    
    let newTopic = {
        user: user._id,
        topic,
        content,
    };

    if (req.file) {
        newTopic.document = req.file.filename; // Assuming your model has a document field
    }

    let message = await infomodel.create(newTopic);
    user.infos.push(message._id);
    await user.save();

    res.redirect('/threads');
});






// app.get('/threads', isLoggedin, async (req, res) => {
//     let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
//     let messages = await infomodel.find().populate('user').populate({
//         path: 'replies',
//         populate: {
//             path: 'user'
//         }
//     });

//     res.render('threads', { user, messages });
// });

// app.get('/threads', isLoggedin, async (req, res) => {
//     let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
//     let messages = await infomodel.find().populate('user').populate({
//         path: 'replies',
//         populate: {
//             path: 'user'
//         }
//     }).sort({ createdAt: -1 }); // Sort messages by creation date in descending order

//     res.render('threads', { user, messages });
// });




app.get('/threads', isLoggedin, async (req, res) => {
    let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
    let messages = await infomodel.find().populate('user').populate({
        path: 'replies',
        populate: {
            path: 'user'
        }
    }).sort({ createdAt: -1 });

    res.render('threads', { user, messages });
});



app.post('/reply', isLoggedin, async (req, res) => {
    let { replycontent, topicId } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });
    let topic = await infomodel.findById(topicId).populate('user');

    if (!topic) {
        return res.status(404).send('Topic not found');
    }

    let reply = await replymodel.create({
        user: user._id,
        querry: topicId,
        replycontent
    });

    topic.replies.push(reply._id);
    await topic.save();
    user.reply.push(reply._id);
    await user.save();



    res.redirect('/threads');
});


// app.post('/log-query-id', (req, res) => {
//     const { queryId } = req.body;

//     const pythonProcess = spawn('python', ['log_query.py', queryId]);

//     pythonProcess.stdout.on('data', (data) => {
//         console.log(`Python output: ${data.toString()}`);
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`Python error: ${data.toString()}`);
//     });

//     pythonProcess.on('close', (code) => {
//         console.log(`Python process exited with code ${code}`);
//         res.json({ message: 'Query ID logged successfully', queryId });
//     });
// });


// app.get('/chat',(req,res)=>{
//     res.render('chat')
// })




app.post('/log-query-id', async (req, res) => {
    const { queryId } = req.body;

    // Run the Python script and get the summary
    const pythonProcess = spawn('python', ['log_query.py', queryId]);

    let summary = '';
    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        res.json({ summary });
    });
});







const moderationApi = new ModerationApi({
    key: "",
  });
  
  app.post('/flagged-replies', async (req, res) => {
    const { replies } = req.body;
    const flaggedReplies = [];

    for (const reply of replies) {

        const analysis = await moderationApi.moderate.text({
            value: reply.replycontent,
            authorId: reply.user._id,
            contextId: reply._id,
        });

        if (analysis.flagged) {
            console.log('yes')
            flaggedReplies.push(reply._id);
          
            const replyUser = await usermodel.findById(reply.user._id);
            if (replyUser && replyUser.email) {
                sendMail(
                    replyUser.email,
                    'edu AI : Guidelines Violation Notification',
                    `Hi ${replyUser.name},\n\nYour reply violates our community guidelines .\n\nReply Content:\n${reply.replycontent}`,
                    
                );


                const topic = await infomodel.findById(reply.querry).populate('user');
                if (topic && topic.user.email) {
                    sendMail(
                        topic.user.email,
                        'Flagged Reply Notification',
                        `Hi ${replyUser.name},\n\nYour reply violates our community guidelines .\n\nReply Content:\n${reply.replycontent}`,
                    );
                }
            }
            else{
                console.log('no')
            }
        }


                  
    }

    res.json({ flaggedReplies });
});





app.get('/logout', function(req, res) {
    res.cookie('token', "");
    res.redirect('/login');
 });

function isLoggedin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }
    jwt.verify(token, key, (err, data) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.redirect('/login');
        }
        req.user = data;
        next();
    });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
