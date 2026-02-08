const MainApp = {
    // 1. Quay về màn hình danh sách game
    goHome: function() {
        document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('game-list').classList.remove('hidden');
        
        // Dừng game nếu đang chạy
        if (typeof MonsterGame !== 'undefined') MonsterGame.isPlaying = false;
    },

    // 2. Chuyển sang màn hình chơi game
    startGame: function(gameType) {
        document.getElementById('game-list').classList.add('hidden');
        
        if (gameType === 'sequence') {
            document.getElementById('sequence-game-screen').classList.remove('hidden');
            if (typeof SequenceGame !== 'undefined') SequenceGame.init();
        } else if (gameType === 'monster') {
            document.getElementById('monster-game-screen').classList.remove('hidden');
            if (typeof MonsterGame !== 'undefined') MonsterGame.start();
        }
    },

    // 3. Hiển thị màn hình Đăng nhập/Đăng ký
    showAuth: function() {
        document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('game-list').classList.add('hidden');
        
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.remove('hidden');
    },

    // 4. Hiển thị Bảng Xếp Hạng
    showLeaderboard: function() {
        document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
        document.getElementById('game-list').classList.add('hidden');
        
        const lbScreen = document.getElementById('leaderboard-screen');
        if (lbScreen) {
            lbScreen.classList.remove('hidden');
            if (typeof Leaderboard !== 'undefined') Leaderboard.loadData();
        }
    },

    // 5. Kiểm tra trạng thái đăng nhập để vẽ lại Menu (ĐÃ SỬA LỖI)
    checkLoginStatus: function() {
        console.log("Đang kiểm tra đăng nhập..."); 
        const userJson = localStorage.getItem('user');
        const navUl = document.querySelector('nav ul');
        
        if (!navUl) return; 

        if (userJson) {
            // --- TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP ---
            const user = JSON.parse(userJson);
            navUl.innerHTML = `
                <li><a href="#" onclick="MainApp.goHome()">Trang chủ</a></li>
                <li><span style="color: #f1c40f; font-weight: bold;">Chào, ${user.username}</span></li>
                <li><a href="#" onclick="MainApp.showLeaderboard()">Bảng Xếp Hạng</a></li>
                <li><a href="#" onclick="Auth.logout()">Đăng xuất</a></li>
            `;
        } else {
            // --- TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP ---
            navUl.innerHTML = `
                <li><a href="#" onclick="MainApp.goHome()">Trang chủ</a></li>
                <li><a href="#" onclick="MainApp.showLeaderboard()">Bảng Xếp Hạng</a></li>
                <li><a href="#" onclick="MainApp.showAuth()">Đăng Nhập</a></li>
            `;
        }
    }
};

// --- BỘ XỬ LÝ ĐĂNG KÝ / ĐĂNG NHẬP / ĐĂNG XUẤT (BỔ SUNG THÊM) ---
const Auth = {
    // Xử lý Đăng Ký
    handleRegister: async function(event) {
        event.preventDefault(); 
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("✅ Đăng ký thành công! Hãy đăng nhập ngay.");
                // Xóa trắng ô nhập
                document.getElementById('reg-username').value = '';
                document.getElementById('reg-email').value = '';
                document.getElementById('reg-password').value = '';
            } else {
                alert("❌ Lỗi: " + data.message);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Không kết nối được với Server!");
        }
    },

    // Xử lý Đăng Nhập
    handleLogin: async function(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("✅ Đăng nhập thành công!");
                // Lưu thông tin người dùng vào bộ nhớ trình duyệt
                localStorage.setItem('user', JSON.stringify(data.user));
                // Tải lại trang để cập nhật Menu
                location.reload(); 
            } else {
                alert("❌ Đăng nhập thất bại: " + data.message);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi kết nối Server!");
        }
    },

    // Xử lý Đăng Xuất
    logout: function() {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem('user'); // Xóa thông tin user
            location.reload(); // Tải lại trang
        }
    }
};

// --- HÀM GỬI ĐIỂM LÊN SERVER ---
// --- HÀM GỬI ĐIỂM LÊN SERVER (CÓ PHÂN LOẠI GAME) ---
// Thêm tham số gameType vào hàm
// --- HÀM GỬI ĐIỂM (CÓ PHÂN LOẠI GAME) ---
async function saveHighScore(gameType, score) {
    const userJson = localStorage.getItem('user');
    if (!userJson) return; // Chưa đăng nhập thì thôi

    const user = JSON.parse(userJson);
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/score', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: user.username, 
                score: score, 
                gameType: gameType // Gửi thêm loại game (monster/sequence)
            })
        });

        const data = await response.json();
        if (data.newHighScore) {
            alert(`🎉 KỶ LỤC MỚI (${gameType}): ${data.newHighScore} điểm!`);
        }
    } catch (error) {
        console.error("Lỗi gửi điểm:", error);
    }
}

// --- QUAN TRỌNG: Chạy khi trang web tải xong ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Trang web đã tải xong!");
    // Kiểm tra xem đã đăng nhập chưa để hiển thị Menu đúng
    MainApp.checkLoginStatus();
});