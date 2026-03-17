import React, { useState, useEffect } from 'react';

function Shop() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchShopItems();
    syncUserData();
  }, []);

  // HÀM ĐỒNG BỘ USER TỪ SERVER (Đã sửa lại gọi đúng API có sẵn của bạn)
  const syncUserData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      setUser(null);
      return;
    }

    // Tạm hiển thị giao diện cũ cho nhanh trong lúc chờ Server trả lời
    setUser(savedUser);

    try {
      // GỌI ĐÚNG CỔNG API MÀ BACKEND BẠN ĐANG CÓ SẴN (Lưu ý: phương thức GET)
      // Nếu Backend của bạn dùng tiền tố /api/user thay vì /api/auth, hãy đổi lại nhé!
      const res = await fetch('http://localhost:3000/api/auth/profile', { 
        method: 'GET', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Nếu vẫn báo lỗi, có thể do tiền tố URL. Bạn hãy thử đổi 'api/auth/profile' thành 'api/user/profile'
        console.warn("[SHOP] API Profile trả về lỗi. Hãy kiểm tra lại prefix URL trong server.js");
        return; 
      }

      const data = await res.json();
      
      // Backend của bạn trả về { success: true, user: {...}, gamesPlayed: ... }
      if (data && data.success && data.user) {
        // Lấy dữ liệu thật CSDL đè lên LocalStorage (Túi đồ, Coin, Mặc đồ sẽ chuẩn 100%)
        const realUser = { ...savedUser, ...data.user };
        setUser(realUser);
        localStorage.setItem('user', JSON.stringify(realUser));
        console.log("[SHOP] Đã đồng bộ kho đồ thành công từ Database!");
      }
    } catch (e) {
      console.warn("[SHOP] Không thể kết nối tới Server.", e);
    }
  };
  const fetchShopItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/shop/items');
      const data = await response.json();
      if (data.success || data.items) {
        setItems(data.items || data.data || []);
      }
    } catch (error) {
      console.error("[SHOP] Lỗi lấy danh sách cửa hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (itemId, price) => {
    if (!user) return alert("Vui lòng đăng nhập để mua đồ!");
    if (user.coins < price) return alert("Bạn không đủ xu để mua vật phẩm này!");
    if (!window.confirm("Xác nhận mua vật phẩm này?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/shop/buy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ itemId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // MUA THÀNH CÔNG -> Cập nhật túi đồ
        const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(data.message || "Mua thành công!");
        
      } else {
        alert("Lỗi: " + data.message);

        // LỚP BẢO VỆ 2: AUTO-CORRECT
        // Nếu Backend báo là đã sở hữu (Lỗi 400), ta tự động nhét item này vào túi đồ trên Frontend luôn!
        if (data.message.toLowerCase().includes("sở hữu") || response.status === 400) {
           console.log("[SHOP] Kích hoạt Auto-Correct: Ép Frontend ghi nhận vật phẩm này.");
           const currentInv = user.inventory || [];
           if (!currentInv.includes(itemId)) {
               const updatedUser = { ...user, inventory: [...currentInv, itemId] };
               setUser(updatedUser);
               localStorage.setItem('user', JSON.stringify(updatedUser));
           }
        }
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleEquip = async (itemId) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/shop/equip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ itemId })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('user_avatar_custom'); 
        
        const updatedUser = { 
          ...user, 
          equipped: data.equipped, 
          avatarUrl: data.avatarUrl 
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(data.message || "Đã mặc vật phẩm!");
        
        // Đẩy sự kiện ra hệ thống để Header tự động đổi Avatar
        window.dispatchEvent(new Event('storage'));
        
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-bold">Đang tải cửa hàng...</div>;

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#1a2e20] rounded-3xl p-8 shadow-xl border border-[#e0e8e2] dark:border-[#2a3f31]">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white uppercase mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-4xl">storefront</span>
          Cửa Hàng Thời Trang
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => {
            
            // XỬ LÝ AN TOÀN TRÁNH LỖI NULL
            const userInv = Array.isArray(user?.inventory) ? user.inventory : [];
            const userEqp = user?.equipped ? Object.values(user.equipped) : [];

            const isOwned = userInv.includes(item.itemId);
            const isEquipped = userEqp.includes(item.itemId);

            return (
              <div key={item._id || item.itemId} className="bg-gray-50 dark:bg-[#102216] rounded-2xl p-4 flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                
                <div className="w-24 h-24 mb-4 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                  <img 
                    src={item.imageUrl || item.assetUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.itemId}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-gray-800 dark:text-white text-center text-sm md:text-base mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-4 capitalize">Loại: {item.category || item.type}</p>

                {!user ? (
                  <button onClick={() => alert("Vui lòng đăng nhập để mua!")} className="w-full py-2 bg-gray-200 text-gray-500 font-bold rounded-xl text-sm">Cần Đăng Nhập</button>
                ) : isEquipped ? (
                  <button disabled className="w-full py-2 bg-green-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-500/30">Đang Mặc</button>
                ) : isOwned ? (
                  <button onClick={() => handleEquip(item.itemId)} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 transition">Mặc Ngay</button>
                ) : (
                  <button onClick={() => handleBuy(item.itemId, item.price)} className="w-full py-2 bg-[#facc15] hover:bg-yellow-500 text-gray-900 font-black rounded-xl text-sm shadow-lg shadow-yellow-500/30 transition flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-sm">monetization_on</span> {item.price} Xu
                  </button>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Shop;