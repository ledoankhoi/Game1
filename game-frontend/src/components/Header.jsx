import React, { useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import AvatarDisplay from './AvatarDisplay';
import { createFloatingCoin } from '../utils/animations';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setShowAuth = useAuthStore((s) => s.setShowAuth);
  const setIsLoginMode = useAuthStore((s) => s.setIsLoginMode);
  const logoRef = useRef(null);
  const coinRef = useRef(null);
  const navRef = useRef(null);
  const coinValueRef = useRef(null);
  const prevCoinsRef = useRef(user?.coins ?? user?.coin ?? 0);
  const unreadCounts = useNotificationStore((s) => s.unreadCounts);
  const chatUnread = Object.entries(unreadCounts)
    .filter(([k]) => !k.startsWith('guild:'))
    .reduce((sum, [, n]) => sum + n, 0);
  const guildUnread = Object.entries(unreadCounts)
    .filter(([k]) => k.startsWith('guild:'))
    .reduce((sum, [, n]) => sum + n, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  useGSAP(() => {
    gsap.fromTo(logoRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
    if (navRef.current?.children?.length) gsap.fromTo(navRef.current.children, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 });
  }, []);

  useEffect(() => {
    const currentCoins = user?.coins ?? user?.coin ?? 0;
    const prevCoins = prevCoinsRef.current;
    if (coinValueRef.current && user) {
      gsap.fromTo(coinValueRef.current, { scale: 1.3, color: '#facc15' }, { scale: 1, color: '#fff', duration: 0.4, ease: 'power2.out', onComplete: () => { coinValueRef.current.style.color = ''; } });
    }
    if (currentCoins > prevCoins && coinRef.current) {
      createFloatingCoin(coinRef.current, currentCoins - prevCoins);
    }
    prevCoinsRef.current = currentCoins;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.coins, user?.coin]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1a2e20]/95 backdrop-blur-md border-b border-[#e0e8e2] dark:border-[#2a3f31] px-4 md:px-6 py-3 flex items-center justify-between gap-4 shadow-sm h-auto md:h-20 flex-wrap md:flex-nowrap">
      
      {/* Logo */}
      <Link ref={logoRef} to="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
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
      
      {/* Nút bấm bên phải */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0 order-2 md:order-none">
        
        <div ref={navRef} className="flex items-center gap-1 md:mr-2">
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

          <Link to="/discover" className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-bold group">
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">explore</span>
            <span className="hidden lg:block">Khám Phá</span>
          </Link>

          <Link to="/social" className="relative flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-bold group">
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">forum</span>
            <span className="hidden lg:block">Social</span>
            {chatUnread > 0 && (
              <span className="absolute -top-1 -right-1 md:static md:flex md:items-center md:justify-center md:min-w-[20px] md:h-5 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full leading-none shadow-md">
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
          </Link>

          <Link to="/guild" className="relative flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#233829] text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-bold group">
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">military_tech</span>
            <span className="hidden lg:block">Guild</span>
            {guildUnread > 0 && (
              <span className="absolute -top-1 -right-1 md:static md:flex md:items-center md:justify-center md:min-w-[20px] md:h-5 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full leading-none shadow-md">
                {guildUnread > 99 ? '99+' : guildUnread}
              </span>
            )}
          </Link>
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

        {!user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => { setShowAuth(true); setIsLoginMode(true); }} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors px-2">Log In</button>
            <button onClick={() => { setShowAuth(true); setIsLoginMode(false); }} className="bg-primary hover:bg-green-500 text-white text-sm font-bold px-3 py-2 md:px-5 md:py-2.5 rounded-xl shadow-lg shadow-green-500/30 transition-all transform active:scale-95 hover:-translate-y-0.5 whitespace-nowrap">Sign Up</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-6">
            <div ref={coinRef} className="bg-white dark:bg-[#0f1a14] border border-gray-100 dark:border-gray-700 pl-2 pr-2 md:pr-4 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-2 shadow-sm cursor-pointer hover:border-yellow-400 transition-colors" onClick={() => navigate('/shop')}>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full">
                <span className="material-symbols-outlined text-[#facc15] text-lg md:text-xl block">monetization_on</span>
              </div>
              <span ref={coinValueRef} className="text-xs md:text-sm font-black text-gray-800 dark:text-white tracking-wide">{user.coins || user.coin || 0}</span>
            </div>

            {/* NÚT AVATAR ĐẦY ĐỦ KHUNG & HUY HIỆU */}
            <div className="relative flex items-center gap-2 md:gap-3 group">
              <Link to="/profile" className="relative flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity" title="Vào trang Hồ Sơ">
                <span className="font-bold text-gray-800 dark:text-white hidden lg:block text-sm">Chào, {user.username}</span>
                
                <AvatarDisplay user={user} size="md" />
              </Link>
              <button onClick={handleLogout} className="text-[10px] md:text-xs text-red-500 font-bold hover:underline px-1 md:px-2">Đăng xuất</button>
            </div>

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;