const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'No token provided, authorization denied');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        req.user = decoded; // { id, role, email, etc. }
        next();
    } catch (error) {
        return sendError(res, 401, 'Token is invalid or expired');
    }
};

module.exports = authMiddleware;
