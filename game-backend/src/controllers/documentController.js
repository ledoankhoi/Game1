const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Knowledge = require('../models/Knowledge');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.convertFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng upload file' });
        }

        const { MarkItDown } = await import('markitdown-ts');
        const converter = new MarkItDown();
        const filePath = req.file.path;
        const result = await converter.convert(filePath);

        fs.unlink(filePath, () => {});

        res.json({
            success: true,
            fileName: req.file.originalname,
            markdown: result.textContent
        });
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.error('Lỗi convert file:', error);
        res.status(500).json({ success: false, message: 'Lỗi chuyển đổi file' });
    }
};

exports.chatWithFile = async (req, res) => {
    try {
        const { message } = req.body;

        if (!req.file) {
            if (!message) {
                return res.status(400).json({ success: false, message: 'Vui lòng upload file hoặc nhập tin nhắn' });
            }
            return res.status(400).json({ success: false, message: 'Vui lòng upload file để chat' });
        }

        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id || decoded._id;
            } catch (err) {}
        }

        const { MarkItDown } = await import('markitdown-ts');
        const converter = new MarkItDown();
        const filePath = req.file.path;
        const result = await converter.convert(filePath);

        fs.unlink(filePath, () => {});

        const knowledgeBase = await Knowledge.find();
        let projectContext = "";
        knowledgeBase.forEach(item => {
            projectContext += `- [${item.category}] ${item.title}: ${item.content}\n`;
        });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chatMessage = message || 'Hãy tóm tắt nội dung file này';
        const finalPrompt = `Bạn là trợ lý ảo thân thiện của cổng game MathQuest.

[LƯU Ý NGÔN NGỮ]: LUÔN trả lời bằng tiếng Việt CÓ DẤU, tự nhiên và thân thiện.

[CƠ SỞ DỮ LIỆU DỰ ÁN]:
${projectContext}

[NỘI DUNG FILE NGƯỜI DÙNG UPLOAD (đã convert sang Markdown)]:
${result.textContent}

Người chơi hỏi: "${chatMessage}"`;

        const aiResult = await model.generateContent(finalPrompt);
        const response = await aiResult.response;
        const text = response.text();

        res.json({
            success: true,
            reply: text,
            fileName: req.file.originalname
        });
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.error('Lỗi chat với file:', error);
        res.status(500).json({ success: false, message: 'Lỗi xử lý file' });
    }
};

exports.importKnowledge = async (req, res) => {
    try {
        const { category, title } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng upload file' });
        }

        if (!category) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(400).json({ success: false, message: 'Vui lòng chọn category' });
        }

        const { MarkItDown } = await import('markitdown-ts');
        const converter = new MarkItDown();
        const filePath = req.file.path;
        const result = await converter.convert(filePath);

        fs.unlink(filePath, () => {});

        const docTitle = title || req.file.originalname.replace(/\.[^/.]+$/, '');
        const knowledge = await Knowledge.create({
            category,
            title: docTitle,
            content: result.textContent
        });

        res.json({
            success: true,
            message: 'Đã import tài liệu vào Knowledge base',
            knowledge
        });
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.error('Lỗi import Knowledge:', error);
        res.status(500).json({ success: false, message: 'Lỗi import tài liệu' });
    }
};
