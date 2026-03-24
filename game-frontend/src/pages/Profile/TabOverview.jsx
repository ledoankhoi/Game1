import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function TabOverview({ profileData, gamesList, recordKeys, highScores, currentLevel, safeExp, expNeededForNextLevel, progressPercent, achievementsList, getAchievementProgress, setActiveTab }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* BẢNG KỶ LỤC */}
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

      {/* CỘT PHẢI: TIẾN ĐỘ & HUY HIỆU NHANH */}
      <div className="flex flex-col gap-6">
        {/* TIẾN ĐỘ LEVEL */}
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
  );
}

export default TabOverview;