const { GoogleGenerativeAI } = require("@google/generative-ai");
const Knowledge = require('../models/Knowledge');
const ChatRule = require('../models/ChatRule');
const ChatHistory = require('../models/ChatHistory'); // 1. Gọi Model ChatHistory
const jwt = require('jsonwebtoken');                  // 2. Gọi thư viện JWT
require('dotenv').config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn' });
    }

    // =========================================================
    // A. TRÍCH XUẤT THÔNG TIN TÀI KHOẢN TỪ TOKEN
    // =========================================================
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Giải mã token để lấy ID của user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || decoded._id; 
      } catch (err) {
        // Nếu token hết hạn hoặc sai, cứ coi như là khách ẩn danh (không cản trở việc chat)
        console.log("Chatbot: User ẩn danh hoặc token không hợp lệ.");
      }
    }

    // =========================================================
    // B. KIỂM TRA TỪ KHÓA BÍ MẬT (EASTER EGGS)
    // =========================================================
    const lowerCaseMsg = message.toLowerCase();
    const activeRules = await ChatRule.find({ isActive: true });
    
    let specialResponse = null;
    for (const rule of activeRules) {
      if (lowerCaseMsg.includes(rule.keyword.toLowerCase())) {
        specialResponse = rule.response;
        break; 
      }
    }

    if (specialResponse) {
      // --> LƯU LỊCH SỬ CHAT VÀO DB (LOẠI EASTER EGG) <--
      await ChatHistory.create({
        userId: userId,
        userMessage: message,
        aiReply: specialResponse,
        isEasterEgg: true
      });

      return res.json({ success: true, reply: specialResponse });
    }

    // =========================================================
    // C. NẾU KHÔNG CÓ TỪ KHÓA BÍ MẬT -> GỌI AI NHƯ BÌNH THƯỜNG
    // =========================================================
    const knowledgeBase = await Knowledge.find();
    
    let projectContext = "";
    knowledgeBase.forEach(item => {
        projectContext += `- [${item.category}] ${item.title}: ${item.content}\n`;
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const finalPrompt = `Bạn là trợ lý ảo thân thiện và cực kỳ thông minh của cổng game MathQuest. 
Nhiệm vụ của bạn là tư vấn, hướng dẫn và giới thiệu thông tin dự án cho người chơi.

[LƯU Ý TỐI QUAN TRỌNG VỀ NGÔN NGỮ]: 
Người chơi thường xuyên nhắn tin bằng "tiếng Việt không dấu". BẠN TUYỆT ĐỐI KHÔNG trả lời bằng tiếng Việt không dấu. LUÔN LUÔN trả lời bằng tiếng Việt CÓ DẤU, tự nhiên và thân thiện.

[CƠ SỞ DỮ LIỆU CỦA DỰ ÁN]:
Dưới đây là toàn bộ dữ liệu hệ thống được trích xuất từ Database. Hãy dùng thông tin này để trả lời chính xác mọi câu hỏi của người dùng:
\n${projectContext}\n

[KỸ NĂNG BẮT BUỘC]:
- Nếu người chơi hỏi về một game chưa có trong CSDL, hãy xin lỗi và giới thiệu các game đang có.
- Trả lời ngắn gọn, chia đoạn dễ nhìn, dùng vài emoji cho sinh động.

Người chơi vừa hỏi: "${message}"`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // --> LƯU LỊCH SỬ CHAT VÀO DB (LOẠI BÌNH THƯỜNG) <--
    await ChatHistory.create({
      userId: userId,
      userMessage: message,
      aiReply: text,
      isEasterEgg: false
    });

    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("Lỗi AI Chatbot:", error); 
    res.status(500).json({ success: false, message: "Lỗi kết nối AI." });
  }
};