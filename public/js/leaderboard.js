const Leaderboard = {
    loadData: async function() {
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;

        // 1. Hiện thông báo đang tải
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">⏳ Đang tải dữ liệu...</td></tr>`;

        try {
            // 2. Gọi API lấy dữ liệu
            const response = await fetch('http://localhost:3000/api/auth/leaderboard');
            const data = await response.json();

            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                // 3. Duyệt qua từng người chơi
                data.data.forEach((player, index) => {
                    
                    // --- KHẮC PHỤC LỖI UNDEFINED TẠI ĐÂY ---
                    // Kiểm tra xem user có điểm không, nếu không thì gán bằng 0
                    let monsterScore = 0;
                    let sequenceScore = 0;

                    if (player.highScores) {
                        monsterScore = player.highScores.monster || 0;
                        sequenceScore = player.highScores.sequence || 0;
                    } else if (player.totalScore) {
                        // Hỗ trợ hiển thị tạm cho các user cũ (nếu có)
                        monsterScore = player.totalScore;
                    }

                    // Tính tổng điểm để hiển thị
                    const totalDisplay = monsterScore + sequenceScore;
                    // ----------------------------------------

                    // Xử lý icon huy chương
                    let rankDisplay = index + 1;
                    if (index === 0) rankDisplay = "🥇 1";
                    if (index === 1) rankDisplay = "🥈 2";
                    if (index === 2) rankDisplay = "🥉 3";

                    // Vẽ hàng (Row)
                    const row = `
                        <tr>
                            <td style="text-align: center; font-weight: bold;">${rankDisplay}</td>
                            <td>${player.username}</td>
                            <td style="font-weight: bold; color: #d35400;">
                                ${totalDisplay} 
                                <span style="font-size: 12px; color: gray; font-weight: normal;">
                                    (👾${monsterScore} | 🔢${sequenceScore})
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
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: red;">❌ Lỗi kết nối Server!</td></tr>`;
        }
    }
};