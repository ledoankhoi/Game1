import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Thêm searchQuery vào props để nhận dữ liệu từ App.jsx
function Home({ searchQuery = '' }) {
  // 1. Tạo cái "giỏ" (state) để chứa dữ liệu game và trạng thái đang tải
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- THÊM STATE CHO THỂ LOẠI (Bỏ state searchQuery vì đã nhận từ Props) ---
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');

  // 2. Dùng useEffect để gọi API xuống Backend khi trang vừa mở
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Gọi API tới cổng 3000
        const response = await fetch('http://localhost:3000/api/game/list');
        const result = await response.json();

        // Nếu gọi thành công, bỏ dữ liệu vào cái "giỏ" setGames
        if (result.success) {
          setGames(result.games);

          // Tự động rút trích danh sách Thể loại (Category) từ CSDL
          const uniqueCategories = ['All', ...new Set(result.games.map(g => g.category).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Lỗi khi kết nối với Backend:", error);
      } finally {
        setLoading(false); // Tắt hiệu ứng tải
      }
    };

    fetchGames(); // Kích hoạt hàm
  }, []); // Mảng rỗng [] nghĩa là chỉ gọi API 1 lần duy nhất khi vào trang

  // --- THUẬT TOÁN LỌC GAME (Theo Tên và Thể loại) ---
  const filteredGames = games.filter(game => {
    const matchSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8">
      
      {/* CỘT TRÁI: Danh mục Game (Đã tự động hóa) */}
      <aside className="w-full lg:w-64 flex flex-col gap-8 shrink-0">
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#608a6e] mb-4">Danh mục</h3>
            <div className="flex flex-col gap-2">
              
              {/* Render danh sách thể loại động từ Database */}
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

      {/* CỘT PHẢI: Danh sách Game */}
      <div className="flex-1 flex flex-col gap-10">
        
        {/* Game nổi bật (Giữ nguyên) */}
        <section className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-xl group">
          <img alt="Game of the Day" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 lg:p-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">FEATURED</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight max-w-2xl mb-4">Galaxy Striker:<br/>Math Defense</h1>
            <p className="text-white/80 text-lg max-w-xl mb-8 leading-relaxed">Protect the galaxy from number monsters! Type the correct answer to shoot them down.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => window.location.href='/monster.html'} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined">play_circle</span> Play Now
              </button>
            </div>
          </div>
        </section>

        {/* Lưới danh sách Game TỰ ĐỘNG */}
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
            
            {/* 3. Vòng lặp render dữ liệu */}
            {loading ? (
              <p className="text-gray-500 dark:text-gray-300">Đang tải dữ liệu từ máy chủ...</p>
            ) : filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <div 
                  key={game._id} 
                  className="game-card bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden shadow-sm card-hover border border-[#e0e8e2] dark:border-[#2a3f31] cursor-pointer" 
                  onClick={() => window.location.href = game.gameUrl || `/${game.slug}.html`}
                >
                  <div className="h-44 relative bg-gray-800">
                    <img alt={game.title} className="size-full object-cover opacity-80 group-hover:scale-110 transition duration-500" src={game.thumbnailUrl || "https://via.placeholder.com/300"}/>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase">{game.category}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg mb-1 text-black dark:text-white">{game.title}</h4>
                    <p className="text-sm text-[#608a6e] mb-5 line-clamp-2">👁️ Lượt chơi: {game.views?.toLocaleString() || 0}</p>
                    <button className="w-full bg-[#f0f5f1] dark:bg-[#233829] hover:bg-primary hover:text-white text-[#111813] dark:text-white font-bold py-2.5 rounded-xl transition-all">Play Now</button>
                  </div>
                </div>
              ))
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