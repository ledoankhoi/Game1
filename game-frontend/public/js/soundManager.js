const SoundManager = {
    sounds: {
        correct: new Audio('sounds/correct.mp3'),
        wrong:   new Audio('sounds/wrong.mp3'),
        bgm:     new Audio('sounds/bgm_test.mp3'),
        click:   new Audio('sounds/click_test.mp3')
    },
    
    // Đọc trạng thái Mute trực tiếp từ Settings của React
    isMuted: localStorage.getItem('global_sound') === 'false',

    init: function() {
        this.sounds.bgm.loop = true; 
        this.sounds.bgm.volume = 0.3;

        // LẮNG NGHE TÍN HIỆU TỪ REACT CÀI ĐẶT
        window.addEventListener('settingsChange', (e) => {
            if (e.detail.type === 'sound') {
                this.isMuted = !e.detail.value; // Nếu value (soundEnabled) là true -> isMuted = false
                
                // Xử lý bật/tắt nhạc nền ngay lập tức
                if (this.isMuted) {
                    this.sounds.bgm.pause();
                } else {
                    // Nếu bật âm thanh thì cố gắng phát nhạc nền
                    this.sounds.bgm.play().catch(err => console.log("Trình duyệt yêu cầu tương tác trước khi phát nhạc."));
                }
            }
        });
    },

    play: function(name) {
        if (this.isMuted) return; // Nếu đang Mute thì không phát gì cả

        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0; 
            this.sounds[name].play().catch(e => console.log("Chưa tải được file: " + name));
        }
    },

    toggleMusic: function() {
        if (this.isMuted) return; // Không cho bật/tắt tay nếu đang Mute ở Settings tổng
        
        if (this.sounds.bgm.paused) {
            this.sounds.bgm.play().catch(e => {});
        } else {
            this.sounds.bgm.pause();
        }
    },

    toggleMute: function() {
        // Cập nhật state nội bộ (nếu game có nút bấm riêng)
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.sounds.bgm.pause();
            return "🔇"; 
        } else {
            this.sounds.bgm.play().catch(e => {});
            return "🔊"; 
        }
    }
};

// Gọi khởi tạo ngay
SoundManager.init();