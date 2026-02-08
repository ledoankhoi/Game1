const MonsterGame = {
    monsters: [],
    score: 0,
    isPlaying: false,
    loopId: null,
    spawnTimeout: null, // Thêm biến để quản lý việc sinh quái

    // 1. Bắt đầu Game
    start: function() {
        this.monsters = [];
        this.score = 0;
        this.isPlaying = true;

        // Reset giao diện
        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('monster-score').innerText = "0";
        document.getElementById('monster-input').value = "";
        document.getElementById('monster-input').focus();
        
        // Xóa quái cũ nếu còn sót
        document.querySelectorAll('.monster').forEach(e => e.remove());

        // Bắt đầu vòng lặp
        this.loop();
        this.spawnLoop();
    },

    // 2. Vòng lặp sinh quái vật (2 giây/con)
    spawnLoop: function() {
        if (!this.isPlaying) return;
        
        this.createMonster();
        
        // Lưu timeout vào biến để lát nữa clear cho sạch
        this.spawnTimeout = setTimeout(() => this.spawnLoop(), 2000); 
    },

    // 3. Tạo 1 con quái vật
    createMonster: function() {
        let n1 = Math.floor(Math.random() * 10) + 1; // +1 để tránh số 0 cho khó hơn xíu
        let n2 = Math.floor(Math.random() * 10) + 1;
        
        let m = {
            id: Date.now(),
            text: `${n1} + ${n2}`,
            ans: n1 + n2,
            x: 90, // Bắt đầu từ 90% bên phải
            el: document.createElement('div')
        };

        // Tạo giao diện cho con quái
        m.el.className = 'monster';
        m.el.innerText = m.text;
        m.el.style.position = 'absolute'; // Đảm bảo CSS hoạt động
        m.el.style.top = Math.floor(Math.random() * 80) + '%'; // Vị trí ngẫu nhiên theo chiều dọc
        
        document.getElementById('battlefield').appendChild(m.el);
        this.monsters.push(m);
    },

    // 4. Vòng lặp chính của Game (Chuyển động)
    loop: function() {
        if (!this.isPlaying) return;
        
        // Cập nhật vị trí
        this.monsters.forEach(m => {
            m.x -= 0.15; // Tốc độ di chuyển (Chỉnh số này để nhanh/chậm)
            m.el.style.left = m.x + '%';
        });

        // Kiểm tra thua (Quái chạm lề trái: x <= 0)
        if (this.monsters.some(m => m.x <= 0)) {
            this.endGame();
            return;
        }

        this.loopId = requestAnimationFrame(() => this.loop());
    },

    // 5. Kiểm tra người chơi nhập đáp án
    checkInput: function(val) {
        // Tìm xem có con quái nào có đáp án trùng với số vừa nhập không
        let idx = this.monsters.findIndex(m => m.ans === parseInt(val));
        
        if (idx !== -1) {
            // ĐÚNG: Xóa quái, cộng điểm
            this.monsters[idx].el.remove();
            this.monsters.splice(idx, 1);
            
            this.score += 10;
            document.getElementById('monster-score').innerText = this.score;
            document.getElementById('monster-input').value = ""; // Xóa ô nhập sau khi đúng
        }
    },

    // 6. Xử lý Game Over (Quan trọng nhất)
    endGame: function() {
        this.isPlaying = false;
        cancelAnimationFrame(this.loopId); // Dừng chuyển động
        clearTimeout(this.spawnTimeout);   // Dừng sinh quái
        
        document.getElementById('game-over-overlay').classList.remove('hidden');
        
        // Xóa hết quái trên màn hình cho sạch
        document.querySelectorAll('.monster').forEach(e => e.remove());
        this.monsters = [];

        saveHighScore('monster', this.score); // Truyền chữ 'monster'
        // ---------------------------------------------
    }
};

// --- LẮNG NGHE SỰ KIỆN (Để ở ngoài object) ---
const inputElement = document.getElementById('monster-input');

// Xóa sự kiện cũ (đề phòng bị lặp) rồi gán sự kiện mới
inputElement.replaceWith(inputElement.cloneNode(true));
document.getElementById('monster-input').addEventListener('input', (e) => {
    if (MonsterGame.isPlaying) {
        MonsterGame.checkInput(e.target.value);
    }
});

// Sự kiện bấm Enter để chơi lại khi Game Over
document.getElementById('game-over-overlay').addEventListener('click', () => {
    MonsterGame.start();
});