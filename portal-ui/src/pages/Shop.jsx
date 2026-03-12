import React, { useState, useEffect } from 'react';

function Shop() {
  const [items, setItems] = useState([]); // Luôn đảm bảo là mảng rỗng ban đầu
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    fetch('http://localhost:3000/api/shop/items')
      .then(res => res.json())
      .then(data => {
        // BẢO VỆ: Chỉ cập nhật nếu data.items là một mảng hợp lệ
        if (data.success && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]); 
        }
      })
      .catch(err => {
        console.error("Lỗi tải Shop:", err);
        setItems([]);
      });
  }, []);

  const handleBuy = async (itemId, price) => {
    if (!user) return alert("Bạn phải đăng nhập để mua đồ!");
    if (user.coins < price) return alert("Bạn không đủ Xu!");

    const token = localStorage.getItem('token');
    try {
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
        const updatedUser = { ...user, coins: data.newCoins, inventory: data.inventory };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("🎉 Mua thành công!");
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleEquip = async (itemId, category) => {
    if (!user) return alert("Vui lòng đăng nhập!");
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/shop/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, category })
      });
      const data = await response.json();
      
      if (data.success) {
        const updatedUser = { ...user, equipped: data.equipped };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('user_avatar_custom', `https://api.dicebear.com/7.x/bottts/svg?seed=${itemId}`);
        alert("👕 Đã thay đồ thành công!");
        window.location.reload(); 
      }
    } catch (error) {
      alert("Lỗi mặc đồ!");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#1a2e20] rounded-3xl shadow-xl">
      <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-6 uppercase flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-blue-500">storefront</span>
        Cửa hàng Thời trang
      </h1>
      
      {/* BẢO VỆ: Kiểm tra xem items có tồn tại và có đồ không */}
      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => {
            // Thêm dấu ? để chống sập nếu user chưa load kịp
            const isOwned = user?.inventory?.includes(item.itemId);
            const isEquipped = user?.equipped?.[item.category] === item.itemId;

            return (
              <div key={item.itemId} className="bg-gray-50 dark:bg-[#0f1a14] border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center hover:border-blue-400 transition-colors">
                <img src={item.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.itemId}`} alt={item.name} className="w-24 h-24 mb-4 object-contain drop-shadow-md" />
                <h3 className="font-bold text-lg dark:text-white text-center mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4 capitalize">Loại: {item.category}</p>
                
                <div className="mt-auto w-full">
                  {isEquipped ? (
                    <button disabled className="w-full py-2 bg-green-500 text-white font-bold rounded-xl cursor-not-allowed">Đang Mặc</button>
                  ) : isOwned ? (
                    <button onClick={() => handleEquip(item.itemId, item.category)} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition">Mặc Lên Người</button>
                  ) : (
                    <button onClick={() => handleBuy(item.itemId, item.price)} className="w-full py-2 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black rounded-xl transition">
                      <span className="material-symbols-outlined text-sm">monetization_on</span> {item.price} Xu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
          <p className="text-xl text-gray-500 font-bold">Cửa hàng hiện chưa có mặt hàng nào.</p>
        </div>
      )}
    </div>
  );
}

export default Shop;