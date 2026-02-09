const MonsterGame = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    playerHP: 100,
    wave: 1,
    maxWaves: 10,
    enemiesSpawnedInWave: 0,
    enemiesToSpawn: 0,
    monsters: [],
    spawnRate: 2000,
    lastSpawnTime: 0,
    animationFrameId: null,
    gameContainer: null,
    inputEl: null,
    inputDisplay: null,

    waveConfig: function(wave) {
        return {
            count: 5 + (wave * 2),
            speedMultiplier: 1 + (wave * 0.1),
            spawnInterval: Math.max(800, 2500 - (wave * 150))
        };
    },

    start: function() {
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.playerHP = 100;
        this.wave = 1;
        this.monsters = [];
        
        this.setupWave(1);
        this.updateHPUI();
        
        document.getElementById('monster-score').innerText = '0';
        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('pause-overlay').classList.add('hidden');
        
        this.gameContainer = document.getElementById('battlefield');
        this.gameContainer.querySelectorAll('.enemy-ship, .plasma-bullet, .explosion').forEach(el => el.remove());

        // --- CẤU HÌNH INPUT ---
        this.inputEl = document.getElementById('monster-input');
        this.inputDisplay = document.getElementById('input-display');
        
        this.inputEl.value = '';
        this.inputDisplay.innerText = '';
        this.inputEl.focus();
        
        document.onclick = (e) => { 
            if(this.isPlaying && !this.isPaused && !e.target.closest('button')) {
                this.inputEl.focus(); 
            }
        };
        
        // 1. CHỈ HIỆN SỐ KHI GÕ (CHƯA BẮN)
        this.inputEl.oninput = (e) => {
            let val = e.target.value;
            val = val.replace(/[^0-9]/g, ''); // Chỉ lấy số
            if (val.length > 3) val = val.slice(0, 3); // Giới hạn 3 số
            
            e.target.value = val;
            this.inputDisplay.innerText = val; // Hiện số lên màn hình
            this.inputDisplay.style.color = '#25f46a'; // Màu xanh mặc định
        };
        
        // 2. BẤM ENTER ĐỂ BẮN
        this.inputEl.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const val = this.inputEl.value;
                if (val.length > 0) {
                    this.checkAndFire(val);
                }
            }
        };

        this.lastSpawnTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    // --- KIỂM TRA & BẮN ---
    checkAndFire: function(inputValue) {
        const value = parseInt(inputValue);
        if (isNaN(value)) return;

        // Tìm quái có đáp án đúng
        const target = this.monsters.find(m => parseInt(m.dataset.answer) === value);

        if (target) {
            // ĐÚNG -> Bắn đạn
            this.fireProjectile(target);
            
            // Xóa ngay lập tức
            this.inputEl.value = '';
            this.inputDisplay.innerText = '';
        } else {
            // SAI -> Báo đỏ, không xóa để người chơi biết mình sai
            this.inputDisplay.style.color = '#ff4757';
            
            // Rung lắc nhẹ ô hiển thị (Hiệu ứng sai)
            const display = document.getElementById('input-display');
            display.style.transform = 'translateX(5px)';
            setTimeout(() => display.style.transform = 'translateX(-5px)', 50);
            setTimeout(() => display.style.transform = 'translateX(0)', 100);
        }
    },

    // --- HỆ THỐNG ĐẠN BAY (Khôi phục lại) ---
    fireProjectile: function(target) {
        if (!target) return;

        // 1. Tính toán vị trí
        const ship = document.getElementById('player-ship');
        const shipRect = ship.getBoundingClientRect();
        const gameRect = this.gameContainer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const startX = (shipRect.left + shipRect.width / 2) - gameRect.left;
        const startY = (shipRect.top + shipRect.height / 2) - gameRect.top;

        // Đích đến (dự đoán vị trí quái)
        const endX = (targetRect.left + targetRect.width / 2) - gameRect.left;
        const endY = (targetRect.top + targetRect.height / 2) - gameRect.top;

        // Góc xoay
        const deltaX = endX - startX;
        const deltaY = endY - startY; 
        const angleRad = Math.atan2(deltaX, -deltaY);
        const angleDeg = angleRad * (180 / Math.PI);

        // 2. Xoay tàu
        const shipVisual = document.getElementById('ship-body-visual');
        if (shipVisual) {
            shipVisual.style.transform = `rotate(${angleDeg}deg)`;
            setTimeout(() => { shipVisual.style.transform = `rotate(0deg)`; }, 300);
        }

        // 3. Tạo đạn
        const bullet = document.createElement('div');
        bullet.classList.add('plasma-bullet');
        
        bullet.style.left = startX + 'px';
        bullet.style.top = startY + 'px';
        bullet.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
        
        this.gameContainer.appendChild(bullet);

        if (typeof SoundManager !== 'undefined') SoundManager.play('click');

        // 4. Animation bay
        void bullet.offsetWidth; // Trigger reflow
        bullet.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${angleDeg}deg)`;

        // 5. Chạm mục tiêu (Sau 200ms)
        setTimeout(() => {
            bullet.remove();
            this.hitEnemy(target);
        }, 200); 
    },

    hitEnemy: function(target) {
        if (!target || !target.parentNode) return;

        let hp = parseInt(target.dataset.hp);
        hp -= 10; 
        target.dataset.hp = hp;

        if (hp <= 0) {
            this.createExplosion(target);
            target.remove();
            const idx = this.monsters.indexOf(target);
            if (idx > -1) this.monsters.splice(idx, 1);

            this.score += parseInt(target.dataset.points);
            document.getElementById('monster-score').innerText = this.score;
            if (typeof SoundManager !== 'undefined') SoundManager.play('correct');
        } else {
            // Boss logic
            const maxHp = parseInt(target.dataset.maxHp);
            const percent = (hp / maxHp) * 100;
            target.querySelector('.boss-hp-fill').style.width = `${percent}%`;
            
            const newQ = this.generateBossQuestion();
            target.dataset.answer = newQ.answer;
            target.querySelector('.boss-question').innerText = newQ.question;
            
            target.style.filter = "brightness(2)";
            setTimeout(() => target.style.filter = "none", 100);
            this.createExplosion(target, true);
        }
    },

    // ... (Các phần còn lại giữ nguyên) ...
    setupWave: function(waveLevel) {
        this.wave = waveLevel;
        document.getElementById('wave-count').innerText = this.wave;
        const config = this.waveConfig(this.wave);
        this.enemiesToSpawn = config.count;
        this.enemiesSpawnedInWave = 0;
        this.spawnRate = config.spawnInterval;
        this.showRadarText(`WARNING: WAVE ${this.wave} INCOMING`);
    },

    togglePause: function() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        const overlay = document.getElementById('pause-overlay');
        if (this.isPaused) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
            this.inputEl.focus();
            this.lastSpawnTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    },

    gameLoop: function(currentTime) {
        if (!this.isPlaying || this.isPaused) return;

        if (currentTime - this.lastSpawnTime > this.spawnRate) {
            if (this.enemiesSpawnedInWave < this.enemiesToSpawn) {
                this.spawnMonster();
                this.lastSpawnTime = currentTime;
            } else if (this.monsters.length === 0) {
                if (this.wave < this.maxWaves) {
                    this.setupWave(this.wave + 1);
                } else {
                    this.victory();
                    return;
                }
            }
        }

        this.updateMonsters();
        this.updateRadar();
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    },

    spawnMonster: function() {
        this.enemiesSpawnedInWave++;
        if (this.wave === this.maxWaves && this.enemiesSpawnedInWave === this.enemiesToSpawn) {
            this.createEnemy('boss');
        } else {
            const rand = Math.random();
            if (rand < 0.6) this.createEnemy('small');
            else if (rand < 0.9) this.createEnemy('medium');
            else this.createEnemy('large');
        }
    },

    createEnemy: function(type) {
        let question, answer, cssClass, points, hp;
        
        if (type === 'small') {
            cssClass = 'enemy-small'; points = 10; hp = 1;
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            if (Math.random() > 0.5) { question = `${a}+${b}`; answer = a+b; }
            else { const max=Math.max(a,b); const min=Math.min(a,b); question = `${max}-${min}`; answer = max-min; }
        } else if (type === 'medium') {
            cssClass = 'enemy-medium'; points = 20; hp = 1;
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            question = `${a}x${b}`; answer = a*b;
        } else if (type === 'large') {
            cssClass = 'enemy-large'; points = 50; hp = 1;
            const x = Math.floor(Math.random() * 10) + 1;
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = a*x + b;
            question = `${a}x+${b}=${c}`; answer = x;
        } else if (type === 'boss') {
            cssClass = 'enemy-boss'; points = 500; hp = 100;
            const q = this.generateBossQuestion();
            question = q.question;
            answer = q.answer;
        }

        const monster = document.createElement('div');
        monster.classList.add('enemy-ship', cssClass);
        
        if (type === 'boss') {
            monster.innerHTML = `<div class="boss-hp-bar"><div class="boss-hp-fill"></div></div><span class="boss-question">${question}</span>`;
        } else {
            monster.innerText = question;
        }
        
        const maxWidth = this.gameContainer.offsetWidth - 180;
        monster.style.left = (Math.random() * maxWidth + 20) + 'px';
        monster.style.top = '-180px';

        monster.dataset.answer = answer;
        monster.dataset.type = type;
        monster.dataset.hp = hp;
        monster.dataset.maxHp = hp;
        monster.dataset.points = points;
        monster.dataset.top = -180;

        this.gameContainer.appendChild(monster);
        this.monsters.push(monster);
    },

    generateBossQuestion: function() {
        const types = ['pow', 'sqrt', 'mod'];
        const t = types[Math.floor(Math.random() * types.length)];
        if (t === 'pow') { const a = Math.floor(Math.random() * 5) + 2; return { question: `${a}²`, answer: a*a }; }
        else if (t === 'sqrt') { const a = Math.floor(Math.random() * 10) + 2; return { question: `√${a*a}`, answer: a }; }
        else { const a = Math.floor(Math.random() * 50) + 10; const b = Math.floor(Math.random() * 5) + 2; return { question: `${a}%${b}`, answer: a%b }; }
    },

    updateMonsters: function() {
        const waveSpeed = this.waveConfig(this.wave).speedMultiplier;
        this.monsters.forEach((monster, index) => {
            let speed = waveSpeed;
            if (monster.dataset.type === 'boss') speed *= 0.3;
            
            let currentTop = parseFloat(monster.dataset.top);
            currentTop += speed;
            monster.dataset.top = currentTop;
            monster.style.top = `${currentTop}px`;

            if (currentTop > (this.gameContainer.offsetHeight - 100)) {
                this.damagePlayer(20);
                monster.remove();
                this.monsters.splice(index, 1);
            }
        });
    },

    updateRadar: function() {
        if (this.monsters.length === 0) { this.showRadarText("SECTOR CLEAR..."); return; }
        let nearest = this.monsters[0];
        let maxTop = parseFloat(nearest.dataset.top);
        for (let i = 1; i < this.monsters.length; i++) {
            const top = parseFloat(this.monsters[i].dataset.top);
            if (top > maxTop) { maxTop = top; nearest = this.monsters[i]; }
        }
        let qText = nearest.innerText;
        if (nearest.dataset.type === 'boss') qText = nearest.querySelector('.boss-question').innerText;
        
        const radar = document.getElementById('math-equation-display');
        if (!radar.innerHTML.includes(qText)) radar.innerHTML = `LOCKED: <span class="text-[#25f46a] text-3xl">${qText}</span>`;
    },

    damagePlayer: function(amount) {
        this.playerHP -= amount;
        if (this.playerHP < 0) this.playerHP = 0;
        this.updateHPUI();
        this.gameContainer.classList.add('shake');
        setTimeout(() => this.gameContainer.classList.remove('shake'), 500);
        if (this.playerHP <= 0) this.gameOver();
    },

    updateHPUI: function() {
        document.getElementById('player-hp-text').innerText = `${this.playerHP}%`;
        document.getElementById('player-hp-bar').style.width = `${this.playerHP}%`;
        const bar = document.getElementById('player-hp-bar');
        if (this.playerHP > 50) bar.style.backgroundColor = '#25f46a';
        else if (this.playerHP > 20) bar.style.backgroundColor = 'orange';
        else bar.style.backgroundColor = 'red';
    },

    createExplosion: function(target, isSmall = false) {
        const boom = document.createElement('div');
        boom.innerText = "💥";
        boom.style.position = "absolute";
        
        const width = target.offsetWidth;
        boom.style.left = parseFloat(target.style.left) + (width/4) + "px"; 
        boom.style.top = target.style.top;
        
        boom.style.fontSize = isSmall ? "40px" : "60px";
        boom.style.zIndex = "20";
        this.gameContainer.appendChild(boom);
        setTimeout(() => boom.remove(), 500);
    },

    showRadarText: function(text) {
        document.getElementById('math-equation-display').innerHTML = `<span class="animate-pulse">${text}</span>`;
    },

    victory: function() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationFrameId);
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('end-game-title').innerText = "MISSION ACCOMPLISHED";
        document.getElementById('end-game-title').className = "text-5xl font-black text-[#25f46a] mb-4 tracking-tighter";
        document.getElementById('end-game-msg').innerText = `GALAXY SAVED! SCORE: ${this.score}`;
        if (typeof saveHighScore === 'function') saveHighScore('monster', this.score);
    },

    gameOver: function() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationFrameId);
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('end-game-title').innerText = "MISSION FAILED";
        document.getElementById('end-game-title').className = "text-5xl font-black text-red-500 mb-4 tracking-tighter";
        document.getElementById('end-game-msg').innerText = `BASE DESTROYED - SCORE: ${this.score}`;
        if (typeof saveHighScore === 'function') saveHighScore('monster', this.score);
    }
};