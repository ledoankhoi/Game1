import React, { useState, useEffect } from 'react';

function Leaderboard() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Trạng thái điều hướng
  const [mainTab, setMainTab] = useState('exp'); // 'exp' | 'score' | 'game'
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeGameId, setActiveGameId] = useState(null);
  
  // Dữ liệu bảng
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. KHI VỪA VÀO TRANG: Tự động tải danh sách Game từ Database
 // 1. KHI VỪA VÀO TRANG: Tự động tải danh sách Game từ Database
  useEffect(() => {
    fetch('http://localhost:3000/api/game/list')
      .then(res => res.json())
      .then(data => {
        // KIỂM TRA KỸ LƯỠNG: Đảm bảo data.games tồn tại và là một mảng
        if (data.success && data.games && Array.isArray(data.games) && data.games.length > 0) {
          setGames(data.games);
          
          const uniqueCategories = ['All', ...new Set(data.games.map(g => g.category).filter(Boolean))];
          setCategories(uniqueCategories);
          setActiveGameId(data.games[0].slug); 
        } else {
          console.warn("API trả về thành công nhưng không có mảng games:", data);
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

  // 2. KHI CHUYỂN TAB: Tự động gọi đúng API
  useEffect(() => {
    setIsLoading(true);
    let url = '';

    if (mainTab === 'exp') url = 'http://localhost:3000/api/game/leaderboard/exp';
    else if (mainTab === 'score') url = 'http://localhost:3000/api/game/leaderboard/score';
    else if (mainTab === 'game' && activeGameId) url = `http://localhost:3000/api/game/leaderboard/game/${activeGameId}`;

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
      // BẢO VỆ: Nếu không có URL (vì chưa có game nào), tắt Loading ngay lập tức
      setLeaderboardData([]);
      setIsLoading(false);
    }
  }, [mainTab, activeGameId]);

  // Lọc game theo danh mục (nếu đang ở tab Game)
  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(g => g.category === activeCategory);

  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-400 text-yellow-900 border-yellow-500 shadow-yellow-400/50 scale-110"; 
    if (index === 1) return "bg-gray-300 text-gray-800 border-gray-400 shadow-gray-400/50 scale-105";     
    if (index === 2) return "bg-orange-400 text-orange-950 border-orange-500 shadow-orange-400/50 scale-105"; 
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent";
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-5xl text-yellow-500">military_tech</span>
          Bảng Phong Thần
        </h1>
      </div>

      {/* 3 NÚT TỔNG TƯ LỆNH */}
      <div className="flex justify-center gap-4 mb-8">
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
        <div className="mb-8 p-6 bg-white dark:bg-[#1a2e20] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          
          {/* Lọc theo Thể loại */}
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-bold text-gray-400 mt-2 mr-2">THỂ LOẠI:</span>
            {categories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setActiveGameId(null); }} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeCategory === cat ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Chọn Game */}
          <div className="flex flex-wrap gap-3">
            {filteredGames.length > 0 ? filteredGames.map(game => (
              <button key={game.slug} onClick={() => setActiveGameId(game.slug)} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border-2 transition-all ${activeGameId === game.slug ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'border-transparent bg-gray-50 dark:bg-[#0f1a14] text-gray-600 dark:text-gray-300 hover:border-gray-200'}`}>
                <img src={game.thumbnailUrl} alt="icon" className="w-6 h-6 rounded-md object-cover" />
                {game.title}
              </button>
            )) : <span className="text-gray-500 text-sm">Không có game nào trong thể loại này.</span>}
          </div>
        </div>
      )}

      {/* BẢNG XẾP HẠNG CHÍNH */}
      <div className="bg-white dark:bg-[#1a2e20] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-500 font-bold">Đang tải dữ liệu...</div>
        ) : leaderboardData.length > 0 ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-12 gap-4 p-5 bg-gray-50 dark:bg-[#0f1a14] border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-2 text-center">Hạng</div>
              <div className="col-span-6">Cao thủ</div>
              <div className="col-span-4 text-right pr-4">
                {mainTab === 'exp' ? 'Kinh Nghiệm' : mainTab === 'score' ? 'Tổng Điểm' : 'Kỷ Lục'}
              </div>
            </div>

            {leaderboardData.map((player, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-5 items-center border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#233829] transition-colors">
                
                <div className="col-span-2 flex justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-sm ${getRankStyle(index)}`}>{index + 1}</div>
                </div>

                <div className="col-span-6 flex items-center gap-4">
                  <div className="relative">
                    <img src={player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.equipped?.skin !== 'skin_default' ? player.equipped?.skin : player.username}`} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover bg-white"/>
                    <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-gray-800">Lv.{player.level || 1}</span>
                  </div>
                  <div className="font-bold text-lg text-gray-800 dark:text-white truncate">{player.username}</div>
                </div>

                <div className="col-span-4 text-right pr-4 font-black text-xl text-primary flex flex-col items-end">
                  {mainTab === 'exp' ? (
                    <>{player.exp?.toLocaleString() || 0} <span className="text-xs text-gray-400 font-medium uppercase">EXP</span></>
                  ) : mainTab === 'score' ? (
                    <>{player.totalScore?.toLocaleString() || 0} <span className="text-xs text-gray-400 font-medium uppercase">PTS</span></>
                  ) : (
                    <>{player.score?.toLocaleString() || 0} <span className="text-xs text-gray-400 font-medium uppercase">PTS</span></>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">search_off</span>
            <p className="text-xl text-gray-500 font-bold">Chưa có ai ghi danh lên bảng này!</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Leaderboard;