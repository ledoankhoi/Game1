// file: public/js/rewardManager.js

const RewardManager = {
    config: {
        scoreToCoinRatio: 0.1, 
        scoreToExpRatio: 0.5,  
        baseLevelExp: 1000,    
        expMultiplier: 1.5     
    },

    getExpNeededForLevel: function(level) {
        return Math.floor(this.config.baseLevelExp * Math.pow(this.config.expMultiplier, level - 1));
    },

    /**
     * 🚀 HÀM TỔNG KẾT GAME DUY NHẤT CHO MỌI TRÒ CHƠI
     * @param {string} gameId - Mã game
     * @param {number} finalScore - Điểm số
     * @param {Array} gameLog - Mảng lịch sử. VD: [{ detail: "7+9=16", isSuccess: true }]
     */
    processGameEnd: async function(gameId, finalScore, gameLog = []) {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userStr || !token) {
            alert("Vui lòng đăng nhập lại!"); return;
        }

        const coinsEarned = Math.floor(finalScore * this.config.scoreToCoinRatio);
        const expEarned = Math.floor(finalScore * this.config.scoreToExpRatio);

        try {
            // SỬA LẠI PORT 5000 CHO KHỚP VỚI BACKEND CỦA BẠN
            const response = await fetch('http://localhost:5000/api/games/save-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    gameId: gameId,
                    score: finalScore,
                    coinsEarned: coinsEarned,
                    expEarned: expEarned
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log("✅ Đã lưu kết quả thành công!");
                localStorage.setItem('user', JSON.stringify(data.user));
                
                const expNeeded = this.getExpNeededForLevel(data.user.level);
                
                // Gọi màn hình Game Over xịn xò
                this.showUnifiedGameOver(finalScore, coinsEarned, expEarned, data.leveledUp, data.user.level, data.user.exp, expNeeded, gameLog);
            } else {
                alert("Lỗi từ Server: " + data.message);
            }
        } catch (error) {
            console.error("❌ Lỗi API:", error);
            // Nếu rớt mạng, vẫn hiện màn hình nhưng báo lỗi nhẹ
            this.showUnifiedGameOver(finalScore, coinsEarned, expEarned, false, 1, 0, 1000, gameLog, true);
        }
    },

    /**
     * 🏆 GIAO DIỆN TỔNG KẾT VẠN NĂNG (GIAO DIỆN KÉP 2 CỘT)
     */
    showUnifiedGameOver: function(score, coins, exp, leveledUp, currentLevel, currentExp, nextExp, gameLog, isOffline = false) {
        const oldScreen = document.getElementById('unified-gameover-screen');
        if (oldScreen) oldScreen.remove();

        const progressPercent = Math.min(100, Math.floor((currentExp / nextExp) * 100));

        // Format lại Nhật ký Game (Game Log)
        const logHTML = gameLog.length > 0 ? gameLog.map(item => `
            <div style="padding: 12px; border-radius: 12px; background: ${item.isSuccess ? 'rgba(37,244,106,0.05)' : 'rgba(239,68,68,0.05)'}; border-left: 4px solid ${item.isSuccess ? '#25f46a' : '#ef4444'}; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ddd; font-size: 13px; font-family: monospace;">${item.detail}</span>
                <span class="material-symbols-outlined" style="color: ${item.isSuccess ? '#25f46a' : '#ef4444'}; font-size: 18px;">${item.isSuccess ? 'check_circle' : 'cancel'}</span>
            </div>
        `).join('') : '<div style="color:#666; text-align:center; font-style:italic; padding: 20px;">Không có dữ liệu lịch sử</div>';

        const html = `
            <div id="unified-gameover-screen" style="position: fixed; inset: 0; z-index: 999999; background: rgba(5, 10, 15, 0.95); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.5s ease; font-family: 'Lexend', sans-serif;">
                
                <div style="display: flex; gap: 24px; width: 90%; max-width: 1000px; height: 80vh; max-height: 600px; transform: translateY(50px); transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);" id="gameover-panel">
                    
                    <div style="flex: 1; background: #0a0f14; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                        <h3 style="color: #5AB2FF; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-outlined">history</span> Báo Cáo Trận Đấu
                        </h3>
                        <div style="flex: 1; overflow-y: auto; padding-right: 10px;" class="custom-scrollbar">
                            ${logHTML}
                        </div>
                    </div>

                    <div style="flex: 1; background: linear-gradient(145deg, #121a22, #0a0f14); border: 1px solid rgba(250,204,21,0.3); border-radius: 24px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 50px rgba(250,204,21,0.1); position: relative; overflow: hidden;">
                        
                        ${isOffline ? '<div style="position:absolute; top:10px; color:#ef4444; font-size:11px; font-weight:bold; background:rgba(239,68,68,0.1); padding:4px 10px; border-radius:8px;">⚠️ Không thể lưu lên máy chủ</div>' : ''}

                        <h1 style="color: #facc15; font-size: 42px; font-weight: 900; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 20px rgba(250,204,21,0.5);">HOÀN THÀNH</h1>
                        <p style="color: #888; font-size: 14px; font-weight: bold; letter-spacing: 4px; margin-bottom: 30px; text-transform: uppercase;">Tổng Điểm: <span style="color: white; font-size: 24px;">${score.toLocaleString()}</span></p>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; margin-bottom: 30px;">
                            <div style="background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.3); border-radius: 16px; padding: 20px; text-align: center;">
                                <span class="material-symbols-outlined" style="font-size: 32px; color: #facc15; margin-bottom: 5px;">monetization_on</span>
                                <div style="color: #aaa; font-size: 10px; text-transform: uppercase; font-weight: bold;">Vàng nhận</div>
                                <div style="color: #facc15; font-size: 28px; font-weight: 900;">+${coins.toLocaleString()}</div>
                            </div>
                            <div style="background: rgba(37,244,106,0.1); border: 1px solid rgba(37,244,106,0.3); border-radius: 16px; padding: 20px; text-align: center;">
                                <span class="material-symbols-outlined" style="font-size: 32px; color: #25f46a; margin-bottom: 5px;">star</span>
                                <div style="color: #aaa; font-size: 10px; text-transform: uppercase; font-weight: bold;">EXP nhận</div>
                                <div style="color: #25f46a; font-size: 28px; font-weight: 900;">+${exp.toLocaleString()}</div>
                            </div>
                        </div>

                        <div style="width: 100%; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 16px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
                                <span style="color: white; font-weight: 900; font-size: 16px;">LEVEL ${currentLevel} ${leveledUp ? '<span style="color:#facc15; font-size:10px; background: rgba(250,204,21,0.2); padding: 2px 6px; border-radius: 4px; margin-left:5px;">🚀 THĂNG CẤP!</span>' : ''}</span>
                                <span style="color: #888; font-size: 12px; font-weight: bold; font-family: monospace;">${currentExp.toLocaleString()} / ${nextExp.toLocaleString()} XP</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.6); border-radius: 99px; overflow: hidden;">
                                <div style="width: 0%; height: 100%; background: linear-gradient(90deg, #25f46a, #00f3ff); transition: width 1.5s cubic-bezier(0.22, 1, 0.36, 1);" id="unified-exp-bar"></div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 15px; width: 100%;">
                            <button onclick="window.location.href='http://localhost:5173'" style="flex: 1; padding: 15px; background: transparent; border: 1px solid #555; color: white; font-weight: bold; border-radius: 12px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">VỀ SẢNH</button>
                            <button onclick="location.reload()" style="flex: 1.5; padding: 15px; background: #facc15; border: none; color: black; font-weight: 900; border-radius: 12px; cursor: pointer; transition: 0.2s; box-shadow: 0 0 20px rgba(250,204,21,0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">CHƠI LẠI</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        setTimeout(() => {
            const screen = document.getElementById('unified-gameover-screen');
            const panel = document.getElementById('gameover-panel');
            if (screen && panel) {
                screen.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    const expBar = document.getElementById('unified-exp-bar');
                    if(expBar) expBar.style.width = `${progressPercent}%`;
                }, 400);
            }
        }, 50);
    },

    submitScore: async function(gameId, finalScore) {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!userStr || !token) return null;

        const coinsEarned = Math.floor(finalScore * this.config.scoreToCoinRatio);
        const expEarned = Math.floor(finalScore * this.config.scoreToExpRatio);

        try {
            const response = await fetch('http://localhost:5000/api/games/save-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ gameId, score: finalScore, coinsEarned, expEarned })
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                return {
                    success: true,
                    coins: coinsEarned,
                    exp: expEarned,
                    level: data.user.level,
                    currentExp: data.user.exp,
                    nextExp: this.getExpNeededForLevel(data.user.level),
                    leveledUp: data.leveledUp
                };
            }
        } catch (error) {
            console.error("Lỗi API:", error);
        }
        return null;
    }

    
};