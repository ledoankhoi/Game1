/* file: public/js/userProfile.js */

const UserProfile = {
    // Danh sách Avatar có sẵn (Dùng tên file ảnh hoặc class icon)
    AVATARS: [
        'avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 
        'avatar_5', 'avatar_6', 'avatar_7', 'avatar_8'
    ],

    // Mapping ID sang hình ảnh thực tế (Bạn có thể thay bằng URL ảnh thật)
    getAvatarImage: function(id) {
        // Ở đây tôi dùng tạm URL ảnh mẫu từ internet tương ứng với các ID
        const map = {
            'avatar_1': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            'avatar_2': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
            'avatar_3': 'https://api.dicebear.com/7.x/bottts/svg?seed=Spot',
            'avatar_4': 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
            'avatar_5': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Midnight',
            'avatar_6': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco',
            'avatar_7': 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy',
            'avatar_8': 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool'
        };
        return map[id] || map['avatar_1'];
    },

    // --- LOGIC TÍNH LEVEL ---
    // Công thức: Level = Căn bậc 2 của (EXP / 100) + 1
    // Càng lên cao càng khó.
    // Lv 1: 0 exp
    // Lv 2: 100 exp
    // Lv 3: 400 exp
    // Lv 4: 900 exp
    calculateLevelInfo: function(exp) {
        const LEVEL_FACTOR = 100; // Hệ số khó
        
        // 1. Tính Level hiện tại
        let level = Math.floor(Math.sqrt(exp / LEVEL_FACTOR)) + 1;
        
        // 2. Tính EXP cần cho Level hiện tại và Level kế tiếp
        let currentLevelBaseExp = Math.pow(level - 1, 2) * LEVEL_FACTOR;
        let nextLevelBaseExp = Math.pow(level, 2) * LEVEL_FACTOR;
        
        // 3. Tính % tiến trình
        let expNeeded = nextLevelBaseExp - currentLevelBaseExp;
        let expGainedInLevel = exp - currentLevelBaseExp;
        let percent = (expGainedInLevel / expNeeded) * 100;

        // Giới hạn 0-100%
        percent = Math.min(Math.max(percent, 0), 100);

        return { level, percent, nextLevelExp: nextLevelBaseExp };
    },

    // --- CẬP NHẬT GIAO DIỆN ---
    updateUI: function(exp, avatarId) {
        const info = this.calculateLevelInfo(exp);
        
        // 1. Cập nhật số Level (Badge nhỏ góc dưới)
        const badge = document.getElementById('user-level-badge');
        if (badge) badge.innerText = info.level;

        // 2. Cập nhật ảnh Avatar
        const img = document.getElementById('user-avatar-img');
        if (img) img.src = this.getAvatarImage(avatarId);

        // 3. Cập nhật Vòng tròn xanh lá (Progress Ring)
        const circle = document.getElementById('level-progress-circle');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            
            // Tính toán đoạn bù (offset) để vẽ màu xanh
            const offset = circumference - (info.percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        // Lưu thông tin avatar hiện tại để dùng cho modal
        this.currentAvatarId = avatarId;
    },

    // --- XỬ LÝ CHỌN AVATAR ---
    openModal: function() {
        const modal = document.getElementById('avatar-modal');
        const grid = document.getElementById('avatar-grid');
        if (!modal || !grid) return;

        // Xóa cũ, vẽ mới
        grid.innerHTML = '';
        this.AVATARS.forEach(id => {
            const div = document.createElement('div');
            div.className = `p-2 rounded-xl cursor-pointer border-2 transition-all hover:scale-105 ${id === this.currentAvatarId ? 'border-primary bg-green-50' : 'border-transparent hover:bg-gray-100'}`;
            div.innerHTML = `<img src="${this.getAvatarImage(id)}" class="w-16 h-16 rounded-full">`;
            
            div.onclick = () => this.selectAvatar(id);
            grid.appendChild(div);
        });

        modal.classList.remove('hidden');
    },

    closeModal: function() {
        document.getElementById('avatar-modal').classList.add('hidden');
    },

    selectAvatar: async function(newId) {
        const username = localStorage.getItem('username');
        if (!username) return;

        // 1. Gọi API lưu
        try {
            const res = await fetch('http://localhost:3000/api/user/avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, avatarId: newId })
            });
            const data = await res.json();
            
            if (data.success) {
                // 2. Cập nhật UI ngay lập tức
                const img = document.getElementById('user-avatar-img');
                if (img) img.src = this.getAvatarImage(newId);
                
                // Cập nhật lại Auth user
                if (Auth.user) Auth.user.avatarId = newId;
                
                this.closeModal();
            }
        } catch (err) {
            console.error("Lỗi đổi avatar:", err);
        }
    }
};