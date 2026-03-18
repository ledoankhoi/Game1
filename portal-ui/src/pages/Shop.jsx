import React, { useState, useEffect } from 'react';

function Shop({ searchQuery = '' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchShopItems();
    syncUserData();
  }, []);

  const syncUserData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!savedUser || !token) { setUser(null); return; }
    setUser(savedUser);

    try {
      const res = await fetch('http://localhost:3000/api/auth/profile', { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && data.user) {
        const realUser = { ...savedUser, ...data.user };
        setUser(realUser);
        localStorage.setItem('user', JSON.stringify(realUser));
      }
    } catch (e) { console.warn("[SHOP] Lỗi kết nối server.", e); }
  };

  const fetchShopItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/shop/items');
      const data = await response.json();
      if (data.success || data.items) setItems(data.items || data.data || []);
    } catch (error) { console.error("[SHOP] Lỗi lấy danh sách cửa hàng:", error); } 
    finally { setLoading(false); }
  };

  const handleBuy = async (itemId, price) => {
    if (!user) return alert("Vui lòng đăng nhập để mua đồ!");
    if (user.coins < price) return alert("Bạn không đủ xu để mua vật phẩm này!");
    if (!window.confirm("Xác nhận mua vật phẩm này?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ itemId })
      });
      const data = await response.json();
      
      if (data.success) {
        const updatedUser = { ...user, coins: data.coins, inventory: data.inventory };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(data.message || "Mua thành công!");
      } else {
        alert("Lỗi: " + data.message);
        if (data.message.toLowerCase().includes("sở hữu") || response.status === 400) {
           const currentInv = user.inventory || [];
           if (!currentInv.includes(itemId)) {
               const updatedUser = { ...user, inventory: [...currentInv, itemId] };
               setUser(updatedUser);
               localStorage.setItem('user', JSON.stringify(updatedUser));
           }
        }
      }
    } catch (error) { alert("Lỗi kết nối máy chủ!"); }
  };

  const handleEquip = async (itemId) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/shop/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ itemId })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('user_avatar_custom'); 
        const updatedUser = { ...user, equipped: data.equipped, avatarUrl: data.avatarUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(data.message || "Đã mặc vật phẩm!");
        window.dispatchEvent(new Event('storage'));
      } else { alert("Lỗi: " + data.message); }
    } catch (error) { alert("Lỗi kết nối máy chủ!"); }
  };

  const getActualRarity = (item) => {
    let r = item.rarity;
    if (!r) {
      if (item.price >= 1000) r = 'rainbow';
      else if (item.price >= 600) r = 'gold';
      else if (item.price >= 300) r = 'purple';
      else if (item.price >= 150) r = 'blue';
      else if (item.price >= 100) r = 'green';
      else r = 'silver';
    }
    return r;
  };

  const getRarityStyle = (item) => {
    const r = getActualRarity(item);
    switch (r) {
      case 'green': return { name: 'Khá', box: 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]', text: 'text-green-500', badge: 'bg-green-100 text-green-700 border-green-300' };
      case 'blue': return { name: 'Hiếm', box: 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]', text: 'text-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-300' };
      case 'purple': return { name: 'Sử Thi', box: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]', text: 'text-purple-500', badge: 'bg-purple-100 text-purple-700 border-purple-400' };
      case 'gold': return { name: 'Thần Thoại', box: 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-400' };
      case 'rainbow': return { name: 'Bạch Kim', box: 'rainbow-border shadow-[0_0_30px_rgba(236,72,153,0.5)]', text: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 animate-pulse font-black', badge: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-transparent animate-pulse' };
      default: return { name: 'Thường', box: 'border-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.2)]', text: 'text-slate-500', badge: 'bg-slate-200 text-slate-600 border-slate-300' };
    }
  };

  const rarityFilters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'silver', label: '⚪ Thường' },
    { id: 'green', label: '🟢 Khá' },
    { id: 'blue', label: '🔵 Hiếm' },
    { id: 'purple', label: '🟣 Sử thi' },
    { id: 'gold', label: '🟡 Thần Thoại' },
    { id: 'rainbow', label: '✨ Bạch Kim' }
  ];

  const categoryFilters = [
    { id: 'all', label: 'Tất cả đồ', icon: 'apps' },
    { id: 'skin', label: 'Trang phục', icon: 'accessibility_new' },
    { id: 'face', label: 'Khuôn mặt', icon: 'face' },
    { id: 'hair', label: 'Tóc & Mũ', icon: 'face_retouching_natural' },
    { id: 'shirt', label: 'Áo', icon: 'checkroom' },
    { id: 'pants', label: 'Quần', icon: 'dry_cleaning' },
    { id: 'shoes', label: 'Giày', icon: 'roller_skating' },
    { id: 'accessory', label: 'Phụ kiện', icon: 'diamond' },
    { id: 'wings', label: 'Cánh', icon: 'flight' }
  ];

  const getCategoryInfo = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'skin': return { title: 'Trang phục (Skin)' };
      case 'face': return { title: 'Khuôn mặt (Face)' };
      case 'hair': return { title: 'Tóc & Mũ (Hair)' };
      case 'shirt': return { title: 'Áo (Shirt)' };
      case 'pants': return { title: 'Quần (Pants)' };
      case 'shoes': return { title: 'Giày (Shoes)' };
      case 'accessory': return { title: 'Phụ kiện (Accessory)' };
      case 'wings': return { title: 'Cánh (Wings)' };
      default: return { title: 'Vật phẩm khác' };
    }
  };

  // --- THUẬT TOÁN XÓA DẤU TIẾNG VIỆT (TÌM KIẾM CỰC MẠNH) ---
  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Xóa dấu thanh
              .replace(/đ/g, "d").replace(/Đ/g, "D") // Đổi chữ đ
              .toLowerCase()
              .trim();
  };

  const filteredItems = items.filter(item => {
     const matchRarity = selectedRarity === 'all' || getActualRarity(item) === selectedRarity;
      
      // 2. Lọc theo phân loại
      const matchCategory = selectedCategory === 'all' || (item.category || 'other').toLowerCase() === selectedCategory;
      
      // 3. CHỈ TÌM KIẾM TRONG TÊN VẬT PHẨM (Đã sửa lại theo yêu cầu)
      if (!searchQuery) return matchRarity && matchCategory; 

      const keyword = removeAccents(searchQuery);
      const safeName = removeAccents(item.name); // Chỉ lấy đúng Tên ra để so sánh
      
      const matchSearch = safeName.includes(keyword);

      return matchRarity && matchCategory && matchSearch;
  });

  if (loading) return <div className="text-center py-20 text-xl font-bold">Đang tải cửa hàng...</div>;

  return (
    <div className="w-full relative pb-10">
      <style>{`
        @keyframes rainbow-spin { 100% { transform: rotate(360deg); } }
        .rainbow-border { position: relative; border: none !important; border-radius: 0.75rem; padding: 3px; overflow: hidden; }
        .rainbow-border::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(transparent, #ff0000, #ffa500, #ffff00, #008000, #0000ff, #4b0082, #ee82ee, transparent); animation: rainbow-spin 2s linear infinite; z-index: 0; }
        .rainbow-inner { position: relative; background: white; border-radius: calc(0.75rem - 3px); width: 100%; height: 100%; z-index: 1; }
        .dark .rainbow-inner { background: #1f2937; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="bg-white dark:bg-[#1a2e20] rounded-3xl p-6 shadow-md border border-[#e0e8e2] dark:border-[#2a3f31] mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500 text-4xl">storefront</span>
            {searchQuery ? `TÌM KIẾM: "${searchQuery}"` : 'CỬA HÀNG VẬT PHẨM'}
          </h2>
          {searchQuery && (
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm font-bold px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
              Tìm thấy {filteredItems.length} kết quả
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
              <div className="bg-white dark:bg-[#1a2e20] p-4 rounded-2xl shadow-sm border border-[#e0e8e2] dark:border-[#2a3f31] sticky top-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Phân Loại</h4>
                  <div className="flex flex-row md:flex-col gap-1 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                      {categoryFilters.map(cat => (
                          <button 
                              key={cat.id}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
                                  selectedCategory === cat.id 
                                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' 
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                              }`}
                          >
                              <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                              {cat.label}
                          </button>
                      ))}
                  </div>
              </div>
          </aside>

          <div className="flex-1 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#1a2e20] p-4 rounded-2xl shadow-sm border border-[#e0e8e2] dark:border-[#2a3f31]">
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                      {rarityFilters.map(filter => (
                          <button 
                              key={filter.id}
                              onClick={() => setSelectedRarity(filter.id)}
                              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  selectedRarity === filter.id 
                                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 shadow-md' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                          >
                              {filter.label}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="bg-white dark:bg-[#1a2e20] p-6 rounded-3xl shadow-sm border border-[#e0e8e2] dark:border-[#2a3f31] min-h-[400px]">
                  {filteredItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                          <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
                          <p className="font-bold text-lg">Không tìm thấy vật phẩm phù hợp.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                          {filteredItems.map((item) => {
                              const userInv = Array.isArray(user?.inventory) ? user.inventory : [];
                              const userEqp = user?.equipped ? Object.values(user.equipped) : [];

                              const isOwned = userInv.includes(item.itemId);
                              const isEquipped = userEqp.includes(item.itemId);
                              const rarityInfo = getRarityStyle(item);

                              return (
                                <div key={item._id || item.itemId} className="bg-gray-50 dark:bg-[#102216] rounded-2xl p-4 flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-lg transition-all relative group">
                                  
                                  <span className={`absolute -top-3 right-2 text-[10px] font-black uppercase px-3 py-1 rounded-full border z-10 ${rarityInfo.badge}`}>
                                      {rarityInfo.name}
                                  </span>

                                  <div className={`w-24 h-24 mb-4 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border-2 ${rarityInfo.box}`}>
                                      <div className={rarityInfo.name === 'Bạch Kim' ? "rainbow-inner flex items-center justify-center p-2" : "w-full h-full p-2"}>
                                          <img 
                                              src={item.imageUrl || item.assetUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.itemId}`} 
                                              alt={item.name} 
                                              className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                                          />
                                      </div>
                                  </div>

                                  <h3 className={`font-bold text-center text-sm md:text-base mb-3 truncate w-full ${rarityInfo.text}`} title={item.name}>{item.name}</h3>

                                  {!user ? (
                                    <button onClick={() => alert("Vui lòng đăng nhập để mua!")} className="w-full mt-auto py-2.5 bg-gray-200 text-gray-500 font-bold rounded-xl text-sm">Đăng Nhập</button>
                                  ) : isEquipped ? (
                                    <button disabled className="w-full mt-auto py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-500/30 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span> Đang Mặc
                                    </button>
                                  ) : isOwned ? (
                                    <button onClick={() => handleEquip(item.itemId)} className="w-full mt-auto py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 transition active:scale-95">Mặc Ngay</button>
                                  ) : (
                                    <button onClick={() => handleBuy(item.itemId, item.price)} className="w-full mt-auto py-2.5 bg-[#facc15] hover:bg-yellow-500 text-gray-900 font-black rounded-xl text-sm shadow-lg shadow-yellow-500/30 transition flex justify-center items-center gap-1 active:scale-95">
                                      <span className="material-symbols-outlined text-sm">monetization_on</span> {item.price} Xu
                                    </button>
                                  )}
                                </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}

export default Shop;