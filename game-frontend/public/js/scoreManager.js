// Hàm này sẽ được gọi khi Game Over
async function saveScoreToDatabase(gameId, score) {
    // 1. Lấy thẻ căn cước (Token) để chứng minh mình đã đăng nhập
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log("⚠️ Bạn chưa đăng nhập, điểm sẽ không được lưu!");
        return;
    }

    try {
        console.log(`Đang gửi ${score} điểm của game ${gameId} lên máy chủ...`);
        
        // 2. Gửi điểm lên đúng cổng 3000 kèm theo Token
        const response = await fetch('http://localhost:3000/api/auth/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Bắt buộc phải có dòng này
            },
            body: JSON.stringify({ gameId: gameId, score: score })
        });

        const data = await response.json();
        
        // 3. Nếu máy chủ báo thành công, cập nhật ngay tiền và cấp độ
        if (data.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.coins = data.newCoins;
                user.level = data.newLevel;
                // Cập nhật lại vào kho lưu trữ cục bộ
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            // Hiện thông báo chiến lợi phẩm siêu ngầu
            alert(`🎉 CHƠI HAY LẮM!\n\nChiến lợi phẩm thu được:\n💰 +${data.coinsEarned} Xu\n✨ +${data.expEarned} Kinh Nghiệm\n\nCấp độ hiện tại: Lv.${data.newLevel}`);
        } else {
            console.error("❌ Máy chủ từ chối lưu điểm:", data.message);
        }
    } catch (error) {
        console.error("❌ Lỗi mất kết nối với máy chủ:", error);
    }
}