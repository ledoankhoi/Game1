import React, { useState, useEffect } from 'react';

// Ảnh mặc định nội bộ (Giống bên Profile)
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function Leaderboard() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [mainTab, setMainTab] = useState('exp'); 
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeGameId, setActiveGameId] = useState(null);
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. KHI VỪA VÀO TRANG: Tự động tải danh sách Game từ Database (Có thuật toán quét dọn)
  useEffect(() => {
    fetch('http://localhost:3000/api/game/list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.games && Array.isArray(data.games) && data.games.length > 0) {
          setGames(data.games);
          
          // --- THUẬT TOÁN QUÉT DỌN VÀ LỌC THỂ LOẠI DUY NHẤT ---
          let extractedCats = [];
          
          data.games.forEach(g => {
              let cats = [];
              // Xử lý dữ liệu Mảng hoặc Chuỗi
              if (Array.isArray(g.category)) {
                  cats = g.category;
              } else if (typeof g.category === 'string') {
                  cats = g.category.split(','); 
              }

              cats.forEach(c => {
                  if (c && typeof c === 'string') {
                      let cleanCat = c.trim(); // Xóa khoảng trắng thừa
                      
                      // Lọc bỏ chuỗi rác và chuẩn hóa chữ (Viết hoa chữ đầu)
                      if (cleanCat.length > 0 && cleanCat.length < 20 && !cleanCat.includes('MathMemory')) {
                          cleanCat = cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1).toLowerCase();
                          extractedCats.push(cleanCat);
                      }
                  }
              });
          });

          // Dùng Set để ép buộc không có phần tử nào trùng lặp
          const uniqueCategories = ['All', ...new Set(extractedCats)];
          setCategories(uniqueCategories); 
        } else {
          setGames([]);
          setCategories(['All']);
        }
      })
      .catch(err => {
        console.error("Lỗi tải danh sách game:", err);
        setGames([]);
        setCategories(['All']);
      });
  }, []);

  // --- 2. KHI CHUYỂN TAB HOẶC CHỌN THỂ LOẠI: Tự động gọi đúng API ---
  useEffect(() => {
    setIsLoading(true);
    let url = '';

    if (mainTab === 'exp') {
        url = 'http://localhost:3000/api/game/leaderboard/exp';
    } 
    else if (mainTab === 'score') {
        url = 'http://localhost:3000/api/game/leaderboard/score';
    } 
    else if (mainTab === 'game') {
        // A. NẾU ĐÃ CHỌN GAME CỤ THỂ -> Xem BXH của duy nhất Game đó
        if (activeGameId) {
            url = `http://localhost:3000/api/game/leaderboard/game/${activeGameId}`;
        } 
        // B. NẾU CHƯA CHỌN GAME (Tức là đang ở trạng thái chọn Thể loại, bao gồm cả 'All') 
        // -> Sẽ gọi API Category và gởi chữ 'All' (hoặc tên thể loại) xuống Backend
        else if (activeCategory) {
            url = `http://localhost:3000/api/game/leaderboard/category/${activeCategory}`;
        }
    }

    if (url) {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setLeaderboardData(data.success ? data.leaderboard : []);
          setIsLoading(false);
        })
        .catch(err => {
          setLeaderboardData([]);
          setIsLoading(false);
        });
    } else {
      setLeaderboardData([]);
      setIsLoading(false);
    }
  }, [mainTab, activeGameId, activeCategory]);

  // --- LỌC GAME THEO DANH MỤC AN TOÀN ---
  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(g => {
        const gameCats = Array.isArray(g.category) ? g.category : [g.category];
        const cleanGameCats = gameCats.map(c => c ? c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase() : '');
        return cleanGameCats.includes(activeCategory);
      });

  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-400 text-yellow-900 border-yellow-500 shadow-yellow-400/50 scale-110"; 
    if (index === 1) return "bg-gray-300 text-gray-800 border-gray-400 shadow-gray-400/50 scale-105";     
    if (index === 2) return "bg-orange-400 text-orange-950 border-orange-500 shadow-orange-400/50 scale-105"; 
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent";
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 animate-fade-in">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-5xl text-yellow-500">military_tech</span>
          Bảng Phong Thần
        </h1>
      </div>

      {/* 3 NÚT TỔNG TƯ LỆNH */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button onClick={() => setMainTab('exp')} className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${mainTab === 'exp' ? 'bg-primary text-white shadow-lg shadow-green-500/30' : 'bg-white dark:bg-[#1a2e20] text-gray-500 hover:bg-gray-50'}`}>
          <span className="material-symbols-outlined">star</span> Top Cấp Độ
        </button>
        <button onClick={() => setMainTab('score')} className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${mainTab === 'score' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-[#1a2e20] text-gray-500 hover:bg-gray-50'}`}>
          <span className="material-symbols-outlined">emoji_events</span> Top Tổng Điểm
        </button>
        <button onClick={() => setMainTab('game')} className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${mainTab === 'game' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-[#1a2e20] text-gray-500 hover:bg-gray-50'}`}>
          <span className="material-symbols-outlined">sports_esports</span> Top Từng Game
        </button>
      </div>

      {/* HIỂN THỊ DANH MỤC & DANH SÁCH GAME NẾU ĐANG Ở TAB "TOP TỪNG GAME" */}
      {mainTab === 'game' && (
        <div className="mb-8 p-6 bg-white dark:bg-[#1a2e20] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in">
          
          {/* Lọc theo Thể loại */}
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-black text-gray-400 uppercase tracking-widest mr-2">Thể loại:</span>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setActiveGameId(null); }} // Xóa ID Game cũ đi để xem tổng Thể loại
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat && !activeGameId // Tô đậm nút Thể loại nếu đang chọn Thể loại và chưa chọn Game cụ thể
                    ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Chọn Game */}
          <div className="flex flex-wrap gap-3">
            {filteredGames.length > 0 ? (
                filteredGames.map(game => (
                  <button 
                    key={game.slug} 
                    onClick={() => setActiveGameId(game.slug)} 
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-3 border-2 transition-all ${
                      activeGameId === game.slug 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 shadow-sm' 
                        : 'border-transparent bg-gray-50 dark:bg-[#0f1a14] text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <img src={game.thumbnailUrl || 'https://via.placeholder.com/24'} alt="icon" className="w-6 h-6 rounded-md object-cover bg-white" />
                    {game.title}
                  </button>
                ))
            ) : (
                <div className="w-full text-center py-4 text-gray-500 text-sm font-medium">Không có tựa game nào trong thể loại này.</div>
            )}
          </div>
        </div>
      )}

      {/* BẢNG XẾP HẠNG CHÍNH */}
      <div className="bg-white dark:bg-[#1a2e20] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-primary">
             <span className="material-symbols-outlined text-4xl mb-4 animate-spin">sync</span>
             <p className="font-bold">Đang tổng hợp dữ liệu...</p>
          </div>
        ) : leaderboardData.length > 0 ? (
          <div className="flex flex-col animate-fade-in">
            <div className="grid grid-cols-12 gap-4 p-5 bg-gray-50 dark:bg-[#0f1a14] border-b border-gray-100 dark:border-gray-800 text-xs font-black text-gray-400 uppercase tracking-widest">
              <div className="col-span-2 text-center">Hạng</div>
              <div className="col-span-6">Cao thủ</div>
              <div className="col-span-4 text-right pr-4">
                {mainTab === 'exp' ? 'Kinh Nghiệm' : mainTab === 'score' ? 'Tổng Điểm' : (activeGameId ? 'Kỷ Lục Game' : 'Kỷ Lục Thể Loại')}
              </div>
            </div>

            {leaderboardData.map((player, index) => (
              <div key={player.id || index} className="grid grid-cols-12 gap-4 p-5 items-center border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#233829] transition-colors group">
                
                {/* Hạng */}
                <div className="col-span-2 flex justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-sm transition-transform group-hover:scale-110 ${getRankStyle(index)}`}>
                    {index + 1}
                  </div>
                </div>

                {/* Info Người Chơi */}
                <div className="col-span-6 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={player.avatarUrl || DEFAULT_AVATAR} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover bg-white"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-gray-800 shadow-sm">
                      Lv.{player.level || 1}
                    </span>
                  </div>
                  <div className="font-bold text-lg text-gray-800 dark:text-white truncate">
                    {player.username}
                  </div>
                </div>

                {/* Điểm số */}
                <div className="col-span-4 text-right pr-4 font-black text-xl text-primary flex flex-col items-end justify-center">
                  {mainTab === 'exp' && <span className="text-purple-500">{player.exp?.toLocaleString() || 0} <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest ml-1">EXP</span></span>}
                  {mainTab === 'score' && <span className="text-blue-500">{player.totalScore?.toLocaleString() || 0} <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest ml-1">PTS</span></span>}
                  {mainTab === 'game' && <span className="text-primary">{player.score?.toLocaleString() || 0} <span className="text-[10px] text-green-600/60 font-bold uppercase tracking-widest ml-1">PTS</span></span>}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4 opacity-50">search_off</span>
            <p className="text-xl text-gray-500 font-bold">Chưa có ai ghi danh lên bảng này!</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Leaderboard;