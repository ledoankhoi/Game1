import React from 'react';

function TabQuests({ questsList, getQuestProgress, handleClaimQuest }) {
  const dailyQuests = questsList.filter(q => q.type === 'daily');
  const weeklyQuests = questsList.filter(q => q.type === 'weekly');
  const milestoneQuests = questsList.filter(q => q.type === 'milestone');

  const renderQuestButton = (questId, current, requirement, isClaimed) => {
    if (isClaimed) return <button disabled className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-green-500 text-sm font-bold rounded-xl border border-green-200 cursor-not-allowed">Đã Xong</button>;
    if (current >= requirement) return <button onClick={() => handleClaimQuest(questId)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95">Nhận Thưởng</button>;
    return <button disabled className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm font-bold rounded-xl border border-gray-200 cursor-not-allowed">Chưa Đạt</button>;
  };

  const renderQuestSection = (title, icon, iconColor, quests) => {
    if (quests.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-widest mb-4">
          <span className={`material-symbols-outlined text-${iconColor}-500`}>{icon}</span> {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map(quest => {
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
    );
  };

  return (
    <div className="flex flex-col animate-fade-in">
      {questsList.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white dark:bg-[#1a2e20] rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl mb-3 opacity-50">assignment_late</span>
          <p className="font-bold text-lg text-gray-600">Chưa có nhiệm vụ nào!</p>
        </div>
      ) : (
        <>
          {renderQuestSection("Hàng Ngày", "today", "blue", dailyQuests)}
          {renderQuestSection("Hàng Tuần", "date_range", "purple", weeklyQuests)}
          {renderQuestSection("Mốc Khuyến Khích", "workspace_premium", "red", milestoneQuests)}
        </>
      )}
    </div>
  );
}

export default TabQuests;