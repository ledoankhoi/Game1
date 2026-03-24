import React from 'react';

function TabAchievements({ achievementsList, profileData, getAchievementProgress, handleEquipBadge }) {
  return (
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
            const { isUnlocked, progressPercent } = getAchievementProgress(ach);
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
  );
}

export default TabAchievements;