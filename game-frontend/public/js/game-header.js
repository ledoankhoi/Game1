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
        // CHỈNH SỬA: Dùng đường dẫn tương đối về trang chủ Vite
        window.location.href = '/'; 
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
        if (color === "rgb(255, 255, 255)" || !color || color === "rgba(0, 0, 0, 0)") {
            return '#25f46a';
        }
        return color;
    };

    const gamePrimary = detectGameColor();
    const gameBg = getComputedStyle(document.body).backgroundColor || '#0a0f0b';

    document.querySelectorAll('header:not(.global-header)').forEach(h => h.remove());
    document.body.style.paddingTop = "80px";

    // ==========================================
    // 4. VẼ HEADER ĐỒNG BỘ MÀU SẮC
    // ==========================================
    // CHỈNH SỬA: Logo dẫn về '/' và Avatar dẫn về '/profile'
    const headerHTML = `
        <header class="global-header" style="
            position: fixed; top: 0; left: 0; right: 0; height: 80px; z-index: 9999; 
            display: flex; align-items: center; justify-content: space-between; 
            padding: 0 32px; background: ${gameBg}; 
            border-bottom: 2px solid ${gamePrimary}44; 
            backdrop-filter: blur(15px); font-family: 'Lexend', sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        ">
            <div style="display: flex; align-items: center; gap: 16px; cursor: pointer;" onclick="window.location.href='/'">
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
                <button id="help-btn" style="background: rgba(255, 255, 255, 0.05); border: 1px solid ${gamePrimary}88; color: ${gamePrimary}; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; transition: 0.2s;" onmouseover="this.style.transform='scale(1.1)'; this.style.background='${gamePrimary}33'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'" title="Hướng dẫn chơi">
                    <span class="material-symbols-outlined" style="font-size: 24px;">help</span>
                </button>

                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid #facc1588; padding: 6px 16px; border-radius: 99px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: #facc15; font-size: 20px; font-variation-settings: 'FILL' 1;">monetization_on</span>
                    <span style="color: white; font-weight: 900; font-size: 15px;">${(user.coins || 0).toLocaleString()}</span>
                </div>

                <div style="position: relative; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.location.href='/profile'">
                    <img src="${user.avatarUrl}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${gamePrimary}; object-fit: cover; background: #000; box-shadow: 0 0 10px ${gamePrimary}44;">
                    <div style="position: absolute; bottom: -2px; right: -2px; background: ${gamePrimary}; color: #000; font-size: 10px; font-weight: 900; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid ${gameBg};">
                        ${user.level || 1}
                    </div>
                </div>

                <button onclick="handleGlobalLogout()" style="background: transparent; border: 1px solid #ff4d4d88; color: #ff4d4d; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 800; padding: 6px 12px; border-radius: 8px; font-size: 11px; transition: 0.2s;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">logout</span> THOÁT
                </button>
            </div>
        </header>

        <div id="how-to-play-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(8px); font-family: 'Lexend', sans-serif;">
            <div style="background: ${gameBg}; border: 2px solid ${gamePrimary}; border-radius: 16px; width: 90%; max-width: 650px; max-height: 85vh; display: flex; flex-direction: column; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                <div style="padding: 20px; border-bottom: 1px solid ${gamePrimary}44; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: ${gamePrimary}; font-weight: 900; text-transform: uppercase;">🎮 HƯỚNG DẪN CHƠI</h2>
                    <button id="close-modal-btn" style="background: transparent; border: none; color: white; cursor: pointer;">
                        <span class="material-symbols-outlined" style="font-size: 30px;">close</span>
                    </button>
                </div>
                <div id="how-to-play-content" style="padding: 24px; overflow-y: auto; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                    <div style="text-align: center; color: #aaa;">Đang tải dữ liệu...</div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // ==========================================
    // 5. XỬ LÝ LOGIC CLICK NÚT HƯỚNG DẪN
    // ==========================================
    document.getElementById('help-btn').addEventListener('click', async () => {
        const modal = document.getElementById('how-to-play-modal');
        const contentDiv = document.getElementById('how-to-play-content');
        modal.style.display = 'flex';

        const pathName = window.location.pathname;
        let slug = pathName.substring(pathName.lastIndexOf('/') + 1).replace('.html', '');
        if(!slug) slug = 'index';

        contentDiv.innerHTML = `<div style="text-align: center; color: #aaa;">Đang tải dữ liệu...</div>`;

        try {
            // CHỈNH SỬA: Đảm bảo khớp với route `/api/game/...` thường dùng ở Backend
            const response = await fetch(`http://localhost:3000/api/game/instructions/${slug}`);
            const data = await response.json();

            if (data.success && data.howToPlay && data.howToPlay.length > 0) {
                let html = '';
                data.howToPlay.forEach(step => {
                    html += `
                        <div style="margin-bottom: 24px; background: rgba(255,255,255,0.03); padding: 16px; border-radius: 12px; border-left: 4px solid ${gamePrimary};">
                            <h3 style="color: ${gamePrimary}; margin: 0 0 10px 0; font-size: 18px;">Bước ${step.step}</h3>
                            <p style="margin: 0 0 16px 0;">${step.description}</p>
                            ${step.imageUrl ? `<img src="${step.imageUrl}" style="max-width: 100%; border-radius: 8px;" />` : ''}
                        </div>
                    `;
                });
                contentDiv.innerHTML = html;
            } else {
                contentDiv.innerHTML = `<div style="text-align: center; color: #aaa;">${data.message || 'Chưa có dữ liệu hướng dẫn cho trò chơi này.'}</div>`;
            }
        } catch (error) {
            contentDiv.innerHTML = `<div style="text-align: center; color: #ff4d4d;">Lỗi kết nối Backend (Port 3000)!</div>`;
        }
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('how-to-play-modal').style.display = 'none';
    });
});

// ==========================================
// 6. HÀM ĐĂNG XUẤT TOÀN CỤC
// ==========================================
function handleGlobalLogout() {
    if(confirm("Bạn có chắc muốn thoát?")) {
        localStorage.clear();
        // CHỈNH SỬA: Quay về trang chủ localhost (Port 5173)
        window.location.href = '/'; 
    }
}