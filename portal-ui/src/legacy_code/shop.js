/* file: js/shop.js */

const Shop = {
    API_URL: 'http://localhost:3000/api',
    
    // Cấu hình hình ảnh cho từng trang phục (Map từ ID trong DB sang Giao diện)
    VISUAL_MAP: {
        'default': { 
            color: 'bg-gray-800', 
            icon: 'person', 
            name: 'Classic Hero' 
        },
        'ninja': { 
            color: 'bg-purple-900', 
            icon: 'visibility_off', // Icon giống Ninja
            name: 'Shadow Ninja' 
        },
        'robot': { 
            color: 'bg-blue-700', 
            icon: 'smart_toy', // Icon giống Robot
            name: 'Mecha Z' 
        },
        // Item mặc định nếu chưa cấu hình
        'unknown': { 
            color: 'bg-gray-500', 
            icon: 'help', 
            name: 'Unknown Item' 
        }
    },

    // Khởi tạo Shop
    init: async function() {
        const username = localStorage.getItem('username');
        if (!username) {
            this.showMsg("Vui lòng đăng nhập!", "red");
            return;
        }

        try {
            // Gọi 2 API cùng lúc: Lấy thông tin User và Danh sách Item
            const [userRes, itemsRes] = await Promise.all([
                fetch(`${this.API_URL}/user/info`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                }),
                fetch(`${this.API_URL}/shop/items`)
            ]);

            const userData = await userRes.json();
            const itemsData = await itemsRes.json();

            if (userData.success && itemsData.success) {
                // Cập nhật hiển thị tiền
                this.updateCoinDisplay(userData.coins);
                
                // Lưu trang phục đang mặc vào bộ nhớ trình duyệt để game khác dùng
                localStorage.setItem('currentOutfit', userData.currentOutfit);

                // Vẽ giao diện shop dựa trên dữ liệu
                this.renderShop(itemsData.items, userData.inventory, userData.currentOutfit);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            this.showMsg("Không kết nối được Server", "red");
        }
    },

    // Hàm vẽ giao diện (Render)
    renderShop: function(items, inventory, currentOutfit) {
        const container = document.getElementById('shop-grid');
        container.innerHTML = ''; // Xóa loading cũ

        items.forEach(item => {
            const isOwned = inventory.includes(item.itemId);
            const isEquipped = currentOutfit === item.itemId;
            
            // Lấy giao diện từ VISUAL_MAP, nếu không có thì dùng 'unknown'
            const visual = this.VISUAL_MAP[item.itemId] || this.VISUAL_MAP['unknown'];

            // Tạo thẻ HTML cho sản phẩm
            const itemDiv = document.createElement('div');
            itemDiv.className = `bg-white dark:bg-[#1a2e20] p-6 rounded-3xl shadow-lg border transition-all transform hover:-translate-y-1 ${isEquipped ? 'border-primary ring-2 ring-primary' : 'border-gray-100 dark:border-gray-700'}`;

            // Xử lý nút bấm (Button Logic)
            let buttonHTML = '';
            
            if (isEquipped) {
                // Trạng thái 1: Đang mặc -> Nút tĩnh màu xanh
                buttonHTML = `
                    <button class="w-full py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold rounded-xl cursor-default flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-sm">check_circle</span> Equipped
                    </button>`;
            } else if (isOwned) {
                // Trạng thái 2: Đã mua -> Nút Equip
                buttonHTML = `
                    <button onclick="Shop.equip('${item.itemId}')" class="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-colors">
                        Equip
                    </button>`;
            } else {
                // Trạng thái 3: Chưa mua -> Nút Mua (Giá tiền)
                buttonHTML = `
                    <button onclick="Shop.buy('${item.itemId}', ${item.price})" class="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-600 hover:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-sm">monetization_on</span> ${item.price}
                    </button>`;
            }

            // Gắn nội dung vào thẻ
            itemDiv.innerHTML = `
                <div class="h-40 ${visual.color} rounded-2xl mb-4 flex items-center justify-center shadow-inner relative overflow-hidden group">
                    <span class="material-symbols-outlined text-white text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">${visual.icon}</span>
                    ${isEquipped ? '<div class="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow">ACTIVE</div>' : ''}
                </div>
                <div class="mb-4">
                    <h3 class="font-bold text-lg mb-1 text-gray-800 dark:text-white">${item.name}</h3>
                    <p class="text-sm text-gray-500 h-10 line-clamp-2">${item.description || ''}</p>
                </div>
                ${buttonHTML}
            `;
            
            container.appendChild(itemDiv);
        });
    },

    // Hành động Mua
    buy: async function(itemId, price) {
        const username = localStorage.getItem('username');
        if (!confirm(`Bạn có muốn mua vật phẩm này với giá ${price} coins?`)) return;

        try {
            const res = await fetch(`${this.API_URL}/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, itemId })
            });
            const data = await res.json();
            
            if (data.success) {
                this.showMsg("Mua thành công!", "green");
                this.init(); // Tải lại shop để cập nhật nút bấm
            } else {
                this.showMsg(data.message, "red");
            }
        } catch (e) { console.error(e); }
    },

    // Hành động Trang bị (Mới)
    equip: async function(itemId) {
        const username = localStorage.getItem('username');
        try {
            const res = await fetch(`${this.API_URL}/user/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, itemId })
            });
            const data = await res.json();
            
            if (data.success) {
                this.showMsg("Đã thay đổi trang phục!", "green");
                this.init(); // Tải lại shop để cập nhật trạng thái "Equipped"
            } else {
                this.showMsg(data.message, "red");
            }
        } catch (e) { console.error(e); }
    },

    // Tiện ích hiển thị
    updateCoinDisplay: function(coins) {
        const el = document.getElementById('user-coin');
        if (el) el.innerText = coins.toLocaleString();
    },

    showMsg: function(msg, color) {
        const el = document.getElementById('shop-msg');
        if (el) {
            el.innerText = msg;
            el.className = `text-center mt-8 font-bold h-6 text-lg ${color === 'red' ? 'text-red-500' : 'text-primary'}`;
            setTimeout(() => el.innerText = "", 3000);
        }
    }
};

// Tự động chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => Shop.init());