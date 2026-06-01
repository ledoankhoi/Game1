const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter };
