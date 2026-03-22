// file: public/js/game-header.js

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. TỰ ĐỘNG BƠM FONT VÀ CSS (KHÔNG CẦN SỬA HTML)
    // ==========================================
    const injectResources = () => {
        const resources = [
            'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;700;900&display=swap',
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
        ];

        resources.forEach(url => {
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                document.head.appendChild(link);
            }
        });
    };
    injectResources();

    // ==========================================
    // 2. KIỂM TRA ĐĂNG NHẬP
    // ==========================================
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'http://localhost:5173';
        return;
    }
    const user = JSON.parse(userStr);

    // ==========================================
    // 3. THUẬT TOÁN NHẬN DIỆN MÀU TỰ ĐỘNG
    // ==========================================
    const detectGameColor = () => {
        let color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        if (!color || color === "") {
            const ghost = document.createElement('div');
            ghost.className = 'text-primary';
            ghost.style.display = 'none';
            document.body.appendChild(ghost);
            color = getComputedStyle(ghost).color;
            document.body.removeChild(ghost);
        }
        // Nếu là màu trắng mặc định hoặc không tìm thấy, dùng xanh lá
        if (color === "rgb(255, 255, 255)" || !color || color === "rgba(0, 0, 0, 0)") {
            return '#25f46a';
        }
        return color;
    };

    const gamePrimary = detectGameColor();
    const gameBg = getComputedStyle(document.body).backgroundColor || '#0a0f0b';

    // Dọn dẹp header cũ và chỉnh khoảng cách
    document.querySelectorAll('header:not(.global-header)').forEach(h => h.remove());
    document.body.style.paddingTop = "80px";

    // ==========================================
    // 4. VẼ HEADER ĐỒNG BỘ MÀU SẮC
    // ==========================================
    const headerHTML = `
        <header class="global-header" style="
            position: fixed; top: 0; left: 0; right: 0; height: 80px; z-index: 9999; 
            display: flex; align-items: center; justify-content: space-between; 
            padding: 0 32px; background: ${gameBg}; 
            border-bottom: 2px solid ${gamePrimary}44; 
            backdrop-filter: blur(15px); font-family: 'Lexend', sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        ">
            
            <div style="display: flex; align-items: center; gap: 16px; cursor: pointer;" onclick="window.location.href='http://localhost:5173'">
                <div style="background: ${gamePrimary}; padding: 8px; border-radius: 12px; color: #000; display: flex; box-shadow: 0 0 15px ${gamePrimary}66;">
                    <span class="material-symbols-outlined" style="font-size: 32px; font-variation-settings: 'FILL' 1;">stadia_controller</span>
                </div>
                <div>
                    <h2 style="margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; color: white; letter-spacing: -0.5px;">
                        MATH<span style="color: ${gamePrimary};">QUEST</span>
                    </h2>
                    <p style="margin: 2px 0 0 0; font-size: 9px; color: ${gamePrimary}; letter-spacing: 2px; font-weight: 800; opacity: 0.8;">HỆ THỐNG ĐỒNG BỘ</p>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 24px;">
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid #facc1588; padding: 6px 16px; border-radius: 99px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: #facc15; font-size: 20px; font-variation-settings: 'FILL' 1;">monetization_on</span>
                    <span style="color: white; font-weight: 900; font-size: 15px;">${(user.coins || 0).toLocaleString()}</span>
                </div>

                <div style="position: relative; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.location.href='http://localhost:5173/profile'">
                    <img src="${user.avatarUrl}" 
                         style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${gamePrimary}; object-fit: cover; background: #000; box-shadow: 0 0 10px ${gamePrimary}44;">
                    <div style="position: absolute; bottom: -2px; right: -2px; background: ${gamePrimary}; color: #000; 
                                font-size: 10px; font-weight: 900; width: 20px; height: 20px; 
                                display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid ${gameBg};">
                        ${user.level || 1}
                    </div>
                </div>

                <button onclick="handleGlobalLogout()" style="background: transparent; border: 1px solid #ff4d4d88; color: #ff4d4d; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 800; padding: 6px 12px; border-radius: 8px; font-size: 11px; transition: 0.2s;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">logout</span> THOÁT
                </button>
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
});

function handleGlobalLogout() {
    if(confirm("Bạn có chắc muốn thoát?")) {
        localStorage.clear();
        window.location.href = 'http://localhost:5173';
    }
}