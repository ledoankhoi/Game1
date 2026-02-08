const Shop = {
    // Gọi API mua đồ
    buy: async function(itemId, price) {
        const username = localStorage.getItem('username');
        if (!username) return alert("Bạn chưa đăng nhập!");

        const msg = document.getElementById('shop-msg');
        msg.innerText = "Đang xử lý...";

        try {
            const res = await fetch('http://localhost:3000/api/auth/buy-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, itemId, price })
            });

            const data = await res.json();

            if (data.success) {
                // Mua thành công
                msg.innerText = data.message;
                msg.style.color = "#00ffff";
                
                // Cập nhật tiền trên giao diện
                document.getElementById('user-coin').innerText = data.coins;
                
                // Áp dụng skin ngay lập tức
                Shop.applySkin(data.equipped);
                
                SoundManager.play('correct'); // Tiếng ting ting
            } else {
                // Thất bại (không đủ tiền)
                msg.innerText = data.message;
                msg.style.color = "#ff4757";
                SoundManager.play('wrong');
            }

        } catch (error) {
            console.error(error);
            msg.innerText = "Lỗi kết nối!";
        }
    },

    // Hàm thay đổi giao diện
    applySkin: function(skinName) {
        document.body.className = ""; // Xóa hết class cũ
        if (skinName === 'forest') document.body.classList.add('theme-forest');
        if (skinName === 'ice') document.body.classList.add('theme-ice');
        // Nếu là 'default' thì không thêm class gì (về mặc định)
    }
};