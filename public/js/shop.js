/* public/js/shop.js */
const Shop = {
    buy: async function(itemId, price) {
        // Kiểm tra đăng nhập
        if (!Auth.user) {
            alert("Bạn cần đăng nhập để mua vật phẩm!");
            MainApp.showAuth();
            return;
        }

        // Kiểm tra tiền
        if (Auth.user.coins < price) {
            const msg = document.getElementById('shop-msg');
            msg.innerText = "Bạn không đủ tiền!";
            msg.style.color = "red";
            if(typeof SoundManager !== 'undefined') SoundManager.play('wrong');
            return;
        }

        // Gọi API Mua hàng (Giả sử Backend có route này)
        try {
            const res = await fetch('/api/shop/buy', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}` // Gửi token xác thực
                },
                body: JSON.stringify({ userId: Auth.user._id, itemId: itemId, price: price })
            });

            const data = await res.json();

            if (res.ok) {
                // Cập nhật lại thông tin user sau khi mua
                Auth.user.coins = data.newBalance; // Backend trả về số dư mới
                localStorage.setItem('user_info', JSON.stringify(Auth.user));
                
                // Cập nhật UI
                document.getElementById('user-coin').innerText = Auth.user.coins;
                
                const msg = document.getElementById('shop-msg');
                msg.innerText = "Mua thành công!";
                msg.style.color = "#25f46a";
                
                if(typeof SoundManager !== 'undefined') SoundManager.play('correct');
                
                // Áp dụng Skin ngay lập tức (Logic đổi class body)
                this.applySkin(itemId);
            } else {
                alert(data.message || "Giao dịch thất bại");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối Shop!");
        }
    },

    applySkin: function(skinName) {
        document.body.classList.remove('theme-forest', 'theme-ice');
        if (skinName !== 'default') {
            document.body.classList.add('theme-' + skinName);
        }
    }
};