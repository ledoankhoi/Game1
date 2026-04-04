import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Import Các Trang
import Home from './pages/Home';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard'; 
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer'; 
import Chatbot from './components/Chatbot';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

  // --- QUẢN LÝ USER ---
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
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  useEffect(() => {
    setSearchQuery(''); // Xóa thanh tìm kiếm khi chuyển trang
  }, [location.pathname]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_avatar_custom'); 
    navigate('/'); 
    window.location.reload(); 
  };

  return (
    <div id="app-lobby" className="relative flex flex-col w-full min-h-screen bg-[#f9f9f9] dark:bg-[#141516] transition-colors duration-300">
      
      {/* HEADER */}
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        handleLogout={handleLogout}
        setShowAuth={setShowAuth}
        setIsLoginMode={setIsLoginMode}
      />

      {/* KHU VỰC THAY ĐỔI TRANG (MAIN CONTENT) */}
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

      {/* CÁC THÀNH PHẦN NỔI */}
      <Chatbot />

      {/* FOOTER (Style Poki) */}
      <Footer />

      {/* BẢNG ĐĂNG NHẬP (MODALS) */}
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
      
    </div>
  );
}

export default App;