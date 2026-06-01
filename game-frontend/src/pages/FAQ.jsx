import React, { useState } from 'react';

const faqs = [
  {
    q: 'MathQuest là gì?',
    a: 'MathQuest là nền tảng game toán học kết hợp hệ thống RPG. Bạn có thể chơi các game tư duy, kiếm Coin, EXP và tăng Level.'
  },
  {
    q: 'Làm thế nào để bắt đầu chơi?',
    a: 'Bạn chỉ cần đăng ký tài khoản (hoặc đăng nhập), sau đó vào mục Shop để mua vật phẩm hoặc chọn game bất kỳ từ trang chủ để bắt đầu.'
  },
  {
    q: 'Coin dùng để làm gì?',
    a: 'Coin dùng để mua vật phẩm trong Shop như avatar, chủ đề màu sắc, và các phần thưởng đặc biệt khác.'
  },
  {
    q: 'Làm sao để kiếm thêm Coin?',
    a: 'Bạn kiếm Coin bằng cách hoàn thành game, đạt thành tích cao, leo rank trên Leaderboard, và tham gia các sự kiện đặc biệt.'
  },
  {
    q: 'EXP và Level hoạt động thế nào?',
    a: 'Mỗi game bạn chơi sẽ tích lũy EXP. Khi đủ EXP, bạn lên Level và mở khóa thêm nhiều tính năng mới.'
  },
  {
    q: 'Tôi có thể chơi trên điện thoại không?',
    a: 'Có. MathQuest được thiết kế responsive, hoạt động tốt trên cả máy tính và thiết bị di động.'
  },
  {
    q: 'Làm sao để liên hệ hỗ trợ?',
    a: 'Bạn có thể gửi email đến support@mathquest.com hoặc theo dõi chúng tôi trên Facebook, Zalo để được hỗ trợ nhanh nhất.'
  },
  {
    q: 'Dữ liệu của tôi có an toàn không?',
    a: 'Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt. Xem chi tiết tại Trung tâm Bảo mật.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <span className="material-symbols-outlined text-5xl text-primary mb-4">quiz</span>
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Câu hỏi thường gặp</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Những thắc mắc phổ biến về MathQuest</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#1a2e20] border border-[#e0e8e2] dark:border-[#2a3f31] rounded-2xl overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-800 dark:text-white"
            >
              <span>{faq.q}</span>
              <span className={`material-symbols-outlined transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
