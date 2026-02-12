/* file: js/characterManager.js */
const CharacterManager = {
    el: null, // Thẻ HTML chứa nhân vật
    currentSkinId: 'default',
    
    // Hàm khởi chạy
    init: function() {
        // 1. Lấy skin đang mặc từ bộ nhớ (nếu chưa có thì mặc định)
        this.currentSkinId = localStorage.getItem('currentOutfit') || 'default';
        
        // 2. Vẽ nhân vật ra màn hình
        this.createCharacterElement();
        
        // 3. Tô màu cho nhân vật
        this.updateAppearance();

        // 4. Lắng nghe nếu người chơi thay đồ trong Shop -> Cập nhật ngay
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentOutfit') {
                this.currentSkinId = e.newValue;
                this.updateAppearance();
            }
        });
    },

    // Tạo thẻ HTML
    createCharacterElement: function() {
        // Nếu đã tạo rồi thì thôi
        if (document.getElementById('user-character')) return;

        // Tạo khung chính (Nằm góc trái dưới)
        const div = document.createElement('div');
        div.id = 'user-character';
        div.className = "fixed bottom-4 left-4 z-[9999] cursor-pointer group flex flex-col items-center gap-1 hover:scale-110 transition-transform duration-200";
        
        // Tạo bong bóng thoại (Ẩn mặc định)
        const bubble = document.createElement('div');
        bubble.id = 'char-bubble';
        bubble.className = "bg-white text-gray-800 text-[10px] font-bold px-3 py-1 rounded-lg shadow-md mb-1 opacity-0 transition-opacity duration-300 whitespace-nowrap border border-gray-200";
        bubble.innerText = "...";
        
        // Tạo hình nhân vật (Sprite)
        const charDiv = document.createElement('div');
        charDiv.id = 'char-sprite';
        charDiv.className = "shin-character pose-idle"; // Dùng class CSS ở Bước 2
        
        // Sự kiện: Bấm vào thì tương tác
        div.onclick = () => this.poke();

        // Gắn vào trang web
        div.appendChild(bubble);
        div.appendChild(charDiv);
        document.body.appendChild(div);
        
        this.el = div;
    },

    // Cập nhật màu sắc (Skin)
    updateAppearance: function() {
        const config = CharacterData.skins[this.currentSkinId] || CharacterData.skins['default'];
        const sprite = document.getElementById('char-sprite');
        
        if (sprite) {
            sprite.style.filter = config.filter; // Áp dụng bộ lọc màu
        }
    },

    // Tương tác (Chọc ghẹo)
    poke: function() {
        const config = CharacterData.skins[this.currentSkinId] || CharacterData.skins['default'];
        const sprite = document.getElementById('char-sprite');
        const bubble = document.getElementById('char-bubble');

        if (!sprite || !bubble) return;

        // 1. Hiệu ứng nảy lên
        this.el.classList.add('animate-bounce'); // Class có sẵn của Tailwind
        
        // 2. Đổi tư thế sang "Chỉ tay/Tấn công"
        sprite.classList.remove('pose-idle');
        sprite.classList.add('pose-action');

        // 3. Hiện câu thoại
        bubble.innerText = config.msg;
        bubble.classList.remove('opacity-0');

        // 4. Trở về bình thường sau 1.5 giây
        setTimeout(() => {
            this.el.classList.remove('animate-bounce');
            sprite.classList.remove('pose-action');
            sprite.classList.add('pose-idle');
            bubble.classList.add('opacity-0');
        }, 1500);
    },
    
    // Hàm làm mới (Dùng cho nút Equip trong Shop)
    refresh: function() {
        this.currentSkinId = localStorage.getItem('currentOutfit') || 'default';
        this.updateAppearance();
    }
};

// Tự động chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Đợi 1 xíu để đảm bảo các thư viện khác đã load
    setTimeout(() => CharacterManager.init(), 200);
});