const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: "Akses ditolak, Token tidak ditemukan" });

    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            console.error("JWT verification error:", err.message);
            return res.status(403).json({ error: "Token tidak valid" });
        }
        req.user = decodedPayload.user;
        next();
    });
}

function authorizeRole(role){
 return (req, res, next) => {
    if (req.user && req.user.role === role) {
        return next();
    }
     return res.status(403).json({
      error: "Akses ditolak: role tidak memiliki izin"
    });
 };
}

module.exports = {
    authenticateToken,
    authorizeRole};