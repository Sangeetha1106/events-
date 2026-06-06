const { sendError } = require('../utils/response');

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 403, 'Access denied: You do not have permission to perform this action');
        }
        next();
    };
};

module.exports = roleMiddleware;
