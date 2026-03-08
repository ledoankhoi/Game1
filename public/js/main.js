/* file: js/main.js */

const MainApp = {
    
    // 1. CHUYỂN HƯỚNG SANG CÁC FILE GAME RIÊNG BIỆT
    startGame: function(gameType) {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');

        console.log("Launching game:", gameType); // Log để debug

        // Dùng window.location.href để chuyển trang sang file HTML riêng
        if (gameType === 'monster') {
            window.location.href = 'monster.html';
        } 
        else if (gameType === 'sequence') {
            window.location.href = 'sequence.html';
        } 
        else if (gameType === 'speed') {
            window.location.href = 'speed.html';
        }
        // --- THÊM PHẦN NÀY ---
        else if (gameType === 'pixel') {
            window.location.href = 'pixel.html';
        }
        else if (gameType === 'maze') {
            window.location.href = 'maze.html';
        }
        else if (gameType === 'escape') {
            window.location.href = 'escape.html';
        }
        else if (gameType === 'chess') {
            window.location.href = 'chess.html';
        }
        else if (gameType === 'puzzle') {
            window.location.href = 'puzzle.html'
        }

        // ---------------------
    },

    // 2. QUAY VỀ TRANG CHỦ (Reload nếu đang ở index, Redirect nếu ở trang khác)
    goHome: function() {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        window.location.href = 'index.html';
    },

    // 3. HIỆN POPUP LEADERBOARD
    showLeaderboard: function() {
        this.closeAllModals();
        const screen = document.getElementById('leaderboard-screen');
        if(screen) {
            screen.classList.remove('hidden');
            // Tải dữ liệu bảng xếp hạng nếu script đã load
            if(typeof Leaderboard !== 'undefined') Leaderboard.loadData();
        }
    },

    // 4. HIỆN POPUP SHOP
    showShop: function() {
        window.location.href = 'shop.html';
        
    },

    // 5. HIỆN POPUP AUTH (ĐĂNG NHẬP)
    showAuth: function() {
        // Nếu đã đăng nhập (kiểm tra qua Auth.user), thì hỏi đăng xuất
        if (typeof Auth !== 'undefined' && Auth.user) {
            if(confirm("Bạn muốn đăng xuất?")) {
                Auth.logout();
            }
        } else {
            // Chưa đăng nhập thì hiện bảng
            this.closeAllModals();
            const screen = document.getElementById('auth-screen');
            if(screen) screen.classList.remove('hidden');
        }
    },

    // HÀM TIỆN ÍCH: ĐÓNG TẤT CẢ POPUP
    closeAllModals: function() {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');
        const modals = ['leaderboard-screen', 'shop-screen', 'auth-screen'];
        modals.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    },

    filterGames: function(category) {
        // 1. Cập nhật giao diện nút bấm (Active State)
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            // Reset về style mặc định (Trắng/Tối)
            btn.className = "category-btn flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1a2e20] text-gray-600 dark:text-gray-300 hover:bg-[#f0f5f1] hover:text-primary rounded-xl font-medium transition-all group";
            // Xóa icon check cũ nếu có
            const checkIcon = btn.querySelector('.material-symbols-outlined:last-child');
            if(checkIcon && checkIcon.innerText === 'check_circle') checkIcon.remove();
        });

        // Set style Active cho nút được chọn (Xanh lá)
        const activeBtn = document.getElementById('cat-' + category);
        if(activeBtn) {
            activeBtn.className = "category-btn flex items-center justify-between px-4 py-3 bg-primary text-white rounded-xl font-semibold shadow-md transition-all active-category";
            // Thêm icon check
            activeBtn.insertAdjacentHTML('beforeend', '<span class="material-symbols-outlined text-sm">check_circle</span>');
        }

        // 2. Lọc danh sách game
        const games = document.querySelectorAll('.game-card'); 
        
        games.forEach(game => {
            if (category === 'all') {
                game.classList.remove('hidden');
            } else {
                if (game.classList.contains('type-' + category)) {
                    game.classList.remove('hidden');
                } else {
                    game.classList.add('hidden');
                }
            }
        });
    }
};

// --- SỰ KIỆN KHỞI CHẠY KHI TRANG LOAD XONG ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Gán sự kiện cho các nút "Back" trên Popup (để đóng popup)
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.onclick = function() {
            MainApp.closeAllModals();
        };
    });

    // 2. KIỂM TRA ĐĂNG NHẬP (QUAN TRỌNG)
    if (typeof Auth !== 'undefined') {
        Auth.checkLogin();
    }

    // --- HÀM GỬI ĐIỂM LÊN SERVER (Global) ---
    window.saveHighScore = async function(gameType, score) {
        const username = localStorage.getItem('username');
        if (!username) {
            console.log("Chưa đăng nhập -> Không lưu điểm/tiền.");
            return;
        }

        console.log(`🚀 Frontend gửi điểm: ${gameType} - ${score}`);

        try {
            const response = await fetch('http://localhost:3000/api/auth/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, gameType, score })
            });

            const data = await response.json();
            console.log("✅ Kết quả từ Server:", data);

            // Cập nhật tiền mới lên giao diện ngay lập tức
            if (data.newCoins !== undefined) {
                const coinSpan = document.getElementById('user-coin');
                if(coinSpan) {
                    coinSpan.innerText = data.newCoins;
                    // Hiệu ứng nháy vàng
                    coinSpan.style.color = '#fff';
                    setTimeout(() => coinSpan.style.color = 'yellow', 300);
                }
                
                // Cập nhật lại localStorage để khi F5 không bị mất số tiền ảo
                let userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                userInfo.coins = data.newCoins;
                localStorage.setItem('user_info', JSON.stringify(userInfo));
            }

        } catch (error) {
            console.error("❌ Lỗi gửi điểm:", error);
        }
    }
});