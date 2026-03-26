import React, { useState, useRef, useEffect } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Chào bạn! Mình là trợ lý AI của MathQuest. Bạn cần giúp gì về game hay cách kiếm xu không?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    // Thêm tin nhắn của user vào giao diện
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      // Gọi API sang Backend của bạn
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Thêm câu trả lời của AI vào giao diện
        setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: "Xin lỗi, đường truyền đang bị lỗi. Bạn thử lại sau nhé!", isBot: true }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: "Mất kết nối tới máy chủ AI!", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-white dark:bg-[#1a2e20] rounded-2xl shadow-2xl flex flex-col h-[450px] border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 scale-100 origin-bottom-right">
          
          {/* Header Chatbot */}
          <div className="bg-primary text-white p-4 font-bold flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
              <span>Trợ lý MathQuest</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-300 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          
          {/* Khu vực hiển thị tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#f9fafb] dark:bg-[#0f1a14]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isBot 
                    ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none' 
                    : 'bg-primary text-white rounded-tr-none'
                }`}>
                  {/* Hiển thị markdown cơ bản (xuống dòng) */}
                  {msg.text.split('\n').map((line, idx) => (
                    <span key={idx}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-500 text-xs italic p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm">cycle</span> AI đang suy nghĩ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khu vực nhập tin nhắn */}
          <div className="p-3 bg-white dark:bg-[#1a2e20] border-t border-gray-200 dark:border-gray-700 flex gap-2 items-center">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Hỏi mình về game..." 
              className="flex-1 bg-[#f0f5f1] dark:bg-[#0f1a14] border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-[#1a2e20] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400"
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-green-500 disabled:bg-gray-400 text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      ) : (
        /* Nút tròn bong bóng khi đóng Chatbot */
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-primary hover:bg-green-500 text-white w-14 h-14 rounded-full shadow-lg shadow-green-500/40 flex justify-center items-center hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-3xl">chat</span>
        </button>
      )}
    </div>
  );
}

export default Chatbot;