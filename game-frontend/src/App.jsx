import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { animatePageIn } from './utils/animations';
import useAuthStore from './store/useAuthStore';

// Import Các Trang
import Home from './pages/Home';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard'; 
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import FAQ from './pages/FAQ';
import PrivacyCenter from './pages/PrivacyCenter';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer'; 
import Chatbot from './components/Chatbot';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const mainRef = useRef(null);
  const authRef = useRef(null);
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const showAuth = useAuthStore((s) => s.showAuth);
  const isLoginMode = useAuthStore((s) => s.isLoginMode);
  const syncUser = useAuthStore((s) => s.syncUser);

  useGSAP(() => {
    if (mainRef.current) animatePageIn(mainRef);
  }, [location.pathname]);

  useGSAP(() => {
    if (showAuth && authRef.current) {
      gsap.fromTo(authRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' });
      const authModal = authRef.current.querySelector('.auth-modal');
      if (authModal) gsap.fromTo(authModal, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)', delay: 0.05 });
    }
  }, [showAuth]);

  const isAboutPage = location.pathname === '/about';

  useEffect(() => {
    const handleStorage = () => syncUser();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [syncUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery('');
  }, [location.pathname]);

  if (isAboutPage) {
    return (
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>
    );
  }

  return (
    <div id="app-lobby" className="relative flex flex-col w-full min-h-screen bg-[#f9f9f9] dark:bg-[#141516] transition-colors duration-300">
      
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main ref={mainRef} className="flex flex-1 flex-col w-full p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} />} />          
          <Route path="/shop" element={<Shop searchQuery={searchQuery} />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyCenter />} />
          <Route path="/admin" element={<AdminDashboard />} /> 
          <Route path="*" element={<h1 className="text-center text-2xl mt-10">404 - Không tìm thấy trang</h1>} />
        </Routes>
      </main>

      {user && <Chatbot />}

      <Footer />

      {showAuth && (
        <section ref={authRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          {isLoginMode ? (
            <Login />
          ) : (
            <Register />
          )}
        </section>
      )}
      
    </div>
  );
}

export default App;