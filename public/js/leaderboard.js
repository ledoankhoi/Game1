/* file: public/js/leaderboard.js - Phiên bản Fix lỗi tính tổng điểm Pixel */

const Leaderboard = {
    // 1. CẤU HÌNH GAME
    GAMES_CONFIG: {
        'all':       { label: 'Bảng Tổng Hợp',  icon: 'emoji_events' }, 
        'monster':   { label: 'Galaxy Striker', icon: 'rocket_launch' },
        'sequence':  { label: 'Pattern Finder', icon: 'psychology' },
        'speed':     { label: 'Speed Math',     icon: 'bolt' },
        'pixel':     { label: 'Pixel Painting', icon: 'palette' } // Đã có Pixel
    },

    data: [],       
    currentTab: 'all', 

    init: async function() {
        await this.loadData(); 
        this.renderTabs();     
        this.renderTable();    
    },

    loadData: async function() {
        const tbody = document.getElementById('leaderboard-body');
        try {
            const response = await fetch('http://localhost:3000/api/auth/leaderboard');
            const result = await response.json();
            
            if (result.success) {
                this.data = result.data; 
            } else {
                this.data = [];
            }
        } catch (error) {
            console.error("Lỗi tải BXH:", error);
            if(tbody) tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-red-500 font-bold">Không thể kết nối Server!</td></tr>`;
        }
    },

    renderTabs: function() {
        const container = document.getElementById('game-tabs-container');
        if (!container) return;

        container.innerHTML = '';

        for (const [key, config] of Object.entries(this.GAMES_CONFIG)) {
            const btn = document.createElement('button');
            btn.className = `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm border border-transparent`;
            
            if (key === this.currentTab) {
                btn.classList.add('bg-[#25f46a]', 'text-white', 'shadow-green-200'); 
            } else {
                btn.classList.add('bg-white', 'dark:bg-[#233829]', 'text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50'); 
            }

            btn.innerHTML = `
                <span class="material-symbols-outlined text-lg">${config.icon}</span>
                <span>${config.label}</span>
            `;

            btn.onclick = () => {
                this.currentTab = key;
                this.renderTabs();  
                this.renderTable(); 
            };

            container.appendChild(btn);
        }
    },

    renderTable: function() {
        const tbody = document.getElementById('leaderboard-body');
        const headerTitle = document.getElementById('score-header');
        
        if (headerTitle) headerTitle.innerText = this.currentTab === 'all' ? "Tổng Điểm" : "Điểm Cao Nhất";

        let sortedData = [...this.data]; 

        sortedData.sort((a, b) => {
            let scoreA = this.getScore(a, this.currentTab);
            let scoreB = this.getScore(b, this.currentTab);
            return scoreB - scoreA; 
        });

        if (this.currentTab !== 'all') {
            sortedData = sortedData.filter(u => this.getScore(u, this.currentTab) > 0);
        }

        if (tbody) {
            tbody.innerHTML = '';
            
            if (sortedData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="p-12 text-center text-gray-400 italic">Chưa có ai chơi game này. Hãy là người đầu tiên!</td></tr>`;
                return;
            }

            sortedData.forEach((player, index) => {
                const score = this.getScore(player, this.currentTab);
                
                let rankDisplay = `<span class="font-bold text-gray-500">#${index + 1}</span>`;
                if (index === 0) rankDisplay = `<span class="text-2xl">🥇</span>`;
                if (index === 1) rankDisplay = `<span class="text-2xl">🥈</span>`;
                if (index === 2) rankDisplay = `<span class="text-2xl">🥉</span>`;

                // --- SỬA LẠI PHẦN NÀY ĐỂ HIỆN ĐIỂM PIXEL ---
                let subText = '';
                if (this.currentTab === 'all') {
                    const s = player.highScores || {};
                    subText = `<div class="flex justify-end gap-3 text-[11px] text-gray-400 mt-1 opacity-90 font-mono">
                        ${(s.monster || 0) > 0 ? `<span title="Galaxy Striker" class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-purple-400">rocket_launch</span>${s.monster}</span>` : ''}
                        ${(s.sequence || 0) > 0 ? `<span title="Pattern Finder" class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-blue-400">psychology</span>${s.sequence}</span>` : ''}
                        ${(s.speed || 0) > 0    ? `<span title="Speed Math" class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-yellow-500">bolt</span>${s.speed}</span>` : ''}
                        ${(s.pixel || 0) > 0    ? `<span title="Pixel Painting" class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-green-500">palette</span>${s.pixel}</span>` : ''}
                    </div>`;
                }
                // ---------------------------------------------

                const row = `
                    <tr class="hover:bg-green-50/50 dark:hover:bg-white/5 transition-colors group border-b border-gray-100 dark:border-[#2a3f31]">
                        <td class="p-4 text-center align-middle">${rankDisplay}</td>
                        <td class="p-4 align-middle font-bold text-gray-700 dark:text-gray-200">
                            ${player.username}
                            ${player.currentOutfit && player.currentOutfit !== 'default' ? '<span class="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded border border-yellow-200">VIP</span>' : ''}
                        </td>
                        <td class="p-4 text-right align-middle">
                            <span class="font-black text-xl text-primary">${score.toLocaleString()}</span>
                            ${subText}
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    },

    // --- CẬP NHẬT HÀM TÍNH TỔNG (QUAN TRỌNG) ---
    getScore: function(user, type) {
        const scores = user.highScores || {};
        
        if (type === 'all') {
            // Đã thêm scores.pixel vào tổng
            return (scores.monster || 0) + (scores.sequence || 0) + (scores.speed || 0) + (scores.pixel || 0);
        } else {
            return scores[type] || 0;
        }
    }
};