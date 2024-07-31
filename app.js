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
const key = require('./helper/generatekey');

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    let { name, email, password } = req.body;
    let user = await usermodel.findOne({ email });
    if (user) return res.status(300).send('User already exist');

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

app.post('/topic', isLoggedin, async (req, res) => {
    let { topic, content } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });
    let message = await infomodel.create({
        user: user._id,
        topic,
        content
    });
    user.infos.push(message._id);
    await user.save();

    res.redirect('/threads');
});

app.get('/threads', isLoggedin, async (req, res) => {
    let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
    let messages = await infomodel.find().populate('user').populate({
        path: 'replies',
        populate: {
            path: 'user'
        }
    });

    res.render('threads', { user, messages });
});

app.post('/reply', isLoggedin, async (req, res) => {
    let { replycontent, topicId } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });
    let topic = await infomodel.findById(topicId);
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

app.post('/log-query-id', (req, res) => {
    const { queryId } = req.body;

    console.log( queryId); 

    res.json({ success: true, queryId: queryId }); 
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
