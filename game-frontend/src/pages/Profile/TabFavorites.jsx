import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function TabFavorites({ favoriteGames, gamesList, toggleFavorite }) {
  const navigate = useNavigate();

  return (
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
              <img src={game.thumbnailUrl || DEFAULT_AVATAR} className="size-full object-cover opacity-90 group-hover:scale-110 transition duration-500" alt="game cover" />
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
        </div>
      )}
    </div>
  );
}

export default TabFavorites;