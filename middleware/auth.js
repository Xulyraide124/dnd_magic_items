const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.redirect('/login');

    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET);
        req.user = payload; // { id, username }
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};