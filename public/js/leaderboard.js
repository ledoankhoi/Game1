const Leaderboard = {
    loadData: async function() {
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;

        // Hiện thông báo đang tải
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 20px;">⏳ Đang tải dữ liệu...</td></tr>`;

        try {
            const response = await fetch('http://localhost:3000/api/auth/leaderboard');
            const data = await response.json();

            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                // Sắp xếp lại danh sách theo tổng điểm (cao xuống thấp)
                data.data.sort((a, b) => {
                    const totalA = (a.highScores?.monster || 0) + (a.highScores?.sequence || 0) + (a.highScores?.speed || 0);
                    const totalB = (b.highScores?.monster || 0) + (b.highScores?.sequence || 0) + (b.highScores?.speed || 0);
                    return totalB - totalA;
                });

                data.data.forEach((player, index) => {
                    // Lấy điểm từng game (nếu không có thì bằng 0)
                    let monsterScore = 0;
                    let sequenceScore = 0;
                    let speedScore = 0;

                    if (player.highScores) {
                        monsterScore = player.highScores.monster || 0;
                        sequenceScore = player.highScores.sequence || 0;
                        speedScore = player.highScores.speed || 0; // Thêm game mới
                    } 
                    // (Bỏ qua logic cũ totalScore vì giờ ai cũng có highScores rồi)

                    const totalDisplay = monsterScore + sequenceScore + speedScore;

                    // Icon huy chương
                    let rankDisplay = index + 1;
                    if (index === 0) rankDisplay = "🥇";
                    if (index === 1) rankDisplay = "🥈";
                    if (index === 2) rankDisplay = "🥉";

                    // Vẽ hàng (Row)
                    const row = `
                        <tr>
                            <td style="text-align: center; font-weight: bold; font-size: 1.2em;">${rankDisplay}</td>
                            <td>${player.username}</td>
                            <td style="font-weight: bold; color: #00ffff;">
                                ${totalDisplay} 
                                <br>
                                <span style="font-size: 0.85em; color: #aaa; font-weight: normal;">
                                    (👾${monsterScore} | 🔢${sequenceScore} | ⚡${speedScore})
                                </span>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Chưa có dữ liệu</td></tr>`;
            }

        } catch (error) {
            console.error("Lỗi:", error);
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: #ff4757;">❌ Lỗi kết nối Server!</td></tr>`;
        }
    }
};