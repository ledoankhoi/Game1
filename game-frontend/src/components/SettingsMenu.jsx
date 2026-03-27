import React, { useState } from 'react';

// DANH SÁCH HÌNH NỀN GỢI Ý (Dùng ảnh từ kho Unsplash chất lượng cao)
const WALLPAPERS = [
  { 
    id: 'default', 
    name: 'Mặc định (Trắng)', 
    url: 'none', 
    thumb: '' // Trắng trơn
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk Neon', 
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000', 
    thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200' 
  },
  { 
    id: 'space', 
    name: 'Vũ trụ Không gian', 
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000', 
    thumb: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=200' 
  },
  { 
    id: 'dark-abstract', 
    name: 'Tối giản Trừu tượng', 
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000', 
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200' 
  },
  { 
    id: 'math-board', 
    name: 'Bảng Toán học', 
    url: 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a426?q=80&w=2000', 
    thumb: 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a426?q=80&w=200' 
  },
  { 
    id: 'forest', 
    name: 'Rừng nhiệt đới', 
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000', 
    thumb: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=200' 
  }
];

export default function SettingsMenu({ pageBgImage, setPageBgImage }) {
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('vi');

  return (
    <div className="fixed bottom-8 left-8 z-50">
      
      {showSettings && (
        <div className="absolute bottom-16 left-0 mb-4 w-80 bg-[#1a1c20]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transition-all">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="material-symbols-outlined text-primary">settings</span>
            Cài đặt chung
          </h3>
          
          {/* ======================================================= */}
          {/* 1. BẢNG CHỌN HÌNH NỀN (WALLPAPER) */}
          {/* ======================================================= */}
          <div className="mb-5">
            <label className="text-gray-400 text-sm block mb-3 font-medium">Chọn hình nền trang web:</label>
            
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => setPageBgImage(wp.url)}
                  className="relative h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 shadow-sm group"
                  style={{ 
                    borderColor: pageBgImage === wp.url ? '#25f46a' : 'transparent',
                    backgroundColor: wp.url === 'none' ? '#ffffff' : '#232528'
                  }}
                  title={wp.name}
                >
                  {/* Hiển thị ảnh Thumbnail */}
                  {wp.thumb && (
                    <img 
                      src={wp.thumb} 
                      alt={wp.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                  {/* Dấu check khi đang được chọn */}
                  {pageBgImage === wp.url && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary drop-shadow-md font-bold">check</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Chức năng chèn Link ảnh tùy chọn cho người dùng tự do sáng tạo */}
            <div className="mt-4 flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5">
              <span className="material-symbols-outlined text-gray-400 text-sm pl-1">link</span>
              <input 
                type="text" 
                placeholder="Dán link ảnh bất kỳ..."
                value={pageBgImage !== 'none' ? pageBgImage : ''} 
                onChange={(e) => setPageBgImage(e.target.value || 'none')}
                className="w-full bg-transparent text-gray-300 text-sm outline-none px-2"
              />
            </div>
          </div>
          {/* ======================================================= */}

          <hr className="border-white/10 my-4" />

          {/* 2. Cài đặt Âm thanh */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              Âm thanh
            </span>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-primary' : 'bg-gray-600'}`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} 
              />
            </button>
          </div>

          {/* 3. Cài đặt Ngôn ngữ */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">language</span>
              Ngôn ngữ
            </span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black/30 text-white text-sm border border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <hr className="border-white/10 my-4" />

          {/* 4. Giới thiệu & Điều khoản */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => alert("Chức năng hiển thị Giới thiệu đang được phát triển!")}
              className="text-gray-400 hover:text-white text-sm text-left flex items-center gap-2 transition-colors w-full"
            >
              <span className="material-symbols-outlined text-lg">info</span>
              Giới thiệu MathQuest
            </button>
            <button 
              onClick={() => alert("Chức năng hiển thị Điều khoản bảo mật đang được phát triển!")}
              className="text-gray-400 hover:text-white text-sm text-left flex items-center gap-2 transition-colors w-full"
            >
              <span className="material-symbols-outlined text-lg">privacy_tip</span>
              Điều khoản bảo mật
            </button>
          </div>
        </div>
      )}

      {/* Nút cài đặt hiển thị bên ngoài */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 border border-white/10 ${
          showSettings 
            ? 'bg-primary text-[#111813] rotate-90 scale-110' 
            : 'bg-[#232528] hover:bg-[#2a2d32] hover:scale-105'
        }`}
        title="Cài đặt hệ thống"
      >
        <span className="material-symbols-outlined text-[28px]">
          {showSettings ? 'close' : 'settings'}
        </span>
      </button>
    </div>
  );
}