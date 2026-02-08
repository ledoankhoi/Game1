const MainApp = {
    // Chuyển màn hình
    goHome: function() {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        document.querySelectorAll('.container, .game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('game-list').classList.remove('hidden');
        document.getElementById('game-list').style.display = 'block';
    },

    startGame: function(gameType) {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        document.querySelectorAll('.container, .game-area').forEach(el => el.classList.add('hidden'));
        
        if (gameType === 'sequence') {
            document.getElementById('sequence-game-screen').classList.remove('hidden');
            SequenceGame.init();
        } else if (gameType === 'monster') {
            document.getElementById('monster-game-screen').classList.remove('hidden');
            MonsterGame.start();
        } else if (gameType === 'speed') {
            document.getElementById('speed-game-screen').classList.remove('hidden');
            SpeedGame.start();
        }
    },

    showLeaderboard: function() {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        document.querySelectorAll('.container, .game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('leaderboard-screen').classList.remove('hidden');
        Leaderboard.loadData();
    },

    showAuth: function() {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        document.querySelectorAll('.container, .game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('auth-screen').classList.remove('hidden');
    },

    showShop: function() {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        document.querySelectorAll('.container, .game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('shop-screen').classList.remove('hidden');
    }
};

// --- XỬ LÝ ĐĂNG KÝ / ĐĂNG NHẬP ---
const Auth = {
    // 1. XỬ LÝ ĐĂNG KÝ (Đã thêm mới)
    handleRegister: async function(e) {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const feedback = document.getElementById('auth-feedback');

        if (!username || !email || !password) {
            feedback.innerText = "Vui lòng nhập đủ thông tin!";
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                // Tự động chuyển về màn hình đăng nhập
                if (typeof toggleAuthMode === 'function') {
                    toggleAuthMode(); 
                }
                // Xóa form
                document.getElementById('reg-username').value = "";
                document.getElementById('reg-email').value = "";
                document.getElementById('reg-password').value = "";
                feedback.innerText = "";
            } else {
                feedback.innerText = data.message;
            }
        } catch (error) {
            console.error(error);
            feedback.innerText = "Lỗi kết nối Server!";
        }
    },

    // 2. XỬ LÝ ĐĂNG NHẬP
    handleLogin: async function(e) {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const feedback = document.getElementById('auth-feedback');

        if (!email || !password) {
            feedback.innerText = "Vui lòng nhập đủ thông tin!";
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('username', data.user.username);
                
                // Cập nhật Menu
                document.getElementById('menu-auth').innerHTML = `<a href="#" style="color: #00ff00">Chào, ${data.user.username}</a>`;
                
                // Cập nhật Tiền
                if (data.user.coins !== undefined) {
                    document.getElementById('user-coin').innerText = data.user.coins;
                }
                
                // Áp dụng Skin
                if (typeof Shop !== 'undefined' && data.user.equippedSkin) {
                    Shop.applySkin(data.user.equippedSkin);
                }

                alert("Đăng nhập thành công!");
                MainApp.goHome();
            } else {
                feedback.innerText = data.message;
            }
        } catch (error) {
            console.error(error);
            feedback.innerText = "Lỗi kết nối Server!";
        }
    }
};

// --- HÀM LƯU ĐIỂM & CẬP NHẬT TIỀN ---
async function saveHighScore(gameType, score) {
    const username = localStorage.getItem('username');
    if (!username) return;

    console.log(`Đang lưu điểm: ${gameType} - ${score}`);

    try {
        const response = await fetch('http://localhost:3000/api/auth/update-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, gameType, score })
        });

        const data = await response.json();
        console.log("Kết quả lưu:", data);

        // Cập nhật tiền mới lên giao diện
        if (data.newCoins !== undefined) {
            const coinSpan = document.getElementById('user-coin');
            coinSpan.innerText = data.newCoins;
            
            // Hiệu ứng nháy vàng
            coinSpan.style.color = '#fff';
            setTimeout(() => coinSpan.style.color = 'yellow', 300);
        }

    } catch (error) {
        console.error("Lỗi lưu điểm:", error);
    }
}