const ScoreManager = {
    save: async function(gameType, score) {
        // 1. Lấy thông tin User
        // Lưu ý: auth.js của bạn lưu key là 'user_info'
        const userJson = localStorage.getItem('user_info');
        
        if (!userJson) {
            console.log("⚠️ Chưa đăng nhập -> Không lưu điểm.");
            return;
        }

        const user = JSON.parse(userJson);
        const username = user.username;

        console.log(`🚀 Đang gửi điểm lên Server: [${gameType}] - ${score} điểm...`);

        try {
            // 2. Gọi API
            const response = await fetch('http://localhost:3000/api/auth/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username, 
                    gameType: gameType, 
                    score: score 
                })
            });

            const data = await response.json();
            
            // 3. Xử lý kết quả
            if (data.success) {
                console.log("✅ Server đã nhận:", data.message);
                
                // Cập nhật số tiền trên màn hình
                const coinEl = document.getElementById('user-coin');
                if (coinEl && data.newCoins !== undefined) {
                    coinEl.innerText = data.newCoins;
                    // Hiệu ứng nháy
                    coinEl.style.color = '#ffff00';
                    setTimeout(() => coinEl.style.color = '', 500);
                }

                // Cập nhật localStorage
                user.coins = data.newCoins;
                localStorage.setItem('user_info', JSON.stringify(user));
            } else {
                console.error("❌ Lỗi từ Server:", data.message);
            }

        } catch (error) {
            console.error("❌ Lỗi kết nối mạng:", error);
        }
    }
};