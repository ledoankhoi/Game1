// src/pages/Profile/TabFeedback.jsx
import React, { useState } from 'react';

function TabFeedback() {
  // Toàn bộ logic và state của phần Góp ý được chuyển sang đây
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return setFeedbackStatus({ type: 'error', message: 'Bạn chưa nhập nội dung mà!' });
    
    setIsSubmitting(true);
    setFeedbackStatus({ type: '', message: '' });
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: feedbackText })
      });
      const data = await res.json();
      
      if (data.success) {
        setFeedbackStatus({ type: 'success', message: data.message });
        setFeedbackText(''); 
      } else {
        setFeedbackStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedbackStatus({ type: 'error', message: 'Lỗi kết nối. Vui lòng thử lại sau.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a2e20] rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 mb-4">
          <span className="material-symbols-outlined text-4xl">mark_email_read</span>
        </div>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-2">Gửi Thư Cho Nhà Phát Triển</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Bạn gặp lỗi? Bạn muốn có thêm tính năng mới? Hãy cho chúng tôi biết nhé!</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <textarea 
          value={feedbackText} 
          onChange={(e) => setFeedbackText(e.target.value)} 
          placeholder="Nhập nội dung góp ý của bạn vào đây (tối thiểu 10 ký tự)..." 
          className="w-full p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f1a14] text-gray-800 dark:text-white focus:border-primary outline-none transition-all resize-none min-h-[150px]"
        ></textarea>
        
        {feedbackStatus.message && (
          <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${feedbackStatus.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            <span className="material-symbols-outlined">{feedbackStatus.type === 'success' ? 'check_circle' : 'error'}</span>
            {feedbackStatus.message}
          </div>
        )}
        
        <button 
          onClick={handleFeedbackSubmit} 
          disabled={isSubmitting} 
          className="w-full md:w-auto self-end bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'send'}</span>
          {isSubmitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}
        </button>
      </div>
    </div>
  );
}

export default TabFeedback;