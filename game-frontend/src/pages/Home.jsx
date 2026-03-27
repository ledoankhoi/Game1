import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SettingsMenu from '../components/SettingsMenu';

function Home({ searchQuery = '', user, setShowAuth }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // SỬA TẠI ĐÂY: Đổi tên từ pageBgColor thành pageBgImage để khớp với logic bên dưới
  const [pageBgImage, setPageBgImage] = useState('none');

  const handlePlayGame = (url, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      if (setShowAuth) setShowAuth(true);
    } else {
      window.location.href = url;
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/game/list');
        const result = await response.json();
        if (result.success && Array.isArray(result.games)) {
          setGames(result.games);
          const uniqueCategories = ['All', ...new Set(result.games.flatMap(g => {
              return Array.isArray(g?.category) ? g.category : [g?.category];
          }).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Lỗi khi kết nối với Backend:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:3000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.user) {
            setFavoriteGames(Array.isArray(data.user.favoriteGames) ? data.user.favoriteGames : []);
          }
        } catch (error) {
          console.error("Lỗi khi tải profile:", error);
        }
      }
    };
    fetchGames();
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('http://localhost:3000/api/game/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setRecommendations(data.games);
      }
    };
    fetchRecommendations();
  }, []);

  const handleToggleFavorite = async (gameSlug, e) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập để lưu game yêu thích nhé!");
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/auth/toggle-favorite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameSlug })
      });
      const data = await res.json();
      if (data.success) {
        setFavoriteGames(Array.isArray(data.favoriteGames) ? data.favoriteGames : []); 
      }
    } catch (err) {
      console.error("Lỗi khi thêm/xóa yêu thích:", err);
    }
  };

  const filteredGames = games.filter(game => {
    const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
    const keyword = safeSearchQuery.toLowerCase().trim();
    const safeCategory = game?.category;
    const gameCats = Array.isArray(safeCategory) ? safeCategory : [safeCategory].filter(Boolean);
    const catText = gameCats.join(' ').toLowerCase(); 
    const matchSearch = keyword === '' || 
                        (game?.title && game.title.toLowerCase().includes(keyword)) ||
                        catText.includes(keyword);
    const matchCategory = activeCategory === 'All' || gameCats.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  const safeFavoriteGames = Array.isArray(favoriteGames) ? favoriteGames : [];

  return (
    <div className="relative w-full min-h-screen">
      
      {/* LỚP NỀN TRANG WEB */}
      <div 
        className="fixed inset-0 z-[-1] transition-all duration-1000 ease-in-out bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundColor: pageBgImage === 'none' ? '#ffffff' : '#141516',
          backgroundImage: pageBgImage !== 'none' ? `url(${pageBgImage})` : 'none' 
        }}
      ></div>

      {/* COMPONENT CÀI ĐẶT */}
      <SettingsMenu pageBgImage={pageBgImage} setPageBgImage={setPageBgImage} />

      <div className="flex flex-col lg:flex-row w-full gap-8 relative z-10 p-4 lg:p-8">
        
        {/* CỘT TRÁI */}
        <aside className="w-full lg:w-64 flex flex-col gap-8 shrink-0">
          <div className="flex flex-col gap-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#608a6e] mb-4">Danh mục</h3>
              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)} 
                    className={`category-btn flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all shadow-sm group ${
                      activeCategory === cat 
                        ? 'active-category bg-white dark:bg-[#1a2e20] text-primary border-l-4 border-primary' 
                        : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a2e20]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">
                        {cat === 'All' ? 'grid_view' : 'stadia_controller'}
                      </span>
                      <span>{cat === 'All' ? 'Tất cả game' : cat}</span>
                    </div>
                    <span className={`material-symbols-outlined text-sm transition-opacity ${activeCategory === cat ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-30'}`}>
                      check_circle
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* CỘT PHẢI */}
        <div className="flex-1 flex flex-col gap-10">
          
          {/* Banner */}
          <section className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-xl group">
            <img alt="Game of the Day" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 lg:p-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">FEATURED</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight max-w-2xl mb-4">Galaxy Striker:<br/>Math Defense</h1>
              <p className="text-white/80 text-lg max-w-xl mb-8 leading-relaxed">Protect the galaxy from number monsters! Type the correct answer to shoot them down.</p>
              <div className="flex items-center gap-4">
                <button onClick={(e) => handlePlayGame('/monster.html', e)} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span> Play Now
                </button>
              </div>
            </div>
          </section>

          {/* Danh sách Game */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-500">calculate</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  {activeCategory === 'All' ? (searchQuery ? `Kết quả cho "${searchQuery}"` : 'Popular Games') : `Thể loại: ${activeCategory}`}
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="game-grid">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-300">Đang tải...</p>
              ) : filteredGames.map((game) => {
                const isFav = safeFavoriteGames.includes(game.slug);
                return (
                  <div key={game._id} className="game-card relative bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e0e8e2] dark:border-[#2a3f31] cursor-pointer group" onClick={(e) => handlePlayGame(game.gameUrl || `/${game.slug}.html`, e)}>
                    <div className="h-44 relative bg-gray-800 overflow-hidden">
                      <img alt={game.title} className="size-full object-cover opacity-90 group-hover:scale-110 transition duration-500" src={game.thumbnailUrl || "https://via.placeholder.com/300"}/>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg mb-1 text-black dark:text-white">{game.title}</h4>
                      <p className="text-sm text-[#608a6e] mb-5">👁️ {game.views || 0} lượt chơi</p>
                      <button className="w-full h-11 bg-primary text-white font-bold rounded-xl">Play Now</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;