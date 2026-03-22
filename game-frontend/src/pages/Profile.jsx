import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Ảnh mặc định nội bộ (Tránh dùng link Google/ngoài)
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesList, setGamesList] = useState([]);
  
  const [history, setHistory] = useState([]);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // 1. Lấy thông tin Cá nhân
    fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfileData(data.user);
          setGamesPlayed(data.gamesPlayed || 0);
        }
      });

    // 2. Lấy danh sách Game
    fetch('http://localhost:3000/api/game/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) setGamesList(data.games);
      });

    // 3. Lấy Lịch sử đấu
    fetch('http://localhost:3000/api/game/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setHistory(data.history);
      })
      .catch(err => console.log("Chưa cấu hình API History ở Backend"));

    // 4. Lấy Game yêu thích
    const savedFavs = JSON.parse(localStorage.getItem('favoriteGames')) || [];
    setFavoriteGames(savedFavs);

  }, [navigate]);

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return setIsModalOpen(false);

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/auth/update-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ avatarUrl: selectedAvatar })
    });
    const data = await res.json();
    
    if (data.success) {
      setProfileData({ ...profileData, avatarUrl: data.avatarUrl });
      const localUser = JSON.parse(localStorage.getItem('user'));
      if(localUser) {
          localUser.avatarUrl = data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(localUser));
          window.dispatchEvent(new Event('storage')); 
      }
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("File quá lớn! Vui lòng chọn ảnh dưới 2MB.");
    const reader = new FileReader();
    reader.onload = (e) => setSelectedAvatar(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleFavorite = (gameSlug) => {
    let newFavs = [...favoriteGames];
    if (newFavs.includes(gameSlug)) newFavs = newFavs.filter(slug => slug !== gameSlug);
    else newFavs.push(gameSlug);
    setFavoriteGames(newFavs);
    localStorage.setItem('favoriteGames', JSON.stringify(newFavs));
  };

  if (!profileData) return <div className="flex justify-center items-center min-h-[60vh] font-bold text-gray-500 animate-pulse"><span className="material-symbols-outlined text-4xl mr-2 animate-spin">sync</span> Đang tải hồ sơ mật...</div>;

  const progress = (profileData.exp % 1000) / 1000;
  const strokeDashoffset = 289 - (progress * 289);
  const highScores = profileData.highScores || {};
  const recordKeys = Object.keys(highScores);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 lg:p-8 flex flex-col gap-6 animate-fade-in">
      
      {/* THẺ ĐỊNH DANH */}
      <div className="bg-white dark:bg-[#1a2e20] rounded-[2rem] p-8 shadow-xl border border-[#e0e8e2] dark:border-[#2a3f31] relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12">
          <span className="material-symbols-outlined text-[15rem]">sports_esports</span>
        </div>

        {/* Avatar */}
        <div className="relative group cursor-pointer shrink-0" onClick={() => setIsModalOpen(true)}>
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-800" />
            <circle cx="50" cy="50" r="46" stroke="#25f46a" strokeWidth="6" fill="transparent" className="transition-all duration-1000 ease-out" strokeDasharray="289" style={{ strokeDashoffset: strokeDashoffset }} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Chỉ sử dụng ảnh trong CSDL hoặc ảnh mặc định */}
            <img src={profileData.avatarUrl || DEFAULT_AVATAR} alt="Avatar" className="w-[120px] h-[120px] rounded-full border-4 border-white dark:border-[#1a2e20] shadow-md group-hover:scale-105 transition object-cover bg-white" />
          </div>
          <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full border-4 border-white dark:border-[#1a2e20] hover:bg-green-600 transition">
            <span className="material-symbols-outlined text-lg">edit</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{profileData.username}</h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase rounded-lg border border-yellow-200 shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">stars</span> LV. {profileData.level || 1}
                </span>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span> {profileData.email}
              </p>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-500 hover:text-white text-red-500 font-bold transition border border-red-100 dark:border-red-900/30 group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span> Đăng Xuất
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-yellow-500">monetization_on</span> Tổng Xu</p>
              <p className="font-black text-xl text-gray-800 dark:text-white">{profileData.coins?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-purple-500">military_tech</span> Kinh Nghiệm</p>
              <p className="font-black text-xl text-gray-800 dark:text-white">{profileData.exp?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-blue-500">videogame_asset</span> Đã Chơi</p>
              <p className="font-black text-xl text-gray-800 dark:text-white">{gamesPlayed} <span className="text-sm font-medium text-gray-500">ván</span></p>
            </div>
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-red-500">local_fire_department</span> Tổng Điểm</p>
              <p className="font-black text-xl text-gray-800 dark:text-white">{profileData.totalScore?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-px overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-bold uppercase tracking-widest text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          <span className="material-symbols-outlined">dashboard</span> Tổng Quan
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-3 font-bold uppercase tracking-widest text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          <span className="material-symbols-outlined">history</span> Lịch Sử Đấu
        </button>
        <button onClick={() => setActiveTab('favorites')} className={`px-6 py-3 font-bold uppercase tracking-widest text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'favorites' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
          <span className="material-symbols-outlined">favorite</span> Yêu Thích
        </button>
      </div>

      {/* NỘI DUNG TABS */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-widest">
              <span className="material-symbols-outlined text-yellow-500">trophy</span> Bảng Kỷ Lục
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recordKeys.length > 0 ? recordKeys.map(gameId => {
                const gameInfo = gamesList.find(g => g.slug === gameId);
                return (
                  <div key={gameId} className="bg-white dark:bg-[#1a2e20] p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:-translate-y-1 transition-transform flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/${gameId}.html`)}>
                    <img src={gameInfo?.thumbnailUrl || DEFAULT_AVATAR} alt="icon" className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-800 shadow-sm group-hover:border-primary transition-colors" />
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white truncate max-w-[140px]" title={gameInfo?.title || gameId}>{gameInfo?.title || gameId}</p>
                      <p className="text-primary font-black text-xl leading-none mt-1">{highScores[gameId]?.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PTS</span></p>
                    </div>
                  </div>
                )
              }) : (
                <div className="col-span-full p-10 text-center text-gray-400 bg-gray-50 dark:bg-[#102216] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center">
                  <span className="material-symbols-outlined text-6xl mb-3 opacity-50">sports_esports</span>
                  <p className="font-bold text-lg">Hồ sơ trống trơn!</p>
                  <p className="text-sm mt-1">Hãy ra sảnh chơi thử một ván để ghi danh kỷ lục đầu tiên nhé.</p>
                  <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition">Chơi Ngay</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#1a2e20] rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#102216] text-gray-500 text-xs uppercase tracking-widest">
                      <th className="p-4 font-bold rounded-tl-3xl">Tựa Game</th>
                      <th className="p-4 font-bold">Điểm số</th>
                      <th className="p-4 font-bold text-center">Nhận thưởng</th>
                      <th className="p-4 font-bold text-right rounded-tr-3xl">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => {
                      const gameInfo = gamesList.find(g => g.slug === h.gameId);
                      return (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={gameInfo?.thumbnailUrl || DEFAULT_AVATAR} alt="icon" className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                            <span className="font-bold text-gray-800 dark:text-white">{gameInfo?.title || h.gameId}</span>
                          </td>
                          <td className="p-4 font-black text-gray-800 dark:text-white">{h.score?.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-md text-xs border border-yellow-100 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">monetization_on</span> +{h.coinsEarned || 0}</span>
                              <span className="text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-md text-xs border border-purple-100 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">military_tech</span> +{h.expEarned || 0}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right text-gray-500 text-sm font-medium">
                            {new Date(h.createdAt).toLocaleDateString('vi-VN')} {new Date(h.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50">hourglass_empty</span>
                <p className="font-bold text-lg">Chưa có lịch sử đấu.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {favoriteGames.length > 0 ? favoriteGames.map(gameId => {
              const game = gamesList.find(g => g.slug === gameId);
              if(!game) return null;
              return (
                <div key={gameId} className="game-card bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e0e8e2] dark:border-[#2a3f31] relative group cursor-pointer" onClick={() => navigate(`/${game.slug}.html`)}>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(game.slug); }} className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur p-2 rounded-full text-red-500 hover:scale-110 transition shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                  <div className="h-36 relative bg-gray-800 overflow-hidden">
                    <img alt={game.title} className="size-full object-cover opacity-90 group-hover:scale-110 transition duration-500" src={game.thumbnailUrl || DEFAULT_AVATAR}/>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-1 text-gray-800 dark:text-white truncate">{game.title}</h4>
                    <p className="text-xs text-[#608a6e] font-medium uppercase tracking-widest">{Array.isArray(game.category) ? game.category[0] : game.category}</p>
                  </div>
                </div>
              )
            }) : (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white dark:bg-[#1a2e20] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50">heart_broken</span>
                <p className="font-bold text-lg">Chưa có game yêu thích nào.</p>
                <p className="text-sm mt-1">Hãy bấm vào biểu tượng trái tim trên các game ở trang chủ để thêm vào đây nhé.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CHỈ CÓ TẢI ẢNH LÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e20] w-full max-w-sm rounded-3xl shadow-2xl p-6 relative border border-gray-100 dark:border-gray-700 animate-fade-in">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h2 className="text-xl font-black text-center mb-6 text-gray-800 dark:text-white uppercase tracking-widest">Thay Đổi Diện Mạo</h2>

            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer w-32 h-32">
                <img src={selectedAvatar || profileData.avatarUrl || DEFAULT_AVATAR} alt="preview" className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-600 shadow-inner group-hover:border-primary transition-colors bg-white" />
                <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  <span className="text-xs font-bold mt-1">Tải ảnh lên</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center">Định dạng hỗ trợ: JPG, PNG. Tối đa 2MB.</p>
            </div>
            
            <div className="flex justify-center gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Hủy</button>
              <button onClick={handleSaveAvatar} className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-green-500/30 hover:bg-green-600 active:scale-95 transition">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;