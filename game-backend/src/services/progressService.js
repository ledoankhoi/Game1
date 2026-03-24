// File: game-backend/src/services/progressService.js

/**
 * Hàm này được gọi mỗi khi người chơi hoàn thành 1 ván game
 * Nó sẽ cập nhật tiến độ Nhiệm vụ và Thành tựu
 */
exports.updateGameProgress = (user, score) => {
    let notifications = []; // Lưu lại các thông báo mở khóa để gửi về Frontend

    // 1. Khởi tạo dữ liệu nếu tài khoản cũ chưa có
    if (!user.stats) user.stats = { totalGamesPlayed: 0 };
    if (!user.questProgress) user.questProgress = new Map();
    if (!user.unlockedAchievements) user.unlockedAchievements = [];
    if (!user.completedQuests) user.completedQuests = [];

    // 2. Cập nhật chỉ số chung (Stats)
    user.stats.totalGamesPlayed = (user.stats.totalGamesPlayed || 0) + 1;

    // ==========================================
    // 3. KIỂM TRA & CẬP NHẬT NHIỆM VỤ (QUESTS)
    // ==========================================
    
    // Nhiệm vụ: Chơi 3 ván game (ID: play3Games)
    if (!user.completedQuests.includes('play3Games')) {
        let play3Progress = user.questProgress.get('play3Games') || 0;
        play3Progress += 1;
        user.questProgress.set('play3Games', play3Progress);

        if (play3Progress >= 3) {
            user.completedQuests.push('play3Games');
            notifications.push({ type: 'quest', message: 'Hoàn thành nhiệm vụ: Chơi 3 Ván Game!' });
            // Lưu ý: Việc cộng thưởng (Coins/Exp) thường được làm ở một API "Nhận thưởng" riêng, 
            // hoặc bạn có thể cộng trực tiếp tại đây nếu muốn tự động nhận.
        }
    }

    // Nhiệm vụ: Thợ săn điểm số (ID: scoreHunter - Yêu cầu 10000 điểm tổng)
    if (!user.completedQuests.includes('scoreHunter')) {
        let scoreHunterProgress = user.questProgress.get('scoreHunter') || 0;
        scoreHunterProgress += score; // Cộng dồn điểm ván này
        user.questProgress.set('scoreHunter', scoreHunterProgress);

        if (scoreHunterProgress >= 10000) {
            user.completedQuests.push('scoreHunter');
            notifications.push({ type: 'quest', message: 'Hoàn thành nhiệm vụ: Thợ Săn Điểm Số!' });
        }
    }

    // ==========================================
    // 4. KIỂM TRA & CẬP NHẬT THÀNH TỰU (ACHIEVEMENTS)
    // ==========================================

    // Thành tựu: Khởi động - Chơi ván đầu tiên (ID: firstBlood)
    if (!user.unlockedAchievements.includes('firstBlood') && user.stats.totalGamesPlayed >= 1) {
        user.unlockedAchievements.push('firstBlood');
        notifications.push({ type: 'achievement', message: 'Mở khóa Thành tựu: Khởi Động!' });
    }

    // Thành tựu: Đại gia - Sở hữu 10,000 Xu (ID: richMan)
    if (!user.unlockedAchievements.includes('richMan') && user.coins >= 10000) {
        user.unlockedAchievements.push('richMan');
        notifications.push({ type: 'achievement', message: 'Mở khóa Thành tựu: Đại Gia!' });
    }

    // Trả về danh sách thông báo để gửi cho Frontend hiển thị Popup
    return notifications;
};