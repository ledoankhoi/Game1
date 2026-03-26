const { GoogleGenerativeAI } = require("@google/generative-ai");
const Knowledge = require('../models/Knowledge'); // Gọi Model vào
require('dotenv').config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. KÉO TOÀN BỘ KIẾN THỨC DỰ ÁN TỪ MONGODB
    const knowledgeBase = await Knowledge.find();
    
    // 2. CHUYỂN ĐỔI DATA THÀNH ĐOẠN VĂN BẢN CHO AI ĐỌC
    let projectContext = "";
    knowledgeBase.forEach(item => {
        projectContext += `- [${item.category}] ${item.title}: ${item.content}\n`;
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. NHÚNG CSDL VÀO PROMPT
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

    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("Lỗi AI Chatbot:", error); 
    res.status(500).json({ success: false, message: "Lỗi kết nối AI." });
  }
};