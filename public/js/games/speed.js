const SpeedGame = {
    score: 0,
    isPlaying: false,
    timer: null,
    timeLeft: 100, // 100% thanh thời gian
    currentEquation: {}, // Lưu phép tính hiện tại

    // 1. Khởi động
    start: function() {
        this.score = 0;
        this.isPlaying = true;
        this.timeLeft = 100;
        
        document.getElementById('speed-score').innerText = "0";
        document.getElementById('time-bar').style.width = "100%";
        document.getElementById('time-bar').style.backgroundColor = "#00ffff";

        // Lắng nghe bàn phím
        document.addEventListener('keydown', this.handleInput);

        this.nextQuestion();
        this.startTimer();
    },

    // 2. Tạo câu hỏi
    nextQuestion: function() {
        // Tăng độ khó: Điểm càng cao, số càng to
        let max = 10 + (this.score * 2); 
        let a = Math.floor(Math.random() * max) + 1;
        let b = Math.floor(Math.random() * max) + 1;
        let realResult = a + b;
        
        // 50% tỉ lệ ra ĐÚNG, 50% tỉ lệ ra SAI
        let isCorrect = Math.random() > 0.5;
        let displayResult = isCorrect ? realResult : (realResult + (Math.random() > 0.5 ? 1 : -1));

        // Lưu đáp án đúng vào biến để lát kiểm tra
        this.currentEquation = {
            text: `${a} + ${b} = ${displayResult}`,
            isTrue: isCorrect
        };

        // Hiển thị ra màn hình
        document.getElementById('math-equation').innerText = this.currentEquation.text;
        
        // Reset thời gian (Càng chơi lâu thời gian càng ít)
        this.timeLeft = 100; 
    },

    // 3. Xử lý khi bấm phím
    handleInput: function(e) {
        if (!SpeedGame.isPlaying) return;

        if (e.key === "ArrowLeft") { // Bấm SAI
            SpeedGame.checkAnswer(false);
        } else if (e.key === "ArrowRight") { // Bấm ĐÚNG
            SpeedGame.checkAnswer(true);
        }
    },

    // 4. Kiểm tra đúng sai
    checkAnswer: function(userChoice) {
        // userChoice: true (Người chơi bảo Đúng), false (Người chơi bảo Sai)
        // this.currentEquation.isTrue: Đáp án thực tế
        
        if (userChoice === this.currentEquation.isTrue) {
            // --- TRẢ LỜI ĐÚNG ---
            SoundManager.play('correct');
            this.score++;
            document.getElementById('speed-score').innerText = this.score;
            this.nextQuestion(); // Qua câu mới ngay
        } else {
            // --- TRẢ LỜI SAI ---
            SoundManager.play('wrong');
            this.gameOver();
        }
    },

    // 5. Đồng hồ đếm ngược (Chạy liên tục)
    startTimer: function() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;

            // Tốc độ tụt thanh năng lượng (Càng điểm cao tụt càng nhanh)
            let drainSpeed = 0.5 + (this.score * 0.05); 
            this.timeLeft -= drainSpeed;

            const bar = document.getElementById('time-bar');
            bar.style.width = this.timeLeft + "%";

            // Đổi màu thanh khi sắp hết giờ (Xanh -> Vàng -> Đỏ)
            if (this.timeLeft < 30) bar.style.backgroundColor = "#ff4757";
            else if (this.timeLeft < 60) bar.style.backgroundColor = "#f1c40f";
            else bar.style.backgroundColor = "#00ffff";

            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 50); // Cập nhật mỗi 50ms
    },

    // 6. Kết thúc game
    gameOver: function() {
        this.isPlaying = false;
        clearInterval(this.timer);
        document.removeEventListener('keydown', this.handleInput); // Gỡ sự kiện phím
        
        alert("Hết giờ/Sai rồi! Điểm của bạn: " + this.score);
        saveHighScore('speed', this.score); // Lưu điểm
        
        // Quay về trang chủ hoặc Reset (Ở đây ta gọi lại menu chính)
        MainApp.goHome();
    }
};