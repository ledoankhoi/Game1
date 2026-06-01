const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'https://mathquest.com:5173'];

const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }
});

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const gameRoutes = require('./routes/gameRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

const questRoutes = require('./routes/questRoutes');
app.use('/api/quest', questRoutes);

const achievementRoutes = require('./routes/achievementRoutes');
app.use('/api/achievement', achievementRoutes);

const documentRoutes = require('./routes/documentRoutes');
app.use('/api/document', documentRoutes);

app.get('/', (req, res) => {
    res.send('Máy chủ Backend MathQuest đang hoạt động bình thường!');
});

const { chatWithAssistant } = require('./controllers/aiController');
app.post('/api/ai/chat', chatWithAssistant);

const chessHandler = require('./socket/chessHandler');
chessHandler(io);

const othelloHandler = require('./socket/othelloHandler');
othelloHandler(io);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi máy chủ nội bộ'
    });
});

module.exports = { app, server, io };
