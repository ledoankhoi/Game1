/* File: public/js/shop.js */
const Shop = {
    buy: async function(itemId, priceDisplay) {
        if (!Auth.user) {
            alert("Vui lòng đăng nhập để mua!");
            MainApp.showAuth();
            return;
        }

        try {
            // Gọi API lên Server (Cổng 3000)
            const res = await fetch('http://localhost:3000/api/shop/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: Auth.user._id, 
                    itemId: itemId 
                })
            });

            const data = await res.json();
            const msgEl = document.getElementById('shop-msg');

            if (data.success) {
                // Cập nhật User
                Auth.user.coins = data.newBalance;
                Auth.user.equippedSkin = data.equipped;
                if (!Auth.user.inventory.includes(itemId)) Auth.user.inventory.push(itemId);
                
                localStorage.setItem('user_info', JSON.stringify(Auth.user));

                // Cập nhật giao diện
                document.getElementById('user-coin').innerText = data.newBalance;
                msgEl.innerText = data.message;
                msgEl.style.color = "#25f46a";
                
                this.applySkin(data.equipped);
            } else {
                msgEl.innerText = data.message;
                msgEl.style.color = "red";
            }
        } catch (error) {
            console.error(error);
            alert("Không kết nối được với Server (Kiểm tra xem Terminal có đang chạy không?)");
        }
    },

    applySkin: function(skinName) {
        document.body.classList.remove('theme-forest', 'theme-ice', 'theme-default');
        if (skinName && skinName !== 'default') {
            document.body.classList.add('theme-' + skinName);
        }
    }
};