const SequenceGame = {
    hiddenNumber: 0,
    score: 0, // Thêm biến lưu điểm

    // 1. Hàm khởi động (Chạy khi mới vào game hoặc chơi lại từ đầu)
    init: function() {
        this.score = 0; // Reset điểm về 0
        this.nextLevel(); // Tạo câu hỏi đầu tiên
    },

    // 2. Hàm tạo câu hỏi mới (Giữ nguyên logic tạo số của bạn)
    nextLevel: function() {
        // Reset giao diện
        document.getElementById('seq-feedback').innerText = "";
        document.getElementById('seq-input').value = "";
        document.getElementById('seq-next-btn').style.display = "none";
        
        // --- LOGIC CŨ CỦA BẠN ---
        let start = Math.floor(Math.random() * 10) + 1;
        let step = Math.floor(Math.random() * 5) + 1;
        let sequence = [];
        
        for (let i = 0; i < 5; i++) sequence.push(start + (i * step));

        let hiddenIndex = Math.floor(Math.random() * 5);
        this.hiddenNumber = sequence[hiddenIndex];
        sequence[hiddenIndex] = "?"; // Ẩn số đi

        // Hiển thị ra màn hình kèm điểm số hiện tại
        document.getElementById('seq-display').innerHTML = sequence.join(" - ") + `<br><small>(Điểm hiện tại: ${this.score})</small>`;
    },

    // 3. Kiểm tra đáp án
    checkAnswer: function() {
        let val = parseInt(document.getElementById('seq-input').value);
        let fb = document.getElementById('seq-feedback');
        
        if (val === this.hiddenNumber) {
            // --- TRƯỜNG HỢP ĐÚNG ---
            this.score++; // Cộng 1 điểm
            
            fb.innerText = "Chính xác! (+1 điểm)";
            fb.style.color = "green";
            
            // Hiện nút câu tiếp theo
            const nextBtn = document.getElementById('seq-next-btn');
            nextBtn.style.display = "inline-block";
            
            // Sửa lại hành động của nút này: Gọi nextLevel chứ không phải init (để không bị reset điểm)
            nextBtn.onclick = () => this.nextLevel(); 

        } else {
            // --- TRƯỜNG HỢP SAI (GAME OVER) ---
            fb.innerText = `Sai rồi! Đáp án là ${this.hiddenNumber}.`;
            fb.style.color = "red";
            
            // >>> GỌI HÀM LƯU ĐIỂM <<<
            saveHighScore('sequence', this.score); // Truyền chữ 'sequence'
            
            // Thông báo và chơi lại sau 2 giây
            setTimeout(() => {
                alert("Kết thúc! Tổng điểm của bạn: " + this.score);
                this.init(); // Reset game về 0 điểm
            }, 1000);
        }
    }
};