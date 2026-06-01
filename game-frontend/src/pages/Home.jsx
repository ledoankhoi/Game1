import React, { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import useAuthStore from '../store/useAuthStore';
import useGameStore from '../store/useGameStore';

function Home({ searchQuery = '' }) {
  const user = useAuthStore((s) => s.user);
  const setShowAuth = useAuthStore((s) => s.setShowAuth);
  const games = useGameStore((s) => s.games);
  const categories = useGameStore((s) => s.categories);
  const activeCategory = useGameStore((s) => s.activeCategory);
  const favoriteGames = useGameStore((s) => s.favoriteGames);
  const loading = useGameStore((s) => s.loading);
  const setActiveCategory = useGameStore((s) => s.setActiveCategory);
  const fetchGames = useGameStore((s) => s.fetchGames);
  const fetchFavorites = useGameStore((s) => s.fetchFavorites);
  const fetchRecommendations = useGameStore((s) => s.fetchRecommendations);
  const toggleFavorite = useGameStore((s) => s.toggleFavorite);

  const gridRef = useRef(null);
  const bannerRef = useRef(null);
  const categoryRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(bannerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    if (categoryRef.current?.children?.length) gsap.fromTo(categoryRef.current.children, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', delay: 0.2 });
    if (gridRef.current?.children?.length) gsap.fromTo(gridRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.3 });
  }, [activeCategory, searchQuery]);

  const handlePlayGame = async (gameSlug, url, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setShowAuth(true);
    } else {
      try {
        await fetch(`/api/game/${gameSlug}/play`, {
          method: 'POST'
        });
      } catch (err) {
        console.error("Lỗi cập nhật lượt chơi:", err);
      }
      window.location.href = url;
    }
  };

  useEffect(() => {
    fetchGames();
    fetchFavorites();
    fetchRecommendations();
  }, [fetchGames, fetchFavorites, fetchRecommendations]);

  const handleToggleFavorite = async (gameSlug, e) => {
    e.stopPropagation();
    if (!localStorage.getItem('token')) {
      setShowAuth(true);
      return;
    }
    await toggleFavorite(gameSlug);
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
      <div className="flex flex-col lg:flex-row w-full gap-8 relative z-10 p-4 lg:p-8">
        
        <aside className="w-full lg:w-64 flex flex-col gap-8 shrink-0">
          <div className="flex flex-col gap-6">

            {/* Đã xóa hoàn toàn khu vực Đăng nhập Facebook ở đây */}

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#608a6e] mb-4">Danh mục</h3>
              <div ref={categoryRef} className="flex flex-col gap-2">
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
                        {cat === 'All' ? 'grid_view' : cat === 'Multiplayer' ? 'groups' : 'stadia_controller'}
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

        <div className="flex-1 flex flex-col gap-10">
          
          <section ref={bannerRef} className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-xl group">
            <img alt="Game of the Day" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 lg:p-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">FEATURED</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight max-w-2xl mb-4">Galaxy Striker:<br/>Math Defense</h1>
              <p className="text-white/80 text-lg max-w-xl mb-8 leading-relaxed">Protect the galaxy from number monsters! Type the correct answer to shoot them down.</p>
              <div className="flex items-center gap-4">
                <button onClick={(e) => handlePlayGame('monster', '/monster.html', e)} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span> Play Now
                </button>
              </div>
            </div>
          </section>

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
            
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="game-grid">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-300">Đang tải...</p>
              ) : filteredGames.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4" style={{fontVariationSettings: "'FILL' 1"}}>search_off</span>
                  <p className="text-lg font-bold">Không tìm thấy game nào</p>
                  <p className="text-sm">Thử thay đổi từ khóa hoặc thể loại</p>
                </div>
              ) : filteredGames.map((game) => {
                const isFav = safeFavoriteGames.includes(game.slug);
                return (
                  <div key={game._id} 
                    className="game-card relative bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e0e8e2] dark:border-[#2a3f31] cursor-pointer group" 
                    onClick={(e) => handlePlayGame(game.slug, game.gameUrl || `/${game.slug}.html`, e)}>
                    <div className="h-44 relative bg-gray-800 overflow-hidden">
                      <img alt={game.title} className="size-full object-cover opacity-90 group-hover:scale-110 transition duration-500" src={game.thumbnailUrl || "https://via.placeholder.com/300"}/>
                      {(Array.isArray(game.category) ? game.category : []).includes('Multiplayer') && (
                        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                          <span className="material-symbols-outlined text-xs">groups</span>
                          <span>Multiplayer</span>
                        </div>
                      )}
                      <button 
                        onClick={(e) => handleToggleFavorite(game.slug, e)}
                        className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-90"
                        title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                      >
                        <span className={`material-symbols-outlined text-xl ${isFav ? 'text-red-500 fill-current' : 'text-white'}`}>
                          {isFav ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
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