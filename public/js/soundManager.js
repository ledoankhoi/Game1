const SoundManager = {
    // Kho chứa các file âm thanh
    sounds: {
        correct: new Audio('sounds/correct.mp3'),
        wrong:   new Audio('sounds/wrong.mp3'),
        bgm:     new Audio('sounds/bgm.mp3'),
        click:   new Audio('sounds/click.mp3')
    },
    
    isMuted: false, // Trạng thái tắt tiếng

    // 1. Hàm khởi tạo (Cấu hình nhạc nền)
    init: function() {
        this.sounds.bgm.loop = true; // Lặp lại vô tận
        this.sounds.bgm.volume = 0.3; // Nhạc nền nhỏ thôi (30%)
    },

    // 2. Phát hiệu ứng (ngắn)
    play: function(name) {
        if (this.isMuted) return;

        // Nếu file đó tồn tại thì phát
        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0; // Tua về đầu (để bấm liên tục được)
            this.sounds[name].play().catch(e => console.log("Chưa tải được file: " + name));
        }
    },

    // 3. Bật/Tắt nhạc nền
    toggleMusic: function() {
        if (this.sounds.bgm.paused) {
            this.sounds.bgm.play().catch(e => console.log("Cần tương tác để phát nhạc"));
        } else {
            this.sounds.bgm.pause();
        }
    },

    // 4. Bật/Tắt toàn bộ âm thanh (Mute)
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        
        // Xử lý nhạc nền theo trạng thái Mute
        if (this.isMuted) {
            this.sounds.bgm.pause();
            return "🔇"; // Trả về icon
        } else {
            this.sounds.bgm.play().catch(e => {});
            return "🔊"; // Trả về icon
        }
    }
};

// Gọi khởi tạo ngay khi file được tải
SoundManager.init();