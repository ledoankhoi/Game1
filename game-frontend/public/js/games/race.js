document.addEventListener('DOMContentLoaded', () => {
    if (typeof SoundManager !== 'undefined' && typeof SoundManager.init === 'function') {
        SoundManager.init();
    }

    const LANES = [16.6, 50, 83.3]; 
    let currentLane = 1; 
    let score = 0;
    
    let baseSpeed = 0.35; 
    let speedMultiplier = 1; 
    let spawnY = 32; 
    
    let isGameOver = false;
    let isPaused = false;
    let currentCorrectAnswer = 0;
    let correctLane = 1;
    let gateY = spawnY;
    let animationFrameId;
    let hasCollided = false; 

    const carEl = document.getElementById('player-car');
    const gatesContainer = document.getElementById('gates-container');
    const questionEl = document.getElementById('math-question');
    const scoreEl = document.getElementById('score-display');
    const speedEl = document.getElementById('speed-display');
    
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const gameOverPanel = document.getElementById('game-over-panel');
    const finalScoreEl = document.getElementById('final-score');
    const earnedCoinsEl = document.getElementById('earned-coins');
    const earnedExpEl = document.getElementById('earned-exp');
    const btnRestart = document.getElementById('btn-restart');
    const btnPause = document.getElementById('btn-pause');
    const btnExit = document.getElementById('btn-exit');

    window.addEventListener('keydown', (e) => {
        if (isGameOver || isPaused || hasCollided) {
            if (e.key.toLowerCase() === 'r' && isGameOver) resetGame();
            return;
        }
        
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            if (currentLane > 0) currentLane--;
            updateCarPosition();
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            if (currentLane < 2) currentLane++;
            updateCarPosition();
        }
    });

    function updateCarPosition() {
        if(carEl) carEl.style.left = LANES[currentLane] + '%';
    }

    function generateMathProblem() {
        let num1, num2, operator;
        if (score < 500) {
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            operator = '+';
            currentCorrectAnswer = num1 + num2;
        } else if (score < 1500) {
            num1 = Math.floor(Math.random() * 30) + 10;
            num2 = Math.floor(Math.random() * 20) + 1;
            operator = '-';
            currentCorrectAnswer = num1 - num2;
        } else {
            num1 = Math.floor(Math.random() * 12) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            operator = 'x';
            currentCorrectAnswer = num1 * num2;
        }

        if(questionEl) questionEl.innerText = `${num1} ${operator} ${num2} = ?`;
        correctLane = Math.floor(Math.random() * 3);
        
        for (let i = 0; i < 3; i++) {
            const gateBox = document.getElementById(`gate-box-${i}`);
            const gateText = document.getElementById(`gate-text-${i}`);
            
            if (gateBox) gateBox.className = 'gate-box bg-surface-container-low/70 backdrop-blur-md border-y-4 border-outline w-2/3 py-10 rounded-2xl text-center transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]';
            
            if (gateText) {
                gateText.style.opacity = '1'; 
                gateText.classList.remove('text-primary', 'opacity-100');
                gateText.classList.add('text-on-surface-variant', 'opacity-80');

                if (i === correctLane) {
                    gateText.innerText = currentCorrectAnswer;
                } else {
                    let offset = Math.floor(Math.random() * 8) + 1;
                    let wrongAnswer = currentCorrectAnswer + (Math.random() > 0.5 ? offset : -offset);
                    if (wrongAnswer === currentCorrectAnswer) wrongAnswer += 1;
                    gateText.innerText = wrongAnswer;
                }
            }
        }
    }

    function createShatterParticles(gateBoxElement) {
        const rect = gateBoxElement.getBoundingClientRect();
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'glass-particle';
            
            const size = Math.random() * 15 + 5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            const startX = rect.left + Math.random() * rect.width;
            const startY = rect.top + Math.random() * rect.height;
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.body.appendChild(particle);
            void particle.offsetWidth;
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 200 + 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 100;
            const rot = Math.random() * 720;
            
            particle.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0)`;
            particle.style.opacity = '0';
            
            setTimeout(() => particle.remove(), 600);
        }
    }

    let lastTime = 0;
    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        if (deltaTime > 100) deltaTime = 16; 

        if (!isGameOver && !isPaused) {
            speedMultiplier += 0.00015 * (deltaTime / 16);

            let depthSpeed = Math.max(0.4, (gateY / 75)); 
            let moveAmount = (baseSpeed * speedMultiplier * depthSpeed) * (deltaTime / 16);
            
            gateY += moveAmount;

            if(gatesContainer) {
                gatesContainer.style.bottom = (100 - gateY) + '%'; 
                
                let currentScale = 0.05 + ((gateY - spawnY) / (75 - spawnY)) * 0.95;
                if (currentScale < 0) currentScale = 0;
                
                gatesContainer.style.transform = `scale(${currentScale})`;
                
                let currentOpacity = (gateY - spawnY) / 10;
                gatesContainer.style.opacity = Math.min(1, Math.max(0, currentOpacity));
            }

            if(speedEl) speedEl.innerText = Math.floor((baseSpeed * speedMultiplier) * 200);

            if (!hasCollided && carEl) {
                const carRect = carEl.getBoundingClientRect(); 
                const targetGateBox = document.getElementById(`gate-box-${currentLane}`); 
                
                if (targetGateBox) {
                    const targetGateRect = targetGateBox.getBoundingClientRect();
                    if (targetGateRect.bottom >= carRect.top + 30) {
                        hasCollided = true; 
                        checkCollision();
                    }
                }
            }

            if (gateY > 120) {
                gateY = spawnY;
                hasCollided = false; 
                generateMathProblem();
            }
        }

        if (!isGameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function checkCollision() {
        const currentGateBox = document.getElementById(`gate-box-${currentLane}`);
        const currentGateText = document.getElementById(`gate-text-${currentLane}`);

        if (currentLane === correctLane) {
            if (typeof SoundManager !== 'undefined') SoundManager.playSound('correct');
            if (currentGateBox) createShatterParticles(currentGateBox);

            if (currentGateBox) currentGateBox.classList.add('shatter'); 
            if (currentGateText) currentGateText.style.opacity = '0'; 
            
            score += 100;
            if (typeof ScoreManager !== 'undefined') ScoreManager.addScore(100); 
            if(scoreEl) scoreEl.innerText = score;
            
        } else {
            if (typeof SoundManager !== 'undefined') SoundManager.playSound('wrong');
            
            gateY = 75; 
            if(gatesContainer) {
                gatesContainer.style.bottom = '25%'; // 100 - 75
                gatesContainer.style.transform = 'scale(1)';
                gatesContainer.style.opacity = '1';
            }
            
            if(currentGateBox) currentGateBox.classList.add('gate-wrong'); 
            if(carEl) carEl.classList.add('car-crash'); 
            
            document.querySelectorAll('.data-stream').forEach(el => {
                el.style.animationPlayState = 'paused';
            });

            handleGameOver(); 
        }
    }

    async function handleGameOver() {
        isGameOver = true; 
        cancelAnimationFrame(animationFrameId);
        
        const coinsEarned = Math.floor(score / 50);
        const expEarned = Math.floor(score / 10);

        if(finalScoreEl) finalScoreEl.innerText = score;
        if(earnedCoinsEl) earnedCoinsEl.innerText = `+${coinsEarned}`;
        if(earnedExpEl) earnedExpEl.innerText = `+${expEarned}`;
        
        setTimeout(() => {
            if(gameOverOverlay) {
                gameOverOverlay.classList.remove('hidden');
                gameOverOverlay.classList.add('flex');
                
                setTimeout(() => {
                    gameOverOverlay.classList.remove('opacity-0');
                    if (gameOverPanel) gameOverPanel.classList.remove('translate-y-10');
                }, 50);
            }
        }, 600);

        try {
            const token = localStorage.getItem('token');
            if(token) {
                const response = await fetch('http://localhost:5000/api/games/save-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ 
                        gameId: 'race', 
                        score: score, 
                        coinsEarned: coinsEarned,
                        expEarned: expEarned
                    })
                });

                const data = await response.json();
                
                // --- ĐÂY LÀ ĐOẠN FIX LỖI CACHE LOCALSTORAGE ---
                if (data.success && data.user) {
                    // Cập nhật lại bộ nhớ đệm của trình duyệt với số Xu/EXP mới nhất từ Backend trả về
                    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    currentUser.coins = data.user.coins;
                    currentUser.exp = data.user.exp;
                    currentUser.level = data.user.level;
                    
                    // Lưu lại
                    localStorage.setItem('user', JSON.stringify(currentUser));

                    // Thử cập nhật UI thanh Header nếu hệ thống có hàm hỗ trợ
                    if (typeof updateHeaderUI === 'function') updateHeaderUI();
                    if (typeof updateUserProfile === 'function') updateUserProfile();
                }
            }
        } catch (error) {
            console.error('Lỗi khi lưu kết quả:', error);
        }
    }

    function resetGame() {
        score = 0;
        speedMultiplier = 1; 
        gateY = spawnY;
        currentLane = 1;
        isGameOver = false;
        hasCollided = false; 
        
        if(scoreEl) scoreEl.innerText = '0';
        
        if(gameOverOverlay) {
            gameOverOverlay.classList.add('opacity-0');
            if (gameOverPanel) gameOverPanel.classList.add('translate-y-10');
            
            setTimeout(() => {
                gameOverOverlay.classList.remove('flex');
                gameOverOverlay.classList.add('hidden');
            }, 500);
        }
        
        if(carEl) carEl.classList.remove('car-crash'); 
        
        document.querySelectorAll('.data-stream').forEach(el => {
            el.style.animationPlayState = 'running';
        });

        updateCarPosition();
        generateMathProblem();
        lastTime = 0;
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    if(btnRestart) btnRestart.addEventListener('click', resetGame);
    if(btnExit) btnExit.addEventListener('click', () => { window.location.href = '/'; });
    if(btnPause) btnPause.addEventListener('click', () => { 
        isPaused = !isPaused; 
        btnPause.querySelector('span').innerText = isPaused ? 'play_arrow' : 'pause';
        lastTime = 0; 
    });

    updateCarPosition();
    generateMathProblem();
    animationFrameId = requestAnimationFrame(gameLoop);
});