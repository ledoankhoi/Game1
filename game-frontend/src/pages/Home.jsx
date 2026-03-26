import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home({ searchQuery = '', user, setShowAuth }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favoriteGames, setFavoriteGames] = useState([]);

  // Thêm hàm xử lý khi nhấn chơi game
  const handlePlayGame = (url, e) => {
    if (e) e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
    
    // Nếu chưa có user (chưa đăng nhập), hiển thị form đăng nhập
    if (!user) {
      if (setShowAuth) setShowAuth(true);
    } else {
      // Nếu đã đăng nhập, chuyển hướng đến game
      window.location.href = url;
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/game/list');
        const result = await response.json();

        // BỌC THÉP 1: Đảm bảo games là một mảng
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
          // BỌC THÉP 2: Đảm bảo favoriteGames luôn là mảng
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
        // BỌC THÉP 3: Cập nhật an toàn
        setFavoriteGames(Array.isArray(data.favoriteGames) ? data.favoriteGames : []); 
      }
    } catch (err) {
      console.error("Lỗi khi thêm/xóa yêu thích:", err);
    }
  };

  // Trong Home.jsx
const [recommendations, setRecommendations] = useState([]);

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

  const filteredGames = games.filter(game => {
    // BỌC THÉP 4: Chống lỗi khi searchQuery bị truyền sai kiểu dữ liệu
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

  // BỌC THÉP 5: Chống lỗi includes()
  const safeFavoriteGames = Array.isArray(favoriteGames) ? favoriteGames : [];

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8">
      
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
              {/* Sửa nút Play Now ở Banner */}
              <button onClick={(e) => handlePlayGame('/monster.html', e)} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined">play_circle</span> Play Now
              </button>
            </div>
          </div>
        </section>

        {/* Danh sách */}
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
              <p className="text-gray-500 dark:text-gray-300">Đang tải dữ liệu từ máy chủ...</p>
            ) : filteredGames.length > 0 ? (
              filteredGames.map((game) => {
                const isFav = safeFavoriteGames.includes(game.slug);

                return (
                  <div 
                    key={game._id} 
                    className="game-card relative bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e0e8e2] dark:border-[#2a3f31] cursor-pointer group" 
                    // Sửa onClick cho Thẻ Game
                    onClick={(e) => handlePlayGame(game.gameUrl || `/${game.slug}.html`, e)}
                  >
                    <div className="h-44 relative bg-gray-800 overflow-hidden">
                      <img alt={game.title} className="size-full object-cover opacity-90 group-hover:scale-110 transition duration-500" src={game.thumbnailUrl || "https://via.placeholder.com/300"}/>
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[80%] z-10">
                        {(Array.isArray(game?.category) ? game.category : [game?.category]).map((cat, idx) => (
                            cat && <span key={idx} className="bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase">{cat}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h4 className="font-bold text-lg mb-1 text-black dark:text-white">{game?.title}</h4>
                      <p className="text-sm text-[#608a6e] mb-5 line-clamp-2">👁️ Lượt chơi: {game?.views?.toLocaleString() || 0}</p>
                      
                      <div className="flex items-center gap-2">
                        {/* Sửa onClick cho nút Play Now */}
                        <button
                          onClick={(e) => handlePlayGame(game.gameUrl || `/${game.slug}.html`, e)}
                          className="flex-grow h-11 bg-[#f0f5f1] dark:bg-[#233829] hover:bg-primary hover:text-white text-[#111813] dark:text-white font-bold rounded-xl transition-all flex items-center justify-center"
                        >
                          Play Now
                        </button>

                        <button 
                          onClick={(e) => handleToggleFavorite(game.slug, e)} 
                          className={`w-11 h-11 shrink-0 rounded-full border-2 transition-all shadow-sm flex items-center justify-center
                            ${isFav
                              ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
                              : 'bg-white dark:bg-[#2a3f31] border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                        >
                          <span 
                            className="material-symbols-outlined text-[20px]" 
                            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full py-10 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                <p className="text-gray-500 dark:text-gray-300 font-bold">Không tìm thấy game nào phù hợp.</p>
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;