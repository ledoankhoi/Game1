/* file: js/main.js */

const MainApp = {
    
    // 1. CHUYỂN HƯỚNG SANG CÁC FILE GAME RIÊNG BIỆT
    startGame: function(gameType) {
        if (typeof SoundManager !== 'undefined') SoundManager.play('click');

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
        this.closeAllModals();
        const screen = document.getElementById('shop-screen');
        if(screen) screen.classList.remove('hidden');
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
    // Tự động cập nhật Header (Coin, Avatar) nếu user đã đăng nhập từ trước
    if (typeof Auth !== 'undefined') {
        Auth.checkLogin();
    }
});