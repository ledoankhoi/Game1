import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import UserProfile from './pages/UserProfile';
import Leaderboard from './pages/Leaderboard'; 
import { GoogleLogin } from '@react-oauth/google';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  // Load user từ localStorage khi F5
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleRegister = async () => {
    setAuthMessage("Đang xử lý...");
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (data.success) {
        setAuthMessage("Đăng ký thành công! Hãy đăng nhập.");
        setIsLoginMode(true);
      } else {
        setAuthMessage(data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      setAuthMessage("Lỗi kết nối tới máy chủ!");
    }
  };

  const handleLogin = async () => {
    setAuthMessage("Đang xử lý...");
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setShowAuth(false);
        setAuthMessage("");
        setEmail("");
        setPassword("");
      } else {
        setAuthMessage(data.message || "Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      setAuthMessage("Lỗi kết nối tới máy chủ!");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setAuthMessage("Đang xác thực với Google...");
    try {
      const response = await fetch('http://localhost:3000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setShowAuth(false);
        setAuthMessage("");
      } else {
        setAuthMessage("Xác thực Google thất bại!");
      }
    } catch (error) {
      setAuthMessage("Lỗi kết nối tới máy chủ!");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_avatar_custom'); // Xóa luôn ảnh custom nếu đăng xuất
    navigate('/'); // Đẩy về trang chủ
  };

  return (
    <div id="app-lobby" className="relative flex flex-col w-full min-h-screen">
      {/* HEADER TỔNG */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1a2e20] border-b border-[#e0e8e2] dark:border-[#2a3f31] px-6 py-3 flex items-center justify-between gap-4 shadow-sm h-20">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="bg-primary p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-3xl">calculate</span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-gray-800 dark:text-white uppercase">
            Math<span className="text-primary">Quest</span>
          </h2>
        </Link>

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-2xl px-4 lg:px-12 hidden md:block">
          <form autoComplete="off" className="relative group w-full" onSubmit={(e) => e.preventDefault()}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-2xl">search</span>
            </span>
            <input type="search" className="w-full pl-12 pr-4 py-3 bg-[#f0f5f1] dark:bg-[#0f1a14] border-2 border-transparent focus:bg-white dark:focus:bg-[#1a2e20] focus:border-primary/50 rounded-2xl text-base focus:ring-4 focus:ring-primary/10 transition-all shadow-inner placeholder-gray-400 text-gray-800 dark:text-white" placeholder="Search for games..." />
          </form>
        </div>
        
        {/* Nút bấm bên phải */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1 mr-2">
            <Link to="/leaderboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-yellow-600 transition-colors font-bold group">
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">emoji_events</span>
              <span className="hidden lg:block">Rank</span>
            </Link>

            <Link to="/shop" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors font-bold group">
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">storefront</span>
              <span className="hidden lg:block">Shop</span>
            </Link>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

          {!user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowAuth(true); setIsLoginMode(true); setAuthMessage(""); }} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors px-2">Log In</button>
              <button onClick={() => { setShowAuth(true); setIsLoginMode(false); setAuthMessage(""); }} className="bg-primary hover:bg-green-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-green-500/30 transition-all transform active:scale-95 hover:-translate-y-0.5">Sign Up</button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="bg-white dark:bg-[#0f1a14] border border-gray-100 dark:border-gray-700 pl-2 pr-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm cursor-pointer hover:border-yellow-400 transition-colors" onClick={() => navigate('/shop')}>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full">
                  <span className="material-symbols-outlined text-[#facc15] text-xl block">monetization_on</span>
                </div>
                <span className="text-sm font-black text-gray-800 dark:text-white tracking-wide">{user.coins || user.coin || 0}</span>
              </div>

              {/* NÚT AVATAR ĐÃ ĐƯỢC BỌC TRONG <Link> ĐỂ BẤM ĐƯỢC */}
              <div className="relative flex items-center gap-3 group">
                <Link to="/profile" className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity" title="Vào trang Hồ Sơ">
                  <span className="font-bold text-gray-800 dark:text-white hidden sm:block">Chào, {user.username}</span>
                  <img 
                    src={localStorage.getItem('user_avatar_custom') || user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.equippedSkin !== 'default' ? user.equippedSkin : user.username}`} 
                    className="w-10 h-10 rounded-full border-2 border-primary shadow-sm bg-white object-cover" 
                    alt="Avatar" 
                  />
                </Link>
                <button onClick={handleLogout} className="text-xs text-red-500 font-bold hover:underline px-2">Đăng xuất</button>
              </div>

            </div>
          )}
        </div>
      </header>

      {/* KHU VỰC THAY ĐỔI TRANG */}
      <main className="flex flex-1 flex-col max-w-[1600px] mx-auto w-full p-4 lg:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} /> 
          <Route path="*" element={<h1 className="text-center text-2xl mt-10">404 - Không tìm thấy trang</h1>} />
        </Routes>
      </main>

      {/* BẢNG ĐĂNG NHẬP (CÓ NÚT GOOGLE) */}
      <section id="auth-screen" className={`modal-overlay ${showAuth ? '' : 'hidden'}`}>
        <div className="bg-white dark:bg-[#1a2e20] p-8 rounded-2xl w-full max-w-sm shadow-2xl relative">
          <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            {isLoginMode ? "Login" : "Create Account"}
          </h2>
          
          <div className="flex flex-col gap-3">
            {!isLoginMode && (
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none transition focus:ring-2 focus:ring-primary" />
            )}
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          
          <p className="text-red-500 text-center text-sm mt-3 h-5 font-medium">{authMessage}</p>
          
          {/* Nút Login / Register mặc định */}
          <button onClick={isLoginMode ? handleLogin : handleRegister} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-4 hover:bg-green-600 transition shadow-lg shadow-green-500/30 uppercase">
            {isLoginMode ? "Login" : "Register"}
          </button>

          {/* --- NÚT GOOGLE ĐƯỢC CHÈN VÀO ĐÂY --- */}
          <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-sm text-gray-400 font-bold uppercase">Hoặc</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setAuthMessage('Cửa sổ Google bị đóng hoặc lỗi!');
                }}
                theme="filled_blue"
                shape="pill"
              />
          </div>
          {/* ----------------------------------- */}

          <p className="text-center text-sm mt-6 text-gray-500">
            <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span> 
            <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthMessage(""); }} className="text-primary font-bold hover:underline ml-1">Click here</button>
          </p>

        </div>
      </section>
    </div>
  );
}

export default App;