import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesList, setGamesList] = useState([]);
  
  // Trạng thái Modal Avatar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const presetAvatars = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Pepper",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Mario",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
  ];

  // 1. Lấy dữ liệu khi vừa vào trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Chưa đăng nhập thì đuổi ra ngoài
      return;
    }

    // Lấy thông tin Cá nhân
    fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfileData(data.user);
          setGamesPlayed(data.gamesPlayed);
        }
      });

    // Lấy danh sách Game để hiện Tên và Icon cho mục Kỷ lục
    fetch('http://localhost:3000/api/game/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) setGamesList(data.games);
      });
  }, [navigate]);

  // 2. Xử lý lưu Avatar
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return setIsModalOpen(false);

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/auth/update-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatarUrl: selectedAvatar })
    });
    const data = await res.json();
    
    if (data.success) {
      setProfileData({ ...profileData, avatarUrl: data.avatarUrl });
      
      // Cập nhật lại localStorage để các trang khác (Lobby, BXH) cũng nhận diện mạo mới
      const localUser = JSON.parse(localStorage.getItem('user'));
      if(localUser) {
          localUser.avatarUrl = data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(localUser));
      }
      setIsModalOpen(false);
    }
  };

  // 3. Xử lý Upload file từ máy
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
    window.location.href = '/login';
  };

  if (!profileData) return <div className="flex justify-center mt-20 font-bold text-gray-500">Đang tải hồ sơ mật...</div>;

  // Tính toán thanh tiến trình Level
  const progress = (profileData.exp % 1000) / 1000;
  const strokeDashoffset = 289 - (progress * 289);

  // Gọt đẽo dữ liệu Kỷ lục
  const highScores = profileData.highScores || {};
  const recordKeys = Object.keys(highScores);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 lg:p-8 flex flex-col gap-8">
      
      {/* THẺ ĐỊNH DANH */}
      <div className="bg-white dark:bg-[#1a2e20] rounded-3xl p-8 shadow-xl border border-[#e0e8e2] dark:border-[#2a3f31] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-9xl">fingerprint</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          
          {/* Avatar & Tiến trình Level */}
          <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-700" />
              <circle cx="50" cy="50" r="46" stroke="#25f46a" strokeWidth="6" fill="transparent" className="transition-all duration-1000 ease-out" strokeDasharray="289" style={{ strokeDashoffset: strokeDashoffset }} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={profileData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData.username}`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a2e20] shadow-md group-hover:scale-105 transition object-cover bg-white" />
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-white dark:border-[#1a2e20]">
              <span className="material-symbols-outlined text-lg">edit</span>
            </div>
          </div>

          {/* Thông tin */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black">{profileData.username}</h1>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full border border-primary/20">
                Level {profileData.level || 1}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-6">{profileData.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-gray-50 dark:bg-[#233829] px-5 py-3 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-500 text-2xl">monetization_on</span>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Tổng Xu</p>
                  <p className="font-bold text-lg leading-none">{profileData.coins?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#233829] px-5 py-3 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-500 text-2xl">military_tech</span>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Kinh Nghiệm</p>
                  <p className="font-bold text-lg leading-none">{profileData.exp?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#233829] px-5 py-3 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-500 text-2xl">videogame_asset</span>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Đã Chơi</p>
                  <p className="font-bold text-lg leading-none">{gamesPlayed} <span className="text-xs">ván</span></p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 font-bold transition">
              <span className="material-symbols-outlined">logout</span> Đăng Xuất
            </button>
          </div>
        </div>
      </div>

      {/* KỶ LỤC CÁ NHÂN */}
      <h3 className="text-xl font-bold flex items-center gap-2 mt-4">
        <span className="material-symbols-outlined text-primary">emoji_events</span> Kỷ Lục Cá Nhân
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recordKeys.length > 0 ? recordKeys.map(gameId => {
          // Tìm thông tin game trong list để lấy icon và tên thật
          const gameInfo = gamesList.find(g => g.slug === gameId);
          return (
            <div key={gameId} className="bg-white dark:bg-[#1a2e20] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex items-center gap-4">
              <img src={gameInfo?.thumbnailUrl || 'https://via.placeholder.com/50'} alt="icon" className="w-12 h-12 rounded-xl object-cover border-2 border-gray-50" />
              <div>
                <p className="font-bold text-gray-800 dark:text-white truncate max-w-[120px]">{gameInfo?.title || gameId}</p>
                <p className="text-primary font-black text-lg">{highScores[gameId]?.toLocaleString()} <span className="text-xs text-gray-400">PTS</span></p>
              </div>
            </div>
          )
        }) : (
          <div className="col-span-full p-8 text-center text-gray-400 bg-white dark:bg-[#1a2e20] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            Bạn chưa có kỷ lục nào. Hãy ra sảnh chơi thử một ván nhé!
          </div>
        )}
      </div>

      {/* MODAL CHỌN AVATAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e20] w-full max-w-lg rounded-3xl shadow-2xl p-6 relative border border-gray-100 dark:border-gray-700">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h2 className="text-2xl font-black text-center mb-6 text-gray-800 dark:text-white">Thay Đổi Diện Mạo</h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Tải Ảnh Lên</span>
                <div className="relative group cursor-pointer w-24 h-24">
                  <img src={selectedAvatar || profileData.avatarUrl || 'https://via.placeholder.com/150'} alt="preview" className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-600 shadow-inner group-hover:border-primary transition-colors" />
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white text-2xl">cloud_upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block text-center">Hoặc chọn mẫu có sẵn</span>
                <div className="grid grid-cols-5 gap-3 justify-items-center p-2">
                  {presetAvatars.map((url, i) => (
                    <img key={i} src={url} alt="preset" onClick={() => setSelectedAvatar(url)} className={`w-14 h-14 rounded-full cursor-pointer border-2 transition-all bg-gray-50 ${selectedAvatar === url ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Hủy</button>
              <button onClick={handleSaveAvatar} className="px-6 py-2 rounded-xl font-bold bg-primary text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;