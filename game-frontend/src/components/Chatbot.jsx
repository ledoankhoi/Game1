import React, { useState, useRef, useEffect } from 'react';

const API_BASE = '/api';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Chào bạn! Mình là trợ lý AI của MathQuest. Bạn cần giúp gì về game hay cách kiếm xu không? Ngoài ra mình cũng có thể đọc file PDF, Word, Excel,... bạn upload nhé!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const playBotSound = (isEasterEgg = false) => {
    const soundUrl = isEasterEgg ? '/sounds/tuhoang7444.mp3' : '/sounds/clicek_test.mp3';
    const audio = new Audio(soundUrl);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setMessages(prev => [...prev, {
      text: `📎 Đã chọn file: **${file.name}** (${(file.size / 1024).toFixed(1)} KB)`,
      isBot: false,
      isFile: true
    }]);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    const hasText = input.trim();
    const hasFile = uploadedFile;

    if (!hasText && !hasFile) return;

    const userMsg = hasText ? input.trim() : `[Đã upload file: ${uploadedFile.name}]`;
    const lowerCaseMsg = userMsg.toLowerCase();

    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");
    setIsLoading(true);

    const isEasterEgg = lowerCaseMsg.includes("tú là ai") || lowerCaseMsg.includes("tu la ai");

    try {
      let data;

      if (hasFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        if (hasText) formData.append('message', userMsg);

        const res = await fetch(`${API_BASE}/document/chat`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });

        data = await res.json();
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const res = await fetch(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ message: userMsg })
        });

        data = await res.json();
      }

      if (data.success) {
        playBotSound(isEasterEgg);
        const replyText = data.fileName
          ? `📄 **${data.fileName}**\n\n${data.reply}`
          : data.reply;
        setMessages(prev => [...prev, { text: replyText, isBot: true }]);
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
        <div className="w-80 sm:w-96 bg-white dark:bg-[#1a2e20] rounded-2xl shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 scale-100 origin-bottom-right">

          <div className="bg-primary text-white p-4 font-bold flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
              <span>Trợ lý MathQuest</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-300 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#f9fafb] dark:bg-[#0f1a14]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isBot
                    ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                    : 'bg-primary text-white rounded-tr-none'
                }`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <span key={idx}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-500 text-xs italic p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  {uploadedFile ? (
                    <>📄 Đang xử lý file... AI đang suy nghĩ...</>
                  ) : (
                    <><span className="material-symbols-outlined animate-spin text-sm">cycle</span> AI đang suy nghĩ...</>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {uploadedFile && (
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2">
              <span className="text-xs text-blue-700 dark:text-blue-300 truncate flex-1">
                📎 {uploadedFile.name}
              </span>
              <button onClick={removeFile} className="text-red-500 hover:text-red-700 text-xs font-bold">
                ✕
              </button>
            </div>
          )}

          <div className="p-3 bg-white dark:bg-[#1a2e20] border-t border-gray-200 dark:border-gray-700 flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.html,.htm,.csv,.json,.xml,.txt,.md,.epub"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title="Đính kèm file (PDF, Word, Excel,...)"
            >
              <span className="material-symbols-outlined text-lg">attach_file</span>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Hỏi mình về game hoặc upload file..."
              className="flex-1 bg-[#f0f5f1] dark:bg-[#0f1a14] border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-[#1a2e20] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !uploadedFile)}
              className="bg-primary hover:bg-green-500 disabled:bg-gray-400 text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      ) : (
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
