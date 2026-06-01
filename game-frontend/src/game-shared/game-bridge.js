export const MathQuestBridge = {
    showRewardPopup: function(message, newCoins) {
        const oldPopup = document.getElementById('mq-reward-popup');
        if (oldPopup) oldPopup.remove();

        const html = `
            <div id="mq-reward-popup" style="position: fixed; inset: 0; z-index: 999999; background: rgba(5, 10, 15, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; font-family: 'Lexend', sans-serif;">

                <div style="background: linear-gradient(145deg, #121a22, #0a0f14); border: 1px solid #00f3ff; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 0 30px rgba(0, 243, 255, 0.2), inset 0 0 20px rgba(0, 243, 255, 0.05); transform: scale(0.8) translateY(20px); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 400px; width: 90%;">

                    <div style="font-size: 60px; margin-bottom: 10px; text-shadow: 0 0 20px rgba(250,204,21,0.5);"></div>
                    <h2 style="color: #00f3ff; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,243,255,0.5);">Tuyệt Vời!</h2>
                    <p style="color: #aaa; font-size: 15px; margin-bottom: 25px; line-height: 1.5;">${message}</p>

                    <div style="background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.3); border-radius: 12px; padding: 15px 25px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 30px; box-shadow: 0 0 15px rgba(250,204,21,0.1);">
                        <span class="material-symbols-outlined" style="color: #facc15; font-size: 28px;">monetization_on</span>
                        <div style="text-align: left;">
                            <div style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Số dư hiện tại</div>
                            <div style="color: #facc15; font-size: 22px; font-weight: 900;">${newCoins.toLocaleString()} Xu</div>
                        </div>
                    </div>

                    <br>
                    <button onclick="document.getElementById('mq-reward-popup').style.opacity='0'; setTimeout(()=>document.getElementById('mq-reward-popup').remove(), 300)" style="background: #00f3ff; color: #000; border: none; padding: 12px 35px; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: 0.2s; box-shadow: 0 0 15px rgba(0,243,255,0.4);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 25px rgba(0,243,255,0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 15px rgba(0,243,255,0.4)';">Thu Thập</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        setTimeout(() => {
            const popup = document.getElementById('mq-reward-popup');
            if(popup) {
                popup.style.opacity = '1';
                popup.lastElementChild.style.transform = 'scale(1) translateY(0)';
            }
        }, 50);
    },

    saveScore: async function(score, gameType) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            console.warn("Khách vãng lai, không lưu điểm.");
            this.showRewardPopup("Bạn đang chơi dưới tư cách Khách. Hãy Đăng Nhập ở trang chủ để lưu điểm và nhận Xu nhé!", 0);
            return;
        }

        const user = JSON.parse(userStr);
        console.log(`Đang gửi điểm của ${user.username} lên Máy chủ...`);

        try {
            const response = await fetch('/api/auth/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: user.username,
                    score: score,
                    gameType: gameType
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log("Lưu điểm thành công!");

                user.coins = result.newCoins;
                localStorage.setItem('user', JSON.stringify(user));

                this.showRewardPopup(result.message, result.newCoins);

            } else {
                console.error("Lỗi từ server:", result.message);
                this.showRewardPopup("Lỗi từ server: " + result.message, user.coins);
            }
        } catch (error) {
            console.error("Lỗi mất mạng hoặc sập server:", error);
            this.showRewardPopup("Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng!", user.coins || 0);
        }
    },

    showItemRewardPopup: function(itemName, amount, icon = 'monetization_on', message = "Phần thưởng đã được chuyển vào túi đồ!") {
        const oldPopup = document.getElementById('mq-item-popup');
        if (oldPopup) oldPopup.remove();

        const iconHtml = icon.includes('.') || icon.includes('/')
            ? `<img src="${icon}" style="width: 100px; height: 100px; object-fit: contain; filter: drop-shadow(0 0 25px rgba(250,204,21,0.8));">`
            : `<span class="material-symbols-outlined" style="font-size: 100px; color: #facc15; text-shadow: 0 0 40px rgba(250,204,21,1);">${icon}</span>`;

        const html = `
            <style>
                @keyframes floatItem {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes shineGlow {
                    0% { left: -100%; }
                    20% { left: 100%; }
                    100% { left: 100%; }
                }
            </style>
            <div id="mq-item-popup" style="position: fixed; inset: 0; z-index: 9999999; background: radial-gradient(circle at center, rgba(10,15,20,0.85) 0%, rgba(0,0,0,0.95) 100%); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s ease; font-family: 'Lexend', sans-serif;">

                <div style="position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 60%); border-radius: 50%; z-index: 1; animation: floatItem 4s ease-in-out infinite reverse;"></div>

                <div style="position: relative; z-index: 2; background: linear-gradient(180deg, rgba(20,25,30,0.9) 0%, rgba(10,15,20,0.95) 100%); border: 1px solid rgba(250,204,21,0.5); border-radius: 20px; padding: 50px 40px; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(250,204,21,0.15); transform: scale(0.6) translateY(60px); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); max-width: 420px; width: 90%; overflow: hidden;">

                    <div style="position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); transform: skewX(-25deg); animation: shineGlow 3s infinite;"></div>

                    <h3 style="color: #00f3ff; margin: 0 0 30px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; text-shadow: 0 0 10px rgba(0,243,255,0.5);">BẠN VỪA NHẬN ĐƯỢC</h3>

                    <div style="margin: 30px 0 40px 0; display: flex; justify-content: center; animation: floatItem 3s ease-in-out infinite;">
                        ${iconHtml}
                    </div>

                    <h2 style="color: #facc15; margin: 0 0 15px 0; font-size: 40px; font-weight: 900; text-transform: uppercase; text-shadow: 0 0 25px rgba(250,204,21,0.5);">
                        +${amount.toLocaleString()} <span style="font-size: 26px;">${itemName}</span>
                    </h2>

                    <p style="color: #aaa; font-size: 15px; margin-bottom: 40px; line-height: 1.6;">${message}</p>

                    <button onclick="document.getElementById('mq-item-popup').style.opacity='0'; document.getElementById('mq-item-popup').firstElementChild.style.transform='scale(0.8)'; setTimeout(()=>document.getElementById('mq-item-popup').remove(), 400)" style="background: linear-gradient(90deg, #facc15, #ffb703); color: #000; border: none; padding: 16px 50px; border-radius: 12px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 25px rgba(250,204,21,0.4); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-4px) scale(1.05)'; this.style.boxShadow='0 15px 35px rgba(250,204,21,0.6)';" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 25px rgba(250,204,21,0.4)';">THU THẬP</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        try {
            const audio = new Audio('/sounds/correct.mp3');
            audio.volume = 0.6;
            audio.play().catch(_e => console.log('Trình duyệt chặn autoplay âm thanh'));
        } catch(_e) { /* ignore audio error */ }

        setTimeout(() => {
            const popup = document.getElementById('mq-item-popup');
            if(popup) {
                popup.style.opacity = '1';
                popup.children[1].style.transform = 'scale(1) translateY(0)';
            }
        }, 50);
    }
};

window.MathQuestBridge = MathQuestBridge;
