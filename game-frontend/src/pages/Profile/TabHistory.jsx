import React from 'react';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function TabHistory({ history, gamesList }) {
  return (
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
                      <img src={gameInfo?.thumbnailUrl || DEFAULT_AVATAR} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="game icon" />
                      <span className="font-bold text-gray-800 dark:text-white">{gameInfo?.title || h.gameId}</span>
                    </td>
                    <td className="p-4 font-black text-gray-800 dark:text-white">{h.score?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-md text-xs border border-yellow-100">+{h.coinsEarned || 0}</span>
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-md text-xs border border-purple-100">+{h.expEarned || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-500 text-sm font-medium">
                      {h.createdAt ? `${new Date(h.createdAt).toLocaleDateString('vi-VN')} ${new Date(h.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Không rõ'}
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
  );
}

export default TabHistory;