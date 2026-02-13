/* file: public/js/auth.js - Phiên bản chuẩn cho Server Auth */

const Auth = {
    API_URL: 'http://localhost:3000/api',
    user: null,

    // 1. Khởi tạo: Kiểm tra đăng nhập khi tải trang
    init: function() {
        const storedUsername = localStorage.getItem('username');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (storedUsername && isLoggedIn) {
            this.user = { username: storedUsername };
            // Gọi API để lấy số coin mới nhất từ server
            this.fetchUserInfo(storedUsername);
        }
        
        this.updateHeaderUI();
    },

    // 2. Lấy thông tin user (Coin, Exp, Avatar...) từ Server
    fetchUserInfo: async function(username) {
        try {
            const res = await fetch(`${this.API_URL}/user/info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            
            if (data.success) {
                this.user = data; // Lưu toàn bộ data (coin, exp...) vào biến user
                this.updateHeaderUI();

if (typeof UserProfile !== 'undefined') {
                    UserProfile.updateUI(data.exp || 0, data.avatarId || 'avatar_1');
                }

            }
        } catch (err) {
            console.error("Lỗi lấy thông tin user:", err);
        }
    },

    // 3. Cập nhật giao diện Header (Guest vs User)
    updateHeaderUI: function() {
        const guestSection = document.getElementById('header-guest');
        const userSection = document.getElementById('header-user');
        const coinEl = document.getElementById('user-coin');

        if (this.user) {
            // ---> ĐÃ ĐĂNG NHẬP <---
            if(guestSection) guestSection.classList.add('hidden'); 
            if(userSection) userSection.classList.remove('hidden'); 
            
            // Hiển thị coin
            if (coinEl) coinEl.innerText = (this.user.coins || 0).toLocaleString();
            
            // Ẩn modal đăng nhập nếu đang mở
            const authModal = document.getElementById('auth-screen');
            if(authModal) authModal.classList.add('hidden');

        } else {
            // ---> KHÁCH <---
            if(guestSection) guestSection.classList.remove('hidden'); 
            if(userSection) userSection.classList.add('hidden'); 
        }
    },

    // 4. Xử lý ĐĂNG KÝ
    handleRegister: async function(e) {
        if(e) e.preventDefault(); // Ngăn reload form

        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const feedback = document.getElementById('auth-feedback');

        if (!username || !email || !password) {
            feedback.style.color = 'red';
            feedback.innerText = "Vui lòng điền đầy đủ thông tin!";
            return;
        }

        feedback.style.color = 'yellow';
        feedback.innerText = "Đang đăng ký...";

        try {
            const res = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (data.success) {
                feedback.style.color = '#25f46a';
                feedback.innerText = "Đăng ký thành công! Đang chuyển sang đăng nhập...";
                
                // Tự động chuyển tab sang Login sau 1.5s
                setTimeout(() => {
                    if(typeof toggleAuthMode === 'function') toggleAuthMode();
                    feedback.innerText = "";
                }, 1500);
            } else {
                feedback.style.color = 'red';
                feedback.innerText = data.message || "Đăng ký thất bại";
            }
        } catch (err) {
            console.error(err);
            feedback.style.color = 'red';
            feedback.innerText = "Lỗi kết nối Server!";
        }
    },

    // 5. Xử lý ĐĂNG NHẬP
    handleLogin: async function(e) {
        if(e) e.preventDefault();

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const feedback = document.getElementById('auth-feedback');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            feedback.style.color = 'red';
            feedback.innerText = "Vui lòng nhập tài khoản và mật khẩu!";
            return;
        }

        feedback.style.color = 'yellow';
        feedback.innerText = "Đang kiểm tra...";

        try {
            const res = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }) // Server chấp nhận 'email' là username
            });

            const data = await res.json();

            if (data.success) {
                // Lưu session
                localStorage.setItem('username', data.username);
                localStorage.setItem('isLoggedIn', 'true');

                // Cập nhật biến user ngay lập tức
                this.user = { username: data.username };
                
                // Lấy thêm thông tin coin để hiển thị
                await this.fetchUserInfo(data.username);

                feedback.style.color = '#25f46a';
                feedback.innerText = "✅ Đăng nhập thành công!";
                
                // Đóng modal sau 1s
                setTimeout(() => {
                    document.getElementById('auth-screen').classList.add('hidden');
                    // Không cần reload trang, chỉ cần update UI
                    this.updateHeaderUI();
                }, 1000);

            } else {
                feedback.style.color = 'red';
                feedback.innerText = data.message || "Sai tài khoản hoặc mật khẩu!";
            }
        } catch (err) {
            console.error(err);
            feedback.style.color = 'red';
            feedback.innerText = "Lỗi kết nối Server!";
        }
    },

    // 6. Đăng xuất
    logout: function() {
        this.user = null;
        localStorage.removeItem('username');
        localStorage.removeItem('isLoggedIn');
        
        // Reset giao diện
        this.updateHeaderUI();
        window.location.reload(); 
    }
};

// Tự động chạy khi file được load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});