export async function saveScoreToDatabase(gameId, score) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.log("Bạn chưa đăng nhập, điểm sẽ không được lưu!");
        return;
    }

    try {
        console.log(`Đang gửi ${score} điểm của game ${gameId} lên máy chủ...`);

        const response = await fetch('/api/auth/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gameId: gameId, score: score })
        });

        const data = await response.json();

        if (data.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.coins = data.newCoins;
                user.level = data.newLevel;
                localStorage.setItem('user', JSON.stringify(user));
            }

            alert(`CHƠI HAY LẮM!\n\nChiến lợi phẩm thu được:\n +${data.coinsEarned} Xu\n +${data.expEarned} Kinh Nghiệm\n\nCấp độ hiện tại: Lv.${data.newLevel}`);
        } else {
            console.error("Máy chủ từ chối lưu điểm:", data.message);
        }
    } catch (error) {
        console.error("Lỗi mất kết nối với máy chủ:", error);
    }
}

window.saveScoreToDatabase = saveScoreToDatabase;
