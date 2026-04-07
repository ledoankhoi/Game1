import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import các Tabs con
import TabOverview from './TabOverview';
import TabQuests from './TabQuests';
import TabAchievements from './TabAchievements';
import TabHistory from './TabHistory';
import TabFavorites from './TabFavorites';
import TabFeedback from './TabFeedback';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const getFrameStyle = (frameId) => {
  if (frameId === 'frame_gold') return "border-4 border-yellow-400 shadow-[0_0_15px_#facc15]";
  if (frameId === 'frame_neon') return "border-4 border-cyan-400 shadow-[0_0_15px_#22d3ee]";
  if (frameId === 'frame_fire') return "border-4 border-red-500 shadow-[0_0_20px_#ef4444]";
  return "border-4 border-white dark:border-[#1a2e20]";
};

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

  const [questsList, setQuestsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);

  // ĐÃ SỬA: CHUYỂN BIẾN STATE VÀO BÊN TRONG HÀM PROFILE
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetch('http://localhost:5000/api/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setProfileData(data.user);
          setGamesPlayed(data.gamesPlayed || 0);
          setFavoriteGames(data.user.favoriteGames || []);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        }
      })
      .catch(err => console.error("Lỗi tải profile:", err));

    fetch('http://localhost:5000/api/game/list').then(res => res.json()).then(data => { if (data.success) setGamesList(data.games || []); });
    fetch('http://localhost:5000/api/game/history', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.success) setHistory(data.history || []); });
    fetch('http://localhost:5000/api/quest/list', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.success) setQuestsList(data.quests || []); });
    fetch('http://localhost:5000/api/achievement/list', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.success) setAchievementsList(data.achievements || []); });

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return setIsModalOpen(false);
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/auth/update-avatar', {
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

  // HÀM XỬ LÝ ĐỔI TÊN
  const handleSaveName = async () => {
    if (!newName.trim()) return setIsEditingName(false);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newUsername: newName })
      });
      const data = await res.json();
      
      if (data.success) {
        // Cập nhật giao diện ngay lập tức
        setProfileData({ ...profileData, username: data.username });
        
        // Lưu vào LocalStorage để thanh Header bên trên cùng đổi tên theo
        const localUser = JSON.parse(localStorage.getItem('user'));
        if (localUser) {
            localUser.username = data.username;
            localStorage.setItem('user', JSON.stringify(localUser));
            window.dispatchEvent(new Event('storage')); 
        }
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi đổi tên!");
    }
    setIsEditingName(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("File quá lớn! Vui lòng chọn ảnh dưới 2MB.");
    const reader = new FileReader();
    reader.onload = (e) => setSelectedAvatar(e.target.result);
    reader.readAsDataURL(file);
  };

  const toggleFavorite = async (gameSlug) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gameSlug })
      });
      const data = await res.json();
      if (data.success) setFavoriteGames(data.favoriteGames || []); 
    } catch (err) { console.error(err); }
  };

  const handleClaimQuest = async (questId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/quest/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questId })
      });
      const data = await res.json();
      
      if (data.success) {
        // ✅ GỌI POPUP NHẬN THƯỞNG MỚI THAY VÌ DÙNG ALERT
        if (window.MathQuestBridge && window.MathQuestBridge.showItemRewardPopup) {
            window.MathQuestBridge.showItemRewardPopup(
                "Phần Thưởng", 
                data.rewardCoins || 0, // Số lượng xu (hoặc điểm) nhận được
                "workspace_premium", // Icon hiển thị
                data.message
            );
        } else {
            alert(data.message); // Dự phòng nếu file game-bridge.js chưa load
        }

        setProfileData(prev => {
          const updatedUser = { ...prev, ...data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage'));
          return updatedUser;
        });
        
        fetch('http://localhost:5000/api/quest/list', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => { if (d.success) setQuestsList(d.quests || []); });
      } else {
        // Hiển thị lỗi bằng popup (nếu có) hoặc alert
        if (window.MathQuestBridge && window.MathQuestBridge.showRewardPopup) {
            window.MathQuestBridge.showRewardPopup("Lỗi: " + data.message, profileData?.coins || 0);
        } else {
            alert(data.message);
        }
      }
    } catch (err) { 
        console.error(err); 
    }
  };

  const handleEquipBadge = async (badgeId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/equip-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ badgeId })
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(data.user);
        localStorage.setItem('user', JSON.stringify(data.user)); 
        window.dispatchEvent(new Event('storage')); 
      }
    } catch (err) { console.error(err); }
  };

  if (!profileData) return (
    <div className="flex justify-center items-center min-h-[60vh] font-bold text-gray-500 animate-pulse">
      <span className="material-symbols-outlined text-4xl mr-2 animate-spin">sync</span> Đang tải hồ sơ mật...
    </div>
  );

  // CÁC BIẾN TÍNH TOÁN DÙNG CHUNG
  const safeExp = profileData.exp || 0;
  const currentLevel = profileData.level || 1;
  const expNeededForNextLevel = currentLevel * 1000;
  const progressPercent = Math.min((safeExp / expNeededForNextLevel) * 100, 100); 
  const progressCircle = (safeExp % 1000) / 1000; 
  const strokeDashoffset = 289 - (progressCircle * 289);
  const highScores = profileData.highScores || {};
  const recordKeys = Object.keys(highScores);
  const totalScore = profileData.totalScore || 0;

  const getQuestProgress = (qId) => {
    const quest = questsList.find(q => q.id === qId);
    return { current: quest ? quest.currentProgress : 0, isClaimed: quest ? quest.isClaimed : false };
  };

  const getAchievementProgress = (ach) => {
    let current = 0;
    if (ach.targetType === 'coins') current = profileData.coins || 0;
    if (ach.targetType === 'streak') current = profileData.loginStreak || 1;
    if (ach.targetType === 'gamesPlayed') current = gamesPlayed || 0;
    if (ach.targetType === 'level') current = currentLevel || 1;
    const isUnlocked = current >= ach.requirement;
    const progressPercent = Math.min((current / ach.requirement) * 100, 100);
    return { current, isUnlocked, progressPercent };
  };

  const renderBadgeIcon = (badgeId) => {
    if (!badgeId || badgeId === 'none') return null;
    const ach = achievementsList.find(a => a.id === badgeId);
    if (!ach) return null;
    return <span className={`material-symbols-outlined text-[20px] text-${ach.color}-500`}>{ach.icon}</span>;
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 lg:p-8 flex flex-col gap-6 animate-fade-in">
      
      {/* THẺ ĐỊNH DANH CÓ KHUNG & HUY HIỆU */}
      <div className="bg-white dark:bg-[#1a2e20] rounded-[2rem] p-8 shadow-xl border border-[#e0e8e2] dark:border-[#2a3f31] relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12">
          <span className="material-symbols-outlined text-[15rem]">sports_esports</span>
        </div>

        {/* AVATAR */}
        <div className="relative group cursor-pointer shrink-0" onClick={() => setIsModalOpen(true)}>
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-800" />
            <circle cx="50" cy="50" r="46" stroke="#25f46a" strokeWidth="6" fill="transparent" className="transition-all duration-1000 ease-out" strokeDasharray="289" style={{ strokeDashoffset: strokeDashoffset }} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={profileData.avatarUrl || DEFAULT_AVATAR} className={`w-[120px] h-[120px] rounded-full object-cover bg-white z-10 transition-all ${getFrameStyle(profileData.equipped?.frame)}`} alt="avatar" />
          </div>
          <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full z-20 hover:bg-green-600 transition shadow-md">
            <span className="material-symbols-outlined text-lg">edit</span>
          </div>
          {profileData.equipped?.badge && profileData.equipped.badge !== 'none' && (
             <div className="absolute top-1 right-1 z-30 w-10 h-10 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg transform rotate-12 hover:scale-110 transition duration-300">
                {renderBadgeIcon(profileData.equipped.badge)}
             </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div>
              
              {/* ĐÃ SỬA LẠI KHU VỰC NÀY: CODE SẠCH SẼ, CHỐNG DƯ THẺ HTML */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      className="px-3 py-1 text-xl md:text-2xl font-black uppercase text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border-2 border-primary rounded-xl outline-none w-48"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <button onClick={handleSaveName} className="bg-green-500 text-white p-1 rounded-lg hover:bg-green-600 transition shadow-md">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                    <button onClick={() => setIsEditingName(false)} className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition shadow-md">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(profileData.username); }}>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                      {profileData.username || "Gamer"}
                    </h1>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors text-xl">edit</span>
                  </div>
                )}
                
                {/* Nút Level chỉ hiện khi không ở chế độ sửa tên */}
                {!isEditingName && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase rounded-lg border border-yellow-200 shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">stars</span> LV. {currentLevel}
                  </span>
                )}
              </div>
              
              <p className="text-gray-500 text-sm font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span> {profileData.email || "Chưa có email"}
              </p>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-500 hover:text-white text-red-500 font-bold transition border border-red-100 dark:border-red-900/30 group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span> Đăng Xuất
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-yellow-500">monetization_on</span> Tổng Xu</p><p className="font-black text-xl text-gray-800 dark:text-white">{profileData.coins?.toLocaleString() || 0}</p></div>
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-purple-500">military_tech</span> Kinh Nghiệm</p><p className="font-black text-xl text-gray-800 dark:text-white">{safeExp.toLocaleString()}</p></div>
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-blue-500">videogame_asset</span> Đã Chơi</p><p className="font-black text-xl text-gray-800 dark:text-white">{gamesPlayed} <span className="text-sm font-medium text-gray-500">ván</span></p></div>
            <div className="bg-gray-50 dark:bg-[#102216] p-4 rounded-2xl flex flex-col items-center md:items-start justify-center border border-gray-100 dark:border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px] text-red-500">local_fire_department</span> Tổng Điểm</p><p className="font-black text-xl text-gray-800 dark:text-white">{totalScore.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-px overflow-x-auto hide-scrollbar">
        {['overview', 'quests', 'achievements', 'history', 'favorites', 'feedback'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 lg:px-6 py-3 font-bold uppercase tracking-widest text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
             <span className="material-symbols-outlined">
               {tab === 'overview' ? 'dashboard' : tab === 'quests' ? 'assignment' : tab === 'achievements' ? 'military_tech' : tab === 'history' ? 'history' : tab === 'favorites' ? 'favorite' : 'campaign'}
             </span>
             {tab === 'overview' ? 'Tổng Quan' : tab === 'quests' ? 'Nhiệm Vụ' : tab === 'achievements' ? 'Thành Tựu' : tab === 'history' ? 'Lịch Sử Đấu' : tab === 'favorites' ? 'Yêu Thích' : 'Góp Ý'}
           </button>
        ))}
      </div>

      {/* NỘI DUNG TABS (GỌI TỪ CÁC FILE CON) */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <TabOverview 
            profileData={profileData} gamesList={gamesList} recordKeys={recordKeys} highScores={highScores} 
            currentLevel={currentLevel} safeExp={safeExp} expNeededForNextLevel={expNeededForNextLevel} progressPercent={progressPercent} 
            achievementsList={achievementsList} getAchievementProgress={getAchievementProgress} setActiveTab={setActiveTab} 
          />
        )}
        
        {activeTab === 'quests' && (
          <TabQuests 
            questsList={questsList} getQuestProgress={getQuestProgress} handleClaimQuest={handleClaimQuest} 
          />
        )}
        
        {activeTab === 'achievements' && (
          <TabAchievements 
            achievementsList={achievementsList} profileData={profileData} 
            getAchievementProgress={getAchievementProgress} handleEquipBadge={handleEquipBadge} 
          />
        )}
        
        {activeTab === 'history' && (
          <TabHistory history={history} gamesList={gamesList} />
        )}
        
        {activeTab === 'favorites' && (
          <TabFavorites favoriteGames={favoriteGames} gamesList={gamesList} toggleFavorite={toggleFavorite} />
        )}
        
        {activeTab === 'feedback' && <TabFeedback />}
      </div>

      {/* MODAL TẢI ẢNH LÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
           <div className="bg-white dark:bg-[#1a2e20] p-6 rounded-3xl w-full max-w-sm text-center relative border border-gray-100 dark:border-gray-700">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"><span className="material-symbols-outlined">close</span></button>
             <h2 className="text-xl font-black uppercase mb-4 dark:text-white">Tải Ảnh Lên</h2>
             <input type="file" onChange={handleFileUpload} className="mb-4 text-sm dark:text-gray-300" />
             <button onClick={handleSaveAvatar} className="w-full px-4 py-3 bg-primary hover:bg-green-600 text-white rounded-xl font-bold transition shadow-lg">Lưu Ảnh Diện Mạo</button>
           </div>
        </div>
      )}
    </div>
  );
}

export default Profile;