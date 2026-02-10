/**
 * monsterExtension.js
 * Quản lý giao diện Game Over / Report mà không can thiệp vào core game
 */

const MonsterExtension = {
    // Cấu hình Rank
    ranks: {
        S: { min: 10000, label: 'S', color: 'text-yellow-400' },
        A: { min: 5000, label: 'A', color: 'text-primary' },
        B: { min: 2000, label: 'B', color: 'text-blue-400' },
        C: { min: 0, label: 'C', color: 'text-gray-400' }
    },

    /**
     * Hàm gọi khi game kết thúc
     * @param {number} finalScore - Điểm số cuối cùng
     * @param {Array} historyLog - (Tùy chọn) Mảng lịch sử các câu trả lời
     * format historyLog: [{ question: "2+2", answer: "4", correct: true/false, type: "MATH" }]
     */
    showGameOver: function(finalScore, historyLog = []) {
        console.log("Extension: Generating Report...");

        // 1. Cập nhật điểm số
        this.updateScoreUI(finalScore);

        // 2. Tính toán Rank
        this.calculateRank(finalScore);

        // 3. Render lịch sử đấu (Debrief)
        this.renderHistory(historyLog);

        // 4. Hiển thị màn hình với hiệu ứng
        const reportScreen = document.getElementById('report-screen');
        if (reportScreen) {
            reportScreen.classList.remove('hidden');
            // Thêm chút delay để animation mượt mà nếu cần
            setTimeout(() => {
                reportScreen.classList.add('opacity-100', 'pointer-events-auto');
                reportScreen.classList.remove('opacity-0', 'pointer-events-none');
            }, 50);
        }
    },

    updateScoreUI: function(score) {
        const scoreEl = document.getElementById('report-final-score');
        if (scoreEl) scoreEl.innerText = score.toLocaleString();
    },

    calculateRank: function(score) {
        let currentRank = this.ranks.C;
        
        if (score >= this.ranks.S.min) currentRank = this.ranks.S;
        else if (score >= this.ranks.A.min) currentRank = this.ranks.A;
        else if (score >= this.ranks.B.min) currentRank = this.ranks.B;

        const gradeEl = document.getElementById('report-grade');
        if (gradeEl) {
            gradeEl.innerText = currentRank.label;
            gradeEl.className = `text-4xl font-black ${currentRank.color}`;
        }

        // Random lời nhận xét từ AI dựa trên điểm
        const feedbackEl = document.getElementById('report-feedback');
        if (feedbackEl) {
            if(currentRank.label === 'S') feedbackEl.innerText = "\"Exceptional performance! Neural linkage at 100%. You are ready for the next sector.\"";
            else if(currentRank.label === 'A') feedbackEl.innerText = "\"Solid combat data. Reaction times are optimal, but accuracy can be improved.\"";
            else feedbackEl.innerText = "\"System damage critical. Recommend tactical review and immediate recalibration.\"";
        }
    },

    renderHistory: function(history) {
        const listContainer = document.getElementById('report-list');
        if (!listContainer) return;

        listContainer.innerHTML = ''; // Xóa cũ

        // Nếu không có lịch sử (game cũ không gửi), tạo dữ liệu giả để demo giao diện
        if (!history || history.length === 0) {
            history = [
                { question: "System Override", answer: "Success", correct: true, pts: 500 },
                { question: "Firewall Breach", answer: "Failed", correct: false, pts: 0 },
                { question: "Data Recovery", answer: "Complete", correct: true, pts: 300 }
            ];
        }

        history.forEach(item => {
            const isCorrect = item.correct;
            const colorClass = isCorrect ? 'primary' : 'danger';
            const icon = isCorrect ? 'check_circle' : 'cancel';
            const pts = isCorrect ? `+${item.pts || 100} PTS` : '0 PTS';
            const status = isCorrect ? 'COMPLETED' : 'ERROR';
            
            // Màu nền: Xanh nếu đúng, Đỏ nếu sai
            const bgStyle = isCorrect 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-danger/5 border-danger/20 hover:bg-danger/10';

            const html = `
            <div class="${bgStyle} border rounded-xl p-4 flex items-center justify-between group transition-colors mb-3">
                <div class="flex items-center gap-6">
                    <div class="text-${colorClass} bg-${colorClass}/10 w-10 h-10 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div>
                        <p class="text-[10px] text-gray-500 font-bold uppercase">Log Entry</p>
                        <p class="text-sm font-bold text-white">${item.question || 'Unknown target'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs font-bold text-gray-400">${pts}</p>
                    <p class="text-[10px] text-${colorClass}">${status}</p>
                </div>
            </div>
            `;
            listContainer.innerHTML += html;
        });
    },

    retryMission: function() {
        // Reload trang để chơi lại
        window.location.reload();
    },
    
    goHome: function() {
        window.location.href = 'index.html'; // Hoặc trang chủ của bạn
    }
};