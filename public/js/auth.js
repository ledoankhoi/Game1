const Auth = {
    isRegisterMode: false, // Mặc định là chế độ Đăng nhập

    // 1. Chuyển đổi qua lại giữa Đăng nhập và Đăng ký
    toggleMode: function() {
        this.isRegisterMode = !this.isRegisterMode;
        
        const title = document.getElementById('auth-title');
        const btnLogin = document.getElementById('btn-login');
        const btnRegister = document.getElementById('btn-register');
        const inputUser = document.getElementById('auth-username');
        const link = document.querySelector('.switch-mode a');

        if (this.isRegisterMode) {
            title.innerText = "Đăng Ký Tài Khoản";
            btnLogin.classList.add('hidden');
            btnRegister.classList.remove('hidden');
            inputUser.style.display = 'block'; // Hiện ô nhập tên
            link.innerText = "Đã có tài khoản? Đăng nhập";
        } else {
            title.innerText = "Đăng Nhập";
            btnLogin.classList.remove('hidden');
            btnRegister.classList.add('hidden');
            inputUser.style.display = 'none'; // Ẩn ô nhập tên
            link.innerText = "Chưa có tài khoản? Đăng ký ngay";
        }
    },

    // 2. Hàm gửi dữ liệu ĐĂNG KÝ lên Server
    submitRegister: async function() {
        const username = document.getElementById('auth-username').value;
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        // Gửi yêu cầu (Request) đến Server
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Báo cho Server biết ta gửi JSON
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json(); // Đọc phản hồi từ Server

            if (data.success) {
                alert("Đăng ký thành công! Hãy đăng nhập ngay.");
                this.toggleMode(); // Chuyển về màn hình đăng nhập
            } else {
                document.getElementById('auth-feedback').innerText = data.message;
            }
        } catch (error) {
            console.error("Lỗi:", error);
            document.getElementById('auth-feedback').innerText = "Không thể kết nối Server!";
        }
    },

    // 3. Hàm gửi dữ liệu ĐĂNG NHẬP lên Server
    submitLogin: async function() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // LƯU Ý QUAN TRỌNG:
                // Khi đăng nhập thành công, Server gửi về thông tin User.
                // Ta cần lưu nó vào bộ nhớ trình duyệt (localStorage) để dùng sau này.
                localStorage.setItem('user', JSON.stringify(data.user));
                
                alert("Xin chào " + data.user.username + "!");
                MainApp.goHome(); // Quay về trang chủ
                MainApp.checkLoginStatus(); // Cập nhật giao diện (sẽ viết hàm này sau)
            } else {
                document.getElementById('auth-feedback').innerText = data.message;
            }
        } catch (error) {
            console.error("Lỗi:", error);
            document.getElementById('auth-feedback').innerText = "Lỗi kết nối!";
        }
    },
    
    // Hàm đăng xuất
    logout: function() {
        localStorage.removeItem('user');
        window.location.reload(); // Tải lại trang để reset mọi thứ
    }
};