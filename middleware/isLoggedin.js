
const jwt=require('jsonwebtoken')
const key=require('../helper/generatekey')

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
module.exports=isLoggedin