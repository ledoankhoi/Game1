/* file: public/js/games/monster.js - Phiên bản tích hợp Server Reward & PlayCount */

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
    historyLog: [], 
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
        this.historyLog = []; 
        
        this.setupWave(1);
        this.updateHPUI();
        
        document.getElementById('monster-score').innerText = '0';
        
        const oldGameOver = document.getElementById('game-over-overlay');
        if(oldGameOver) oldGameOver.classList.add('hidden');
        
        const pauseOverlay = document.getElementById('pause-overlay');
        if(pauseOverlay) pauseOverlay.classList.add('hidden');

        const reportScreen = document.getElementById('report-screen');
        if(reportScreen) {
            reportScreen.classList.add('hidden', 'opacity-0');
            reportScreen.classList.remove('opacity-100');
        }
        
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
        
        this.inputEl.oninput = (e) => {
            let val = e.target.value;
            val = val.replace(/[^0-9]/g, ''); 
            if (val.length > 3) val = val.slice(0, 3);
            
            e.target.value = val;
            this.inputDisplay.innerText = val; 
            this.inputDisplay.style.color = '#25f46a'; 
        };
        
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

    checkAndFire: function(inputValue) {
        const value = parseInt(inputValue);
        if (isNaN(value)) return;

        const target = this.monsters.find(m => parseInt(m.dataset.answer) === value);

        if (target) {
            let questionText = target.innerText;
            if(target.dataset.type === 'boss') {
                questionText = target.querySelector('.boss-question').innerText;
            }

            this.historyLog.push({
                question: questionText + " = " + value,
                correct: true,
                pts: parseInt(target.dataset.points)
            });

            this.fireProjectile(target);
            
            this.inputEl.value = '';
            this.inputDisplay.innerText = '';

        } else {
            this.historyLog.push({
                question: "Input: " + value,
                answer: "Wrong",
                correct: false,
                pts: 0
            });

            this.inputDisplay.style.color = '#ff4757';
            
            const display = document.getElementById('input-display');
            display.style.transform = 'translateX(5px)';
            setTimeout(() => display.style.transform = 'translateX(-5px)', 50);
            setTimeout(() => display.style.transform = 'translateX(0)', 100);
        }
    },

    fireProjectile: function(target) {
        if (!target) return;

        const ship = document.getElementById('player-ship');
        const shipRect = ship.getBoundingClientRect();
        const gameRect = this.gameContainer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const startX = (shipRect.left + shipRect.width / 2) - gameRect.left;
        const startY = (shipRect.top + shipRect.height / 2) - gameRect.top;

        const endX = (targetRect.left + targetRect.width / 2) - gameRect.left;
        const endY = (targetRect.top + targetRect.height / 2) - gameRect.top;

        const deltaX = endX - startX;
        const deltaY = endY - startY; 
        const angleRad = Math.atan2(deltaX, -deltaY);
        const angleDeg = angleRad * (180 / Math.PI);

        const shipVisual = document.getElementById('ship-visual'); 
        if (shipVisual) {
            shipVisual.style.transform = `rotate(${angleDeg/2}deg)`; 
            setTimeout(() => { shipVisual.style.transform = `rotate(0deg)`; }, 300);
        }

        const bullet = document.createElement('div');
        bullet.classList.add('plasma-bullet');
        bullet.style.position = 'absolute';
        bullet.style.width = '6px';
        bullet.style.height = '16px';
        bullet.style.background = '#25f46a';
        bullet.style.borderRadius = '4px';
        bullet.style.boxShadow = '0 0 10px #25f46a';
        bullet.style.zIndex = '15';
        bullet.style.transition = 'transform 0.2s linear';
        
        bullet.style.left = startX + 'px';
        bullet.style.top = startY + 'px';
        bullet.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
        
        this.gameContainer.appendChild(bullet);

        if (typeof SoundManager !== 'undefined') SoundManager.play('click');

        requestAnimationFrame(() => {
            bullet.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${angleDeg}deg)`;
        });

        setTimeout(() => {
            bullet.remove();
            this.hitEnemy(target);
        }, 200); 
    },

    hitEnemy: function(target) {
        if (!target || !target.parentNode) return;

        let hp = parseInt(target.dataset.hp);
        hp -= 100; 
        target.dataset.hp = hp;

        if (target.dataset.type === 'boss') {
            const maxHp = parseInt(target.dataset.maxHp);
            const percent = Math.max(0, (hp / maxHp) * 100);
            const bar = target.querySelector('.boss-hp-fill');
            if(bar) bar.style.width = `${percent}%`;
            
            if(hp > 0) {
                const newQ = this.generateBossQuestion();
                target.dataset.answer = newQ.answer;
                target.querySelector('.boss-question').innerText = newQ.question;
                
                target.style.filter = "brightness(2) hue-rotate(90deg)";
                setTimeout(() => target.style.filter = "none", 100);
                this.createExplosion(target, true);
                if (typeof SoundManager !== 'undefined') SoundManager.play('correct');
                return; 
            }
        }

        if (hp <= 0) {
            this.createExplosion(target);
            target.remove();
            
            const idx = this.monsters.indexOf(target);
            if (idx > -1) this.monsters.splice(idx, 1);

            this.score += parseInt(target.dataset.points);
            document.getElementById('monster-score').innerText = this.score;
            
            if (typeof SoundManager !== 'undefined') SoundManager.play('correct');
        } 
    },

    setupWave: function(waveLevel) {
        this.wave = waveLevel;
        const waveEl = document.getElementById('wave-count');
        if(waveEl) waveEl.innerText = (this.wave < 10 ? '0' : '') + this.wave;
        
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
            cssClass = 'enemy-small'; points = 100; hp = 100;
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            if (Math.random() > 0.5) { question = `${a}+${b}`; answer = a+b; }
            else { const max=Math.max(a,b); const min=Math.min(a,b); question = `${max}-${min}`; answer = max-min; }
        } else if (type === 'medium') {
            cssClass = 'enemy-medium'; points = 200; hp = 100;
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            question = `${a}x${b}`; answer = a*b;
        } else if (type === 'large') {
            cssClass = 'enemy-large'; points = 500; hp = 100;
            const x = Math.floor(Math.random() * 10) + 1;
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = a*x + b;
            question = `${a}x+${b}=${c}`; answer = x;
        } else if (type === 'boss') {
            cssClass = 'enemy-boss'; points = 5000; hp = 500; 
            const q = this.generateBossQuestion();
            question = q.question;
            answer = q.answer;
        }

        const monster = document.createElement('div');
        monster.classList.add('enemy-ship', cssClass);
        monster.style.position = 'absolute';
        monster.style.color = '#fff';
        monster.style.fontWeight = 'bold';
        monster.style.textAlign = 'center';
        
        if (type === 'boss') {
            monster.innerHTML = `
                <div style="width:100%; height:6px; background:#333; margin-bottom:5px; border-radius:3px; overflow:hidden;">
                    <div class="boss-hp-fill" style="width:100%; height:100%; background:#ef4444; transition:width 0.2s;"></div>
                </div>
                <span class="boss-question" style="font-size:24px; color:#ef4444; text-shadow:0 0 10px #ef4444;">${question}</span>
            `;
            monster.style.width = '120px';
            monster.style.padding = '10px';
            monster.style.border = '2px solid #ef4444';
            monster.style.background = 'rgba(20,0,0,0.8)';
        } else {
            monster.innerText = question;
            monster.style.padding = '8px';
            monster.style.border = '1px solid ' + (type === 'small' ? '#fff' : '#25f46a');
            monster.style.background = 'rgba(0,0,0,0.6)';
            monster.style.borderRadius = '50%';
        }
        
        const maxWidth = this.gameContainer.offsetWidth - 120;
        monster.style.left = (Math.random() * maxWidth + 20) + 'px';
        
        const startTop = -100;
        monster.style.top = startTop + 'px';

        monster.dataset.answer = answer;
        monster.dataset.type = type;
        monster.dataset.hp = hp;
        monster.dataset.maxHp = hp;
        monster.dataset.points = points;
        monster.dataset.top = startTop;

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
        
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            let speed = waveSpeed;
            
            if (monster.dataset.type === 'boss') speed *= 0.3; 
            
            let currentTop = parseFloat(monster.dataset.top);
            currentTop += speed;
            monster.dataset.top = currentTop;
            monster.style.top = `${currentTop}px`;

            if (currentTop > (this.gameContainer.offsetHeight - 80)) {
                this.damagePlayer(20);
                monster.remove();
                this.monsters.splice(i, 1);
            }
        }
    },

    updateRadar: function() {
        if (this.monsters.length === 0) { 
            this.showRadarText("SECTOR CLEAR..."); 
            return; 
        }
        
        let nearest = this.monsters[0];
        let maxTop = parseFloat(nearest.dataset.top);
        
        for (let i = 1; i < this.monsters.length; i++) {
            const top = parseFloat(this.monsters[i].dataset.top);
            if (top > maxTop) { 
                maxTop = top; 
                nearest = this.monsters[i]; 
            }
        }
        
        let qText = nearest.innerText;
        if (nearest.dataset.type === 'boss') {
            const qEl = nearest.querySelector('.boss-question');
            if(qEl) qText = qEl.innerText;
        }
        
        const radar = document.getElementById('math-equation-display');
        if (!radar.innerHTML.includes(qText)) {
            radar.innerHTML = `LOCKED: <span class="text-[#25f46a] text-3xl font-mono">${qText}</span>`;
        }
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
        else bar.style.backgroundColor = '#ef4444';
    },

    createExplosion: function(target, isBig = false) {
        const boom = document.createElement('div');
        boom.innerText = "💥";
        boom.style.position = "absolute";
        
        const width = target.offsetWidth;
        const height = target.offsetHeight;
        boom.style.left = (parseFloat(target.style.left) + width/2 - 20) + "px"; 
        boom.style.top = (parseFloat(target.style.top) + height/2 - 20) + "px";
        
        boom.style.fontSize = isBig ? "80px" : "40px";
        boom.style.zIndex = "20";
        boom.style.pointerEvents = "none";
        
        boom.style.transition = "transform 0.5s, opacity 0.5s";
        this.gameContainer.appendChild(boom);
        
        requestAnimationFrame(() => {
            boom.style.transform = "scale(1.5)";
            boom.style.opacity = "0";
        });
        
        setTimeout(() => boom.remove(), 500);
    },

    showRadarText: function(text) {
        document.getElementById('math-equation-display').innerHTML = `<span class="animate-pulse">${text}</span>`;
    },

    // --- HÀM LƯU TIẾN ĐỘ & NHẬN THƯỞNG (QUAN TRỌNG) ---
    saveProgress: async function() {
        const username = localStorage.getItem('username');
        if (!username) return;

        // Tính thưởng: Coin = 10% điểm, Exp = 20% điểm
        const coinsEarned = Math.floor(this.score / 10);
        const expEarned = Math.floor(this.score / 5);

        try {
            // 1. Lưu điểm cao (High Score)
            await fetch('http://localhost:3000/api/user/highscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    game: 'monster',
                    score: this.score
                })
            });

            // 2. Nhận thưởng và Tăng Play Count (Quan trọng: game: 'monster')
            await fetch('http://localhost:3000/api/user/reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    coins: coinsEarned,
                    exp: expEarned,
                    game: 'monster' // <--- Server dựa vào đây để đếm số lần chơi
                })
            });
            console.log("Đã lưu tiến trình Monster Math!");
        } catch (err) {
            console.error(err);
        }
    },

    // --- KẾT THÚC GAME ---
    
    victory: function() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationFrameId);
        
        // GỌI HÀM LƯU TIẾN ĐỘ
        this.saveProgress();
        
        // Hiển thị Report UI
        if(typeof MonsterExtension !== 'undefined') {
            this.historyLog.push({
                question: "Mission Status",
                answer: "Success",
                correct: true,
                pts: 1000
            });
            MonsterExtension.showGameOver(this.score, this.historyLog);
        } else {
            alert("VICTORY! Score: " + this.score);
            location.reload();
        }
    },

    gameOver: function() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationFrameId);
        
        // GỌI HÀM LƯU TIẾN ĐỘ
        this.saveProgress();

        // Hiển thị Report UI
        if(typeof MonsterExtension !== 'undefined') {
            MonsterExtension.showGameOver(this.score, this.historyLog);
        } else {
            alert("GAME OVER! Score: " + this.score);
            location.reload();
        }
    }
};