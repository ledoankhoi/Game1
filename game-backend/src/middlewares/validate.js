const { body, param, query } = require('express-validator');

const handleErrors = (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().map(e => e.msg).join('; '),
        });
    }
    next();
};

const registerRules = [
    body('username')
        .trim().isLength({ min: 3, max: 20 }).withMessage('Tên phải từ 3-20 ký tự')
        .matches(/^[a-zA-Z0-9_\s]+$/).withMessage('Tên chỉ được chứa chữ, số, gạch dưới'),
    body('email')
        .trim().isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    handleErrors,
];

const loginRules = [
    body('email').trim().notEmpty().withMessage('Thiếu email'),
    body('password').notEmpty().withMessage('Thiếu mật khẩu'),
    handleErrors,
];

const saveResultRules = [
    body('gameId').trim().notEmpty().withMessage('Thiếu gameId'),
    body('score').isInt({ min: 0, max: 999999 }).withMessage('Score không hợp lệ'),
    body('coinsEarned').isInt({ min: 0, max: 10000 }).withMessage('Coins không hợp lệ'),
    body('expEarned').isInt({ min: 0, max: 10000 }).withMessage('EXP không hợp lệ'),
    handleErrors,
];

const updateUsernameRules = [
    body('username')
        .trim().isLength({ min: 3, max: 20 }).withMessage('Tên phải từ 3-20 ký tự')
        .matches(/^[a-zA-Z0-9_\s]+$/).withMessage('Tên chỉ được chứa chữ, số, gạch dưới'),
    handleErrors,
];

const updateAvatarRules = [
    body('avatarUrl').trim().notEmpty().withMessage('Thiếu avatarUrl'),
    handleErrors,
];

const feedbackRules = [
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Nội dung phải từ 1-1000 ký tự'),
    handleErrors,
];

const claimQuestRules = [
    body('questId').trim().notEmpty().withMessage('Thiếu questId'),
    handleErrors,
];

const equipBadgeRules = [
    body('badgeId').trim().notEmpty().withMessage('Thiếu badgeId'),
    handleErrors,
];

const buyItemRules = [
    body('itemId').trim().notEmpty().withMessage('Thiếu itemId'),
    handleErrors,
];

const equipItemRules = [
    body('itemId').trim().notEmpty().withMessage('Thiếu itemId'),
    handleErrors,
];

const toggleFavoriteRules = [
    body('gameId').trim().notEmpty().withMessage('Thiếu gameId'),
    handleErrors,
];

const createUserRules = [
    body('username')
        .trim().isLength({ min: 3, max: 20 }).withMessage('Tên phải từ 3-20 ký tự'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    handleErrors,
];

const createItemRules = [
    body('itemId').trim().notEmpty().withMessage('Thiếu itemId'),
    body('name').trim().notEmpty().withMessage('Thiếu tên item'),
    body('price').isInt({ min: 0 }).withMessage('Giá không hợp lệ'),
    handleErrors,
];

const createGameRules = [
    body('title').trim().notEmpty().withMessage('Thiếu tên game'),
    body('slug').trim().notEmpty().withMessage('Thiếu slug'),
    handleErrors,
];

module.exports = {
    registerRules,
    loginRules,
    saveResultRules,
    updateUsernameRules,
    updateAvatarRules,
    feedbackRules,
    claimQuestRules,
    equipBadgeRules,
    buyItemRules,
    equipItemRules,
    toggleFavoriteRules,
    createUserRules,
    createItemRules,
    createGameRules,
};
