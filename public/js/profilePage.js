/* file: public/js/profilePage.js */

const ProfilePage = {
    init: async function() {
        // Kiểm tra đăng nhập
        const username = localStorage.getItem('username');
        if (!username) {
            window.location.href = 'index.html'; // Đá về trang chủ nếu chưa login
            return;
        }

        // Lấy dữ liệu mới nhất
        try {
            const res = await fetch('http://localhost:3000/api/user/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();

            if (data.success) {
                this.renderProfile(data);
                this.renderRecords(data);
            }
        } catch (err) {
            console.error("Lỗi tải profile:", err);
        }
    },

    renderProfile: function(user) {
        // Điền thông tin cơ bản
        document.getElementById('profile-username').innerText = user.username || "Unknown";
        document.getElementById('profile-coins').innerText = (user.coins || 0).toLocaleString();
        document.getElementById('profile-exp').innerText = (user.exp || 0).toLocaleString();
        
        // Tính tổng số game đã chơi
        const plays = user.playCounts || {};
        const totalPlayed = (plays.monster || 0) + (plays.sequence || 0) + (plays.speed || 0) + (plays.pixel || 0);
        document.getElementById('profile-total-played').innerText = totalPlayed;

        // Gọi lại UserProfile (file cũ) để xử lý hiển thị Avatar và Level Ring
        if (typeof UserProfile !== 'undefined') {
            UserProfile.updateUI(user.exp || 0, user.avatarId || 'avatar_1');
        }
    },

    renderRecords: function(user) {
        const grid = document.getElementById('records-grid');
        const scores = user.highScores || {};
        const plays = user.playCounts || {};

        // Cấu hình danh sách game
        const games = [
            { id: 'monster', name: 'Galaxy Striker', icon: 'rocket_launch', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'sequence', name: 'Pattern Finder', icon: 'psychology', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'speed', name: 'Speed Math', icon: 'bolt', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { id: 'pixel', name: 'Pixel Painting', icon: 'palette', color: 'text-green-500', bg: 'bg-green-500/10' }
        ];

        // Tìm game chơi nhiều nhất để gắn nhãn "Favorite"
        let maxPlay = 0;
        let favGameId = '';
        games.forEach(g => {
            if ((plays[g.id] || 0) > maxPlay) {
                maxPlay = plays[g.id];
                favGameId = g.id;
            }
        });

        grid.innerHTML = '';

        games.forEach(game => {
            const highScore = scores[game.id] || 0;
            const playCount = plays[game.id] || 0;
            const isFav = game.id === favGameId && playCount > 0;

            const html = `
                <div class="bg-white dark:bg-[#233829] p-5 rounded-2xl border border-transparent hover:border-primary/30 transition-all relative group overflow-hidden">
                    ${isFav ? `<div class="absolute top-0 right-0 bg-yellow-400 text-[10px] font-black px-2 py-1 rounded-bl-lg shadow-sm z-10">FAVORITE</div>` : ''}
                    
                    <div class="flex items-start justify-between mb-4">
                        <div class="${game.bg} p-3 rounded-xl ${game.color}">
                            <span class="material-symbols-outlined text-2xl">${game.icon}</span>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] text-gray-400 uppercase font-bold">High Score</p>
                            <p class="text-xl font-black text-gray-800 dark:text-white">${highScore.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-bold text-gray-700 dark:text-gray-200">${game.name}</h4>
                        <div class="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <span class="material-symbols-outlined text-sm">history</span>
                            Played ${playCount} times
                        </div>
                    </div>

                    <button onclick="window.location.href='leaderboard.html'" class="mt-4 w-full py-2 rounded-lg bg-gray-100 dark:bg-[#1a2e20] text-gray-500 text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                        View Leaderboard
                    </button>
                </div>
            `;
            grid.innerHTML += html;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProfilePage.init();
});