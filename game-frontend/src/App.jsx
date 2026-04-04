import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard'; 
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Chatbot from './components/Chatbot';

// 1. Nhập các component Auth mới của bạn
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Đã xóa bỏ các state email, password, authMessage... vì logic này giờ nằm trong Login/Register.jsx
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation(); 

  // Hàm load User và đồng bộ hóa tự động
  const loadUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser(); 
    // Lắng nghe sự kiện storage để cập nhật user khi có thay đổi từ các modal auth
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_avatar_custom'); 
    navigate('/'); 
    window.location.reload(); // Tải lại để xóa sạch trạng thái cũ
  };

  // --- HELPER CSS CHO HEADER AVATAR ---
  const getFrameStyleApp = (frameId) => {
    if (frameId === 'frame_gold') return "border-2 border-yellow-400 shadow-[0_0_10px_#facc15]";
    if (frameId === 'frame_neon') return "border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]";
    if (frameId === 'frame_fire') return "border-2 border-red-500 shadow-[0_0_10px_#ef4444]";
    return "border-2 border-primary shadow-sm"; 
  };

  const getBadgeIconApp = (badgeId) => {
    switch(badgeId) {
      case 'rookie': return { icon: 'verified', color: 'text-orange-500' };
      case 'firstBlood': return { icon: 'sports_esports', color: 'text-blue-500' };
      case 'richMan': return { icon: 'monetization_on', color: 'text-yellow-500' };
      case 'streak7': return { icon: 'local_fire_department', color: 'text-red-500' };
      default: return { icon: 'stars', color: 'text-yellow-500' };
    }
  };

  return (
    <div id="app-lobby" className="relative flex flex-col w-full min-h-screen">
      {/* HEADER TỔNG */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1a2e20] border-b border-[#e0e8e2] dark:border-[#2a3f31] px-4 md:px-6 py-3 flex items-center justify-between gap-4 shadow-sm h-auto md:h-20 flex-wrap md:flex-nowrap">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="bg-primary p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-3xl">calculate</span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-gray-800 dark:text-white uppercase hidden sm:block">
            Math<span className="text-primary">Quest</span>
          </h2>
        </Link>

        {/* --- THANH TÌM KIẾM --- */}
        <div className="flex-1 w-full md:w-auto max-w-2xl px-2 lg:px-12 order-3 md:order-none mt-3 md:mt-0">
          <div className="relative group w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-2xl">search</span>
            </span>
            
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-2.5 md:py-3 bg-[#f0f5f1] dark:bg-[#0f1a14] border-2 border-transparent focus:bg-white dark:focus:bg-[#1a2e20] focus:border-primary/50 rounded-2xl text-base focus:ring-4 focus:ring-primary/10 transition-all shadow-inner placeholder-gray-400 text-gray-800 dark:text-white outline-none" 
              placeholder={location.pathname.includes('/shop') ? "Tìm kiếm vật phẩm..." : "Tìm kiếm tựa game..."} 
            />
            
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Nút bấm bên phải Header */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0 order-2 md:order-none">
          
          <div className="flex items-center gap-1 md:mr-2">
            {user && user.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors font-bold group">
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">admin_panel_settings</span>
                <span className="hidden lg:block">Admin</span>
              </Link>
            )}
            
            <Link to="/leaderboard" className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-yellow-600 transition-colors font-bold group">
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">emoji_events</span>
              <span className="hidden lg:block">Rank</span>
            </Link>

            <Link to="/shop" className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors font-bold group">
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">storefront</span>
              <span className="hidden lg:block">Shop</span>
            </Link>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

          {/* 2. CHỖ THAY ĐỔI: Sử dụng state để mở Modal thay vì gọi hàm trực tiếp ở đây */}
          {!user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => { setShowAuth(true); setIsLoginMode(true); }} 
                className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors px-2"
              >
                Log In
              </button>
              <button 
                onClick={() => { setShowAuth(true); setIsLoginMode(false); }} 
                className="bg-primary hover:bg-green-500 text-white text-sm font-bold px-3 py-2 md:px-5 md:py-2.5 rounded-xl shadow-lg shadow-green-500/30 transition-all transform active:scale-95 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-6">
              <div className="bg-white dark:bg-[#0f1a14] border border-gray-100 dark:border-gray-700 pl-2 pr-2 md:pr-4 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-2 shadow-sm cursor-pointer hover:border-yellow-400 transition-colors" onClick={() => navigate('/shop')}>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full">
                  <span className="material-symbols-outlined text-[#facc15] text-lg md:text-xl block">monetization_on</span>
                </div>
                <span className="text-xs md:text-sm font-black text-gray-800 dark:text-white tracking-wide">{user.coins || user.coin || 0}</span>
              </div>

              <div className="relative flex items-center gap-2 md:gap-3 group">
                <Link to="/profile" className="relative flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity" title="Vào trang Hồ Sơ">
                  <span className="font-bold text-gray-800 dark:text-white hidden lg:block text-sm">Chào, {user.username}</span>
                  
                  <img 
                    src={user.avatarUrl || localStorage.getItem('user_avatar_custom') || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-white transition-all ${getFrameStyleApp(user.equipped?.frame)}`} 
                    alt="Avatar" 
                  />

                  {user.equipped?.badge && user.equipped.badge !== 'none' && (
                    <div className="absolute -top-1 -right-1 z-20 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-md transform rotate-12">
                      <span className={`material-symbols-outlined text-[10px] md:text-[12px] ${getBadgeIconApp(user.equipped.badge).color}`}>
                        {getBadgeIconApp(user.equipped.badge).icon}
                      </span>
                    </div>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-[10px] md:text-xs text-red-500 font-bold hover:underline px-1 md:px-2">Đăng xuất</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* NỘI DUNG TRANG CHỦ / SHOP / RANK... */}
      <main className="flex flex-1 flex-col max-w-[1600px] mx-auto w-full p-4 lg:p-8">
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} user={user} setShowAuth={setShowAuth} />} />          
          <Route path="/shop" element={<Shop searchQuery={searchQuery} />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminDashboard />} /> 
          <Route path="*" element={<h1 className="text-center text-2xl mt-10">404 - Không tìm thấy trang</h1>} />
        </Routes>
      </main>

      {/* 3. KHU VỰC QUAN TRỌNG NHẤT: NHÚNG 2 COMPONENT RIÊNG CỦA BẠN VÀO ĐÂY */}
      {showAuth && (
        <section className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          {isLoginMode ? (
            <Login 
              onClose={() => setShowAuth(false)} 
              onSwitchToRegister={() => setIsLoginMode(false)} 
            />
          ) : (
            <Register 
              onClose={() => setShowAuth(false)} 
              onSwitchToLogin={() => setIsLoginMode(true)} 
            />
          )}
        </section>
      )}

      <Chatbot />
    </div>
  );
}

export default App;