// CÔNG CỤ KẾT NỐI GAME HTML VỚI BACKEND MATHQUEST
const MathQuestBridge = {
    // Hàm này sẽ được gọi khi người chơi Game Over hoặc Chiến Thắng
    saveScore: async function(score, gameType) {
        // 1. Móc túi người chơi xem có Thẻ thành viên (Token) không
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            console.warn("Khách vãng lai, không lưu điểm.");
            alert("Bạn đang chơi dưới tư cách Khách. Hãy Đăng Nhập ở trang chủ để lưu điểm và nhận Xu nhé!");
            return; // Dừng lại, không gửi lên server
        }

        const user = JSON.parse(userStr);
        console.log(`Đang gửi điểm của ${user.username} lên Máy chủ...`);

        try {
            // 2. Gửi xe chở Điểm số chạy sang Backend cổng 3000
            const response = await fetch('http://localhost:3000/api/auth/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Đưa vé cho Bác bảo vệ kiểm tra
                },
                body: JSON.stringify({
                    username: user.username,
                    score: score,
                    gameType: gameType // Ví dụ: 'monster', 'speed', 'sequence'
                })
            });

            const result = await response.json();
            
            // 3. Xử lý khi Máy chủ báo thành công
            if (result.success) {
                console.log("Lưu điểm thành công!");
                
                // Cập nhật lại số tiền trong túi người chơi (để lát ra web thấy tiền tăng luôn)
                user.coins = result.newCoins;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Bắn pháo hoa chúc mừng (Bạn có thể tự custom lại thông báo này cho đẹp)
                alert(`🎉 ${result.message}\n💰 Số dư mới: ${result.newCoins} Xu`);
            } else {
                console.error("Lỗi từ server:", result.message);
            }
        } catch (error) {
            console.error("Lỗi mất mạng hoặc sập server:", error);
        }
    }
};