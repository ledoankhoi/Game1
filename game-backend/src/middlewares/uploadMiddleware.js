const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        '.pdf', '.docx', '.doc', '.xlsx', '.xls',
        '.pptx', '.ppt', '.html', '.htm', '.csv',
        '.json', '.xml', '.txt', '.md', '.epub'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Loại file không được hỗ trợ: ${ext}. Các định dạng hỗ trợ: ${allowed.join(', ')}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
