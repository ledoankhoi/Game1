import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

// MAP CSS HIỆU ỨNG KHUNG AVATAR
const getFrameStyle = (frameId) => {
  if (frameId === 'frame_gold') return "border-4 border-yellow-400 shadow-[0_0_15px_#facc15]";
  if (frameId === 'frame_neon') return "border-4 border-cyan-400 shadow-[0_0_15px_#22d3ee]";
  if (frameId === 'frame_fire') return "border-4 border-red-500 shadow-[0_0_20px_#ef4444]";
  return "border-4 border-white dark:border-[#1a2e20]"; // Mặc định
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

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questsList, setQuestsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetch('http://localhost:3000/api/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } })
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

    fetch('http://localhost:3000/api/game/list').then(res => res.json()).then(data => { if (data.success) setGamesList(data.games || []); });
    fetch('http://localhost:3000/api/game/history', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.success) setHistory(data.history || []); });
    fetch('http://localhost:3000/api/quest/list').then(res => res.json()).then(data => { if (data.success) setQuestsList(data.quests || []); });
    fetch('http://localhost:3000/api/achievement/list').then(res => res.json()).then(data => { if (data.success) setAchievementsList(data.achievements || []); });

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

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

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return setFeedbackStatus({ type: 'error', message: 'Bạn chưa nhập nội dung mà!' });
    setIsSubmitting(true);
    setFeedbackStatus({ type: '', message: '' });
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/auth/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: feedbackText })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackStatus({ type: 'success', message: data.message });
        setFeedbackText(''); 
      } else {
        setFeedbackStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedbackStatus({ type: 'error', message: 'Lỗi kết nối. Vui lòng thử lại sau.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = async (gameSlug) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/auth/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gameSlug })
      });
      const data = await res.json();
      if (data.success) setFavoriteGames(data.favoriteGames || []); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimQuest = async (questId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/auth/claim-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questId })
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(data.user); 
        localStorage.setItem('user', JSON.stringify(data.user)); 
        window.dispatchEvent(new Event('storage'));
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEquipBadge = async (badgeId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/auth/equip-badge', {
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

  const safeExp = profileData.exp || 0;
  const currentLevel = profileData.level || 1;
  const expNeededForNextLevel = currentLevel * 1000;
  const progressPercent = Math.min((safeExp / expNeededForNextLevel) * 100, 100); 
  const progressCircle = (safeExp % 1000) / 1000; 
  const strokeDashoffset = 289 - (progressCircle * 289);
  
  const highScores = profileData.highScores || {};
  const recordKeys = Object.keys(highScores);
  const totalScore = profileData.totalScore || 0;

  // LỌC NHIỆM VỤ 100% TỪ DATABASE
  const displayQuests = questsList; 
  const dailyQuests = displayQuests.filter(q => q.type === 'daily');
  const weeklyQuests = displayQuests.filter(q => q.type === 'weekly');
  const monthlyQuests = displayQuests.filter(q => q.type === 'monthly');
  const milestoneQuests = displayQuests.filter(q => q.type === 'milestone');

  const questsData = profileData.quests || {};
  const getQuestProgress = (qId) => {
    if (qId === 'dailyLogin') return { current: questsData.dailyLoginClaimed ? 1 : 0, isClaimed: questsData.dailyLoginClaimed };
    if (qId === 'play3Games') return { current: questsData.gamesPlayedToday || 0, isClaimed: questsData.gamesPlayedClaimed };
    if (qId === 'scoreHunter') return { current: totalScore || 0, isClaimed: questsData.scoreHunterClaimed };
    return { current: 0, isClaimed: false };
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

  const renderQuestButton = (questId, current, requirement, isClaimed) => {
    if (isClaimed) return <button disabled className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-green-500 text-sm font-bold rounded-xl border border-green-200">Đã Xong</button>;
    if (current >= requirement) return <button onClick={() => handleClaimQuest(questId)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95">Nhận Thưởng</button>;
    return <button disabled className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm font-bold rounded-xl border border-gray-200">Chưa Đạt</button>;
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

        {/* AVATAR KHUNG */}
        <div className="relative group cursor-pointer shrink-0" onClick={() => setIsModalOpen(true)}>
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-800" />
            <circle cx="50" cy="50" r="46" stroke="#25f46a" strokeWidth="6" fill="transparent" className="transition-all duration-1000 ease-out" strokeDasharray="289" style={{ strokeDashoffset: strokeDashoffset }} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={profileData.avatarUrl || DEFAULT_AVATAR} className={`w-[120px] h-[120px] rounded-full object-cover bg-white z-10 transition-all ${getFrameStyle(profileData.equipped?.frame)}`} />
          </div>
          <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full z-20 hover:bg-green-600 transition shadow-md">
            <span className="material-symbols-outlined text-lg">edit</span>
          </div>
          {/* HIỂN THỊ HUY HIỆU */}
          {profileData.equipped?.badge && profileData.equipped.badge !== 'none' && (
             <div className="absolute top-1 right-1 z-30 w-10 h-10 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg transform rotate-12 hover:scale-110 transition duration-300">
                {renderBadgeIcon(profileData.equipped.badge)}
             </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{profileData.username || "Gamer"}</h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase rounded-lg border border-yellow-200 shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">stars</span> LV. {currentLevel}
                </span>
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

      {/* NỘI DUNG TABS */}
      <div className="min-h-[300px]">
        
        {/* --- TAB 1: TỔNG QUAN --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest"><span className="material-symbols-outlined text-yellow-500">trophy</span> Bảng Kỷ Lục</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recordKeys.length > 0 ? recordKeys.map(gameId => {
                  const gameInfo = gamesList.find(g => g.slug === gameId);
                  return (
                    <div key={gameId} className="bg-white dark:bg-[#1a2e20] p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:-translate-y-1 transition-transform flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/${gameId}.html`)}>
                      <img src={gameInfo?.thumbnailUrl || DEFAULT_AVATAR} alt="icon" className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-800 shadow-sm transition-colors" />
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white truncate max-w-[140px]">{gameInfo?.title || gameId}</p>
                        <p className="text-primary font-black text-xl leading-none mt-1">{highScores[gameId]?.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PTS</span></p>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="col-span-full p-10 text-center text-gray-400 bg-gray-50 dark:bg-[#102216] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"><span className="material-symbols-outlined text-6xl mb-3 opacity-50">sports_esports</span><p className="font-bold text-lg">Hồ sơ trống trơn!</p></div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-[#1a2e20] p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiến Độ Tới Cấp {currentLevel + 1}</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">{safeExp.toLocaleString()} <span className="text-sm font-medium text-gray-500">/ {expNeededForNextLevel.toLocaleString()} XP</span></p>
                  </div>
                  <span className="material-symbols-outlined text-purple-500 text-3xl opacity-50">upgrade</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-right text-[10px] text-gray-400 font-bold mt-2">{Math.round(progressPercent)}% Hoàn thành</p>
              </div>

              {/* XEM NHANH HUY HIỆU */}
              <div className="bg-white dark:bg-[#1a2e20] p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-orange-500">local_police</span><h4 className="font-bold text-gray-800 dark:text-white uppercase tracking-widest text-sm">Huy Hiệu</h4></div>
                  <button onClick={() => setActiveTab('achievements')} className="text-xs font-bold text-primary hover:underline">Xem Tất Cả</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {achievementsList.length > 0 ? achievementsList.slice(0, 3).map(ach => {
                    const { isUnlocked } = getAchievementProgress(ach);
                    return (
                      <div key={`quick-${ach.id}`} className={`flex flex-col items-center gap-2 group cursor-help ${isUnlocked ? '' : 'opacity-40 grayscale'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isUnlocked ? `bg-${ach.color}-100 border-${ach.color}-300` : 'bg-gray-100 border-gray-300'}`}>
                          <span className={`material-symbols-outlined ${isUnlocked ? `text-${ach.color}-500` : 'text-gray-400'}`}>{ach.icon}</span>
                        </div>
                        <span className="text-[10px] font-bold text-center text-gray-600">{ach.title}</span>
                      </div>
                    )
                  }) : <p className="text-xs text-gray-400 col-span-3 text-center">Chưa tải được huy hiệu</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: NHIỆM VỤ (PHÂN LOẠI TỰ ĐỘNG TỪ CSDL) --- */}
        {activeTab === 'quests' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {displayQuests.length === 0 && (
              <div className="p-12 text-center text-gray-400 bg-white dark:bg-[#1a2e20] rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50">assignment_late</span>
                <p className="font-bold text-lg text-gray-600">Chưa có nhiệm vụ nào!</p>
              </div>
            )}
            
            {/* Lọc Hàng Ngày */}
            {dailyQuests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest mb-4">
                  <span className="material-symbols-outlined text-blue-500">today</span> Hàng Ngày
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyQuests.map(quest => {
                    const { current, isClaimed } = getQuestProgress(quest.id);
                    const progressWidth = Math.min((current / quest.requirement) * 100, 100);
                    return (
                      <div key={quest.id} className={`bg-white dark:bg-[#1a2e20] p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center ${isClaimed ? 'bg-green-50/50 border-green-200' : 'border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'}`}>
                        <div className="flex gap-4 items-center w-full sm:w-auto">
                          <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-${quest.color}-500 bg-${quest.color}-100 dark:bg-${quest.color}-900/30`}>
                            <span className="material-symbols-outlined text-2xl">{quest.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white text-md">{quest.title}</h4>
                            <div className="w-full sm:w-48 h-2 bg-gray-100 dark:bg-gray-700 mt-2 rounded-full overflow-hidden">
                              <div className={`bg-${quest.color}-500 h-full`} style={{ width: `${progressWidth}%` }}></div>
                            </div>
                            <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase">{Math.min(current, quest.requirement).toLocaleString()} / {quest.requirement.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between">
                          <div className="flex gap-2">
                            {quest.rewardCoins > 0 && <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">+{quest.rewardCoins} Xu</span>}
                            {quest.rewardExp > 0 && <span className="text-purple-600 bg-purple-100 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">+{quest.rewardExp} XP</span>}
                          </div>
                          {renderQuestButton(quest.id, current, quest.requirement, isClaimed)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Lọc Hàng Tuần */}
            {weeklyQuests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest mb-4">
                  <span className="material-symbols-outlined text-purple-500">date_range</span> Hàng Tuần
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weeklyQuests.map(quest => {
                    const { current, isClaimed } = getQuestProgress(quest.id);
                    const progressWidth = Math.min((current / quest.requirement) * 100, 100);
                    return (
                      <div key={quest.id} className={`bg-white dark:bg-[#1a2e20] p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center ${isClaimed ? 'bg-green-50/50 border-green-200' : 'border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'}`}>
                        <div className="flex gap-4 items-center w-full sm:w-auto">
                          <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-${quest.color}-500 bg-${quest.color}-100 dark:bg-${quest.color}-900/30`}>
                            <span className="material-symbols-outlined text-2xl">{quest.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white text-md">{quest.title}</h4>
                            <div className="w-full sm:w-48 h-2 bg-gray-100 dark:bg-gray-700 mt-2 rounded-full overflow-hidden">
                              <div className={`bg-${quest.color}-500 h-full`} style={{ width: `${progressWidth}%` }}></div>
                            </div>
                            <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase">{Math.min(current, quest.requirement).toLocaleString()} / {quest.requirement.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between">
                          <div className="flex gap-2">
                            {quest.rewardCoins > 0 && <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">+{quest.rewardCoins} Xu</span>}
                            {quest.rewardExp > 0 && <span className="text-purple-600 bg-purple-100 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">+{quest.rewardExp} XP</span>}
                          </div>
                          {renderQuestButton(quest.id, current, quest.requirement, isClaimed)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Mốc Khuyến Khích */}
            {milestoneQuests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest mb-4">
                  <span className="material-symbols-outlined text-red-500">workspace_premium</span> Mốc Khuyến Khích
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestoneQuests.map(quest => {
                    const { current, isClaimed } = getQuestProgress(quest.id);
                    const progressWidth = Math.min((current / quest.requirement) * 100, 100);
                    return (
                      <div key={quest.id} className={`bg-white dark:bg-[#1a2e20] p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center ${isClaimed ? 'bg-green-50/50 border-green-200' : 'border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'}`}>
                        <div className="flex gap-4 items-center w-full sm:w-auto">
                          <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-${quest.color}-500 bg-${quest.color}-100 dark:bg-${quest.color}-900/30`}>
                            <span className="material-symbols-outlined text-2xl">{quest.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white text-md">{quest.title}</h4>
                            <div className="w-full sm:w-48 h-2 bg-gray-100 dark:bg-gray-700 mt-2 rounded-full overflow-hidden">
                              <div className={`bg-${quest.color}-500 h-full`} style={{ width: `${progressWidth}%` }}></div>
                            </div>
                            <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase">{Math.min(current, quest.requirement).toLocaleString()} / {quest.requirement.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between">
                          <div className="flex gap-2">
                            {quest.rewardCoins > 0 && <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">+{quest.rewardCoins} Xu</span>}
                            {quest.rewardExp > 0 && <span className="text-purple-600 bg-purple-100 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">+{quest.rewardExp} XP</span>}
                          </div>
                          {renderQuestButton(quest.id, current, quest.requirement, isClaimed)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: THÀNH TỰU (CÓ NÚT GẮN/THÁO) --- */}
        {activeTab === 'achievements' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest mb-6">
              <span className="material-symbols-outlined text-orange-500">hotel_class</span> Bộ Sưu Tập Huy Hiệu
            </h3>

            {achievementsList.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-white dark:bg-[#1a2e20] rounded-3xl border border-dashed flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50">military_tech</span>
                <p className="font-bold text-lg">Chưa có thành tựu nào!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {achievementsList.map(ach => {
                  const { current, isUnlocked, progressPercent } = getAchievementProgress(ach);
                  const isEquipped = profileData.equipped?.badge === ach.id;

                  return (
                    <div key={ach.id} className={`bg-white dark:bg-[#1a2e20] p-6 rounded-3xl flex flex-col items-center text-center gap-3 border shadow-sm relative overflow-hidden group hover:grayscale-0 hover:opacity-100 transition-all ${isUnlocked ? `border-${ach.color}-400` : 'border-gray-100 dark:border-gray-700 opacity-60 grayscale'}`}>
                      
                      {isEquipped && <div className="absolute inset-0 bg-yellow-50/10 pointer-events-none"></div>}

                      <div className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 shadow-inner border-4 transition-colors ${isUnlocked ? `border-${ach.color}-400 bg-${ach.color}-100 dark:bg-${ach.color}-900/40` : `border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 group-hover:border-${ach.color}-400 group-hover:bg-${ach.color}-100`}`}>
                        <span className={`material-symbols-outlined text-4xl transition-colors ${isUnlocked ? `text-${ach.color}-500` : `text-gray-400 group-hover:text-${ach.color}-500`}`}>{ach.icon}</span>
                      </div>
                      
                      <div className="relative z-10 w-full flex flex-col items-center">
                        <h4 className="font-black text-gray-800 dark:text-white text-md uppercase">{ach.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-1 mb-2 h-8 leading-tight">{ach.description}</p>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mb-3">
                          <div className={`bg-${ach.color}-400 h-full transition-all`} style={{width: `${progressPercent}%`}}></div>
                        </div>

                        {/* NÚT GẮN/THÁO */}
                        {isUnlocked ? (
                          isEquipped ? (
                            <button onClick={() => handleEquipBadge('none')} className="w-full text-[10px] text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-md font-bold uppercase tracking-wider transition">Tháo Xuống</button>
                          ) : (
                            <button onClick={() => handleEquipBadge(ach.id)} className="w-full text-[10px] text-green-600 bg-green-100 hover:bg-green-200 border border-green-300 px-2 py-1.5 rounded-md font-bold uppercase tracking-wider transition">Gắn Khoe</button>
                          )
                        ) : (
                          <span className="block w-full text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 px-2 py-1.5 rounded-md font-bold uppercase tracking-wider text-center">Tiến độ: {Math.floor(progressPercent)}%</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: LỊCH SỬ ĐẤU --- */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#1a2e20] rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#102216] text-gray-500 text-xs uppercase tracking-widest"><th className="p-4 font-bold rounded-tl-3xl">Tựa Game</th><th className="p-4 font-bold">Điểm số</th><th className="p-4 font-bold text-center">Nhận thưởng</th><th className="p-4 font-bold text-right rounded-tr-3xl">Thời gian</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => {
                      const gameInfo = gamesList.find(g => g.slug === h.gameId);
                      return (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-4 flex items-center gap-3"><img src={gameInfo?.thumbnailUrl || DEFAULT_AVATAR} className="w-10 h-10 rounded-lg object-cover bg-gray-200" /><span className="font-bold text-gray-800 dark:text-white">{gameInfo?.title || h.gameId}</span></td>
                          <td className="p-4 font-black text-gray-800 dark:text-white">{h.score?.toLocaleString()}</td>
                          <td className="p-4 text-center"><div className="flex justify-center gap-3"><span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-md text-xs border border-yellow-100">+{h.coinsEarned || 0}</span><span className="text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-md text-xs border border-purple-100">+{h.expEarned || 0}</span></div></td>
                          <td className="p-4 text-right text-gray-500 text-sm font-medium">{h.createdAt ? `${new Date(h.createdAt).toLocaleDateString('vi-VN')} ${new Date(h.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Không rõ'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (<div className="p-12 text-center text-gray-400 flex flex-col items-center"><span className="material-symbols-outlined text-6xl mb-3 opacity-50">hourglass_empty</span><p className="font-bold text-lg">Chưa có lịch sử đấu.</p></div>)}
          </div>
        )}

        {/* --- TAB 5: YÊU THÍCH --- */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {favoriteGames.length > 0 ? favoriteGames.map(gameId => {
              const game = gamesList.find(g => g.slug === gameId);
              if(!game) return null;
              return (
                <div key={gameId} className="game-card bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e0e8e2] dark:border-[#2a3f31] relative group cursor-pointer" onClick={() => navigate(`/${game.slug}.html`)}>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(game.slug); }} className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur p-2 rounded-full text-red-500 hover:scale-110 transition shadow-sm"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span></button>
                  <div className="h-36 relative bg-gray-800 overflow-hidden"><img src={game.thumbnailUrl || DEFAULT_AVATAR} className="size-full object-cover opacity-90 group-hover:scale-110 transition duration-500"/></div>
                  <div className="p-4"><h4 className="font-bold text-lg mb-1 text-gray-800 dark:text-white truncate">{game.title}</h4><p className="text-xs text-[#608a6e] font-medium uppercase tracking-widest">{Array.isArray(game.category) ? game.category[0] : game.category}</p></div>
                </div>
              )
            }) : (<div className="col-span-full p-12 text-center text-gray-400 bg-white dark:bg-[#1a2e20] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center"><span className="material-symbols-outlined text-6xl mb-3 opacity-50">heart_broken</span><p className="font-bold text-lg">Chưa có game yêu thích nào.</p></div>)}
          </div>
        )}

        {/* --- TAB 6: GÓP Ý --- */}
        {activeTab === 'feedback' && (
          <div className="bg-white dark:bg-[#1a2e20] rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 mb-4"><span className="material-symbols-outlined text-4xl">mark_email_read</span></div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-2">Gửi Thư Cho Nhà Phát Triển</h3><p className="text-gray-500 dark:text-gray-400 text-sm">Bạn gặp lỗi? Bạn muốn có thêm tính năng mới? Hãy cho chúng tôi biết nhé!</p>
            </div>
            <div className="flex flex-col gap-4">
              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Nhập nội dung góp ý của bạn vào đây (tối thiểu 10 ký tự)..." className="w-full p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f1a14] text-gray-800 dark:text-white focus:border-primary outline-none transition-all resize-none min-h-[150px]"></textarea>
              {feedbackStatus.message && (<div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${feedbackStatus.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}><span className="material-symbols-outlined">{feedbackStatus.type === 'success' ? 'check_circle' : 'error'}</span>{feedbackStatus.message}</div>)}
              <button onClick={handleFeedbackSubmit} disabled={isSubmitting} className="w-full md:w-auto self-end bg-primary hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'send'}</span>{isSubmitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}</button>
            </div>
          </div>
        )}
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