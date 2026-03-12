/* file: public/js/userProfile.js */

const UserProfile = {
    // 1. Danh sách Avatar đa dạng (Dùng API DiceBear)
    avatars: [
        // Style: Adventurer (Thám hiểm)
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb",
        
        // Style: Bottts (Robot)
        "https://api.dicebear.com/7.x/bottts/svg?seed=Pepper",
        "https://api.dicebear.com/7.x/bottts/svg?seed=Sasha",
        
        // Style: Fun Emoji
        "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Mario",
        "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Luigi",
        
        // Style: Avataaars (Truyền thống)
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Easton"
    ],

    currentSelection: null, // Lưu avatar đang chọn tạm thời

    // Mở Modal và render danh sách
    openModal: function() {
        const modal = document.getElementById('avatar-modal');
        const grid = document.getElementById('avatar-grid');
        
        if (!modal || !grid) return;

        // Reset grid
        grid.innerHTML = '';

        // Render các Avatar có sẵn
        this.avatars.forEach(url => {
            const div = document.createElement('div');
            div.className = "w-16 h-16 rounded-full border-2 border-transparent hover:border-primary cursor-pointer transition-all overflow-hidden bg-gray-100 p-1";
            div.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-full pointer-events-none">`;
            
            div.onclick = () => {
                this.selectAvatar(url, div);
            };
            grid.appendChild(div);
        });

        modal.classList.remove('hidden');
    },

    closeModal: function() {
        document.getElementById('avatar-modal').classList.add('hidden');
    },

    // Xử lý khi chọn Avatar có sẵn
    selectAvatar: function(url, element) {
        this.currentSelection = url;
        
        // Highlight ô được chọn
        const all = document.querySelectorAll('#avatar-grid div');
        all.forEach(el => el.classList.remove('border-primary', 'ring-2', 'ring-primary/50'));
        element.classList.add('border-primary', 'ring-2', 'ring-primary/50');

        // Reset phần xem trước của Upload (nếu có)
        const preview = document.getElementById('upload-preview');
        if(preview) preview.src = "https://via.placeholder.com/150?text=Preview";
    },

    // Xử lý khi người dùng Upload ảnh từ máy
    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Kiểm tra dung lượng (Max 2MB để tránh nặng server)
        if (file.size > 2 * 1024 * 1024) {
            alert("File too large! Please choose an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;
            this.currentSelection = base64String;

            // Hiển thị preview
            const preview = document.getElementById('upload-preview');
            if(preview) {
                preview.src = base64String;
                preview.classList.remove('hidden');
            }

            // Bỏ chọn các avatar trong lưới
            const all = document.querySelectorAll('#avatar-grid div');
            all.forEach(el => el.classList.remove('border-primary', 'ring-2', 'ring-primary/50'));
        };
        reader.readAsDataURL(file);
    },

    // Lưu thay đổi
    saveAvatar: async function() {
        if (!this.currentSelection) {
            this.closeModal();
            return;
        }

        const username = localStorage.getItem('username');
        
        // Cập nhật giao diện ngay lập tức (Optimistic UI)
        const avatarImg = document.getElementById('user-avatar-img');
        if (avatarImg) avatarImg.src = this.currentSelection;

        // Lưu vào LocalStorage
        localStorage.setItem('user_avatar_custom', this.currentSelection);

        // Gửi lên Server (Nếu bạn đã có API update avatar)
        // await fetch('/api/user/update-avatar', { ... })

        this.closeModal();
        alert("Avatar Updated Successfully!");
    },

    // Cập nhật UI khi tải trang
    updateUI: function(exp, avatarId) {
        const avatarImg = document.getElementById('user-avatar-img');
        
        // Ưu tiên lấy avatar custom từ localStorage trước
        const customAvatar = localStorage.getItem('user_avatar_custom');
        if (avatarImg) {
            if (customAvatar) {
                avatarImg.src = customAvatar;
            } else if (avatarId && avatarId.startsWith('http')) {
                 avatarImg.src = avatarId;
            } else {
                 // Fallback mặc định
                 avatarImg.src = this.avatars[0];
            }
        }
        
        // Logic tính Level (Giữ nguyên)
        const level = Math.floor(Math.sqrt(exp) / 10) + 1;
        const progress = (Math.sqrt(exp) % 10) * 10;
        
        const badge = document.getElementById('user-level-badge');
        if(badge) badge.innerText = level;

        const circle = document.getElementById('level-progress-circle');
        if(circle) {
             const offset = 289 - (progress / 100) * 289;
             circle.style.strokeDashoffset = offset;
        }
    }
};