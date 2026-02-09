/* file: js/auth.js */
const Auth = {
    user: null,

    // Kiểm tra đăng nhập khi tải trang
    checkLogin: function() {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            this.user = JSON.parse(storedUser);
            this.updateHeaderUI();
        } else {
            this.updateHeaderUI(); // Gọi để reset về trạng thái Guest
        }
    },

    // Cập nhật giao diện Header (Guest vs User)
    updateHeaderUI: function() {
        const guestSection = document.getElementById('header-guest');
        const userSection = document.getElementById('header-user');
        const coinEl = document.getElementById('user-coin');

        if (this.user) {
            // ---> TRẠNG THÁI: ĐÃ ĐĂNG NHẬP <---
            if(guestSection) guestSection.classList.add('hidden'); // Ẩn nút Login/Register
            if(userSection) userSection.classList.remove('hidden'); // Hiện Coin/Avatar
            
            // Cập nhật số tiền
            if (coinEl) coinEl.innerText = this.user.coins || 0;
            
            // Ẩn modal auth nếu đang mở
            const authModal = document.getElementById('auth-screen');
            if(authModal) authModal.classList.add('hidden');

            console.log("UI Updated: Logged in");
        } else {
            // ---> TRẠNG THÁI: KHÁCH <---
            if(guestSection) guestSection.classList.remove('hidden'); // Hiện nút Login/Register
            if(userSection) userSection.classList.add('hidden'); // Ẩn Coin/Avatar
            
            console.log("UI Updated: Guest");
        }
    },

    // Xử lý ĐĂNG KÝ
    handleRegister: async function(e) {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const feedback = document.getElementById('auth-feedback');

        if (!username || !email || !password) {
            feedback.innerText = "Please enter all fields!";
            return;
        }
        feedback.innerText = "Processing...";

        try {
            const res = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Registration successful! Please log in.");
                if(typeof toggleAuthMode === 'function') toggleAuthMode();
                feedback.innerText = "";
            } else {
                feedback.innerText = data.message || "Registration failed";
            }
        } catch (err) {
            console.error(err);
            feedback.innerText = "Server error!";
        }
    },

    // Xử lý ĐĂNG NHẬP
    handleLogin: async function(e) {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const feedback = document.getElementById('auth-feedback');

        if (!email || !password) {
            feedback.innerText = "Enter email and password!";
            return;
        }
        feedback.innerText = "Logging in...";

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                this.user = data.user;
                localStorage.setItem('user_info', JSON.stringify(this.user));
                localStorage.setItem('auth_token', data.token);

                alert("Welcome back, " + this.user.username + "!");
                this.updateHeaderUI(); // Cập nhật Header ngay lập tức
                
                // Quay về trang chủ nếu đang ở màn hình khác
                if(typeof MainApp !== 'undefined') MainApp.goHome();
            } else {
                feedback.innerText = data.message || "Invalid credentials";
            }
        } catch (err) {
            console.error(err);
            feedback.innerText = "Server error!";
        }
    },

    // Đăng xuất
    logout: function() {
        this.user = null;
        localStorage.removeItem('user_info');
        localStorage.removeItem('auth_token');
        this.updateHeaderUI(); // Reset về giao diện Khách
        location.reload(); // Tải lại trang cho sạch
    }
};