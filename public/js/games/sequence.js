const SequenceGame = {
    hiddenNumber: 0,
    score: 0,

    // 1. Khởi động game
    init: function() {
        this.score = 0;
        this.nextLevel();
        
        // --- XỬ LÝ SỰ KIỆN NHẬP LIỆU ---
        const input = document.getElementById('seq-input');
        
        // Reset ô nhập để xóa các sự kiện cũ
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Gán sự kiện chặn phím
        newInput.addEventListener("keydown", function(event) {
            
            // 1. Nếu bấm Enter -> Kiểm tra đáp án
            if (event.key === "Enter") {
                SequenceGame.checkAnswer();
                return;
            }

            // 2. Cho phép các phím chức năng: Xóa (Backspace), Delete, Mũi tên trái/phải, Tab
            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
            if (allowedKeys.includes(event.key)) {
                return; // Cho phép đi qua
            }

            // 3. CHẶN TUYỆT ĐỐI: Nếu không phải là số (0-9) -> Chặn luôn!
            if (!/^[0-9]$/.test(event.key)) {
                event.preventDefault(); // Ngăn không cho chữ xuất hiện
            }
        });
        
        // Tự động trỏ chuột vào ô nhập
        newInput.focus();
    },

    // 2. Tạo câu hỏi mới
    nextLevel: function() {
        // Reset giao diện
        document.getElementById('seq-feedback').innerText = "";
        const input = document.getElementById('seq-input');
        input.value = "";
        input.focus(); 
        
        // Ẩn nút "Câu tiếp theo"
        const nextBtn = document.getElementById('seq-next-btn');
        if(nextBtn) nextBtn.style.display = "none";
        
        // Logic tạo số
        let start = Math.floor(Math.random() * 10) + 1;
        let step = Math.floor(Math.random() * 5) + 1;
        let sequence = [];
        for (let i = 0; i < 5; i++) sequence.push(start + (i * step));

        let hiddenIndex = Math.floor(Math.random() * 5);
        this.hiddenNumber = sequence[hiddenIndex];
        sequence[hiddenIndex] = "?"; 

        document.getElementById('seq-display').innerHTML = sequence.join(" - ") + `<br><small style="color: #aaa">(Điểm: ${this.score})</small>`;
    },

    // 3. Kiểm tra đáp án
    checkAnswer: function() {
        const input = document.getElementById('seq-input');
        let val = parseInt(input.value);
        let fb = document.getElementById('seq-feedback');
        
        if (isNaN(val)) return; // Không nhập gì thì thôi

        if (val === this.hiddenNumber) {
            // --- ĐÚNG ---
            this.score++;
            fb.innerText = "✅ Chính xác!";
            fb.style.color = "#00ffff"; 
            input.style.borderColor = "#00ffff";
            setTimeout(() => input.style.borderColor = "", 500);
            SoundManager.play('correct');
            // Tự động qua câu mới sau 0.8 giây
            setTimeout(() => {
                this.nextLevel();
            }, 800); 

        } else {
            // --- SAI ---
            fb.innerText = `❌ Sai rồi! Đáp án là ${this.hiddenNumber}.`;
            fb.style.color = "#ff4757"; 
            
            saveHighScore('sequence', this.score);
            SoundManager.play('wrong');
            setTimeout(() => {
                alert("Kết thúc! Tổng điểm: " + this.score);
                this.init(); 
            }, 1000);
        }
    }
};