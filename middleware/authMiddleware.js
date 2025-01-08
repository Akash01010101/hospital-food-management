const jwt = require('jsonwebtoken');

function authMiddleware(roles = []) {
    return (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Check role if roles are specified
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Access denied, insufficient permissions' });
            }

            next();
        } catch (err) {
            res.status(400).json({ error: 'Invalid token' });
        }
    };
}

module.exports = authMiddleware;
