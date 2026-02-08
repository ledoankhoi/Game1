const MonsterGame = {
    monsters: [],
    score: 0,
    isPlaying: false,
    loopId: null,
    spawnTimeout: null,

    start: function() {
        this.monsters = [];
        this.score = 0;
        this.isPlaying = true;

        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('monster-score').innerText = "0";
        
        // --- XỬ LÝ Ô INPUT ---
        const input = document.getElementById('monster-input');
        input.value = ""; 
        
        // Thay thế input mới để xóa sự kiện cũ
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // SỰ KIỆN CHẶN CHỮ & BẮT PHÍM ENTER
        newInput.addEventListener("keydown", function(event) {
            // 1. Enter để bắn
            if (event.key === "Enter") {
                MonsterGame.checkInput();
                return;
            }
            // 2. Cho phép xóa/di chuyển
            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
            if (allowedKeys.includes(event.key)) return;

            // 3. CHẶN CHỮ (Chỉ cho số 0-9)
            if (!/^[0-9]$/.test(event.key)) {
                event.preventDefault();
            }
        });

        newInput.focus(); 
        // Giữ chuột luôn ở ô nhập
        newInput.onblur = () => { if(MonsterGame.isPlaying) newInput.focus(); };

        document.querySelectorAll('.monster').forEach(e => e.remove());
        this.loop();
        this.spawnLoop();
    },

    spawnLoop: function() {
        if (!this.isPlaying) return;
        this.createMonster();
        let speed = Math.max(800, 2000 - (this.score * 10)); 
        this.spawnTimeout = setTimeout(() => this.spawnLoop(), speed); 
    },

    createMonster: function() {
        let n1 = Math.floor(Math.random() * 10) + 1;
        let n2 = Math.floor(Math.random() * 10) + 1;
        let m = {
            id: Date.now(),
            text: `${n1} + ${n2}`,
            ans: n1 + n2,
            x: 90,
            el: document.createElement('div')
        };
        m.el.className = 'monster';
        m.el.innerText = m.text;
        m.el.style.position = 'absolute';
        m.el.style.top = (Math.floor(Math.random() * 70) + 10) + '%'; 
        document.getElementById('battlefield').appendChild(m.el);
        this.monsters.push(m);
    },

    loop: function() {
        if (!this.isPlaying) return;
        this.monsters.forEach(m => {
            let moveSpeed = 0.15 + (this.score * 0.005); 
            m.x -= moveSpeed; 
            m.el.style.left = m.x + '%';
        });
        if (this.monsters.some(m => m.x <= 0)) {
            this.endGame();
            return;
        }
        this.loopId = requestAnimationFrame(() => this.loop());
    },

    checkInput: function() {
        const input = document.getElementById('monster-input');
        const val = parseInt(input.value);
        if (isNaN(val)) return;

        let idx = this.monsters.findIndex(m => m.ans === val);
        if (idx !== -1 ) {
            SoundManager.play('correct');
            this.monsters[idx].el.remove();
            this.monsters.splice(idx, 1);
            this.score += 10;
            document.getElementById('monster-score').innerText = this.score;
            input.style.borderColor = "#00ffff";
            setTimeout(() => input.style.borderColor = "", 200);
            
        } else {
            SoundManager.play('wrong');
            input.style.borderColor = "#ff4757";
            setTimeout(() => input.style.borderColor = "", 200);
        }
        input.value = "";
    },

    endGame: function() {
        this.isPlaying = false;
        cancelAnimationFrame(this.loopId);
        clearTimeout(this.spawnTimeout);
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.querySelectorAll('.monster').forEach(e => e.remove());
        this.monsters = [];
        saveHighScore('monster', this.score);
    }
};

document.getElementById('game-over-overlay').addEventListener('click', () => {
    MonsterGame.start();
});