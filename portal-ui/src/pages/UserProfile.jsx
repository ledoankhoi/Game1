import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [shopItems, setShopItems] = useState([]); 
  const [previewImage, setPreviewImage] = useState(''); 
  
  // CHIÊU THỨC MỚI: Nhớ ID của vật phẩm được chọn để đồng bộ với Shop
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
      setPreviewImage(savedUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${savedUser.username}`);
      
      // Khôi phục ID đang mặc nếu có
      if (savedUser.equipped && Object.values(savedUser.equipped).length > 0) {
        setSelectedItemId(Object.values(savedUser.equipped)[0]);
      }
    }
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/shop/items');
      const data = await response.json();
      if (data.success) {
        setShopItems(data.items || []);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách shop:", error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Ảnh quá nặng, vui lòng chọn ảnh dưới 2MB!");

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
      // Nếu tải ảnh từ máy, xóa ID vật phẩm Shop đi
      setSelectedItemId(null); 
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');

      // TRƯỜNG HỢP 1: Chọn ảnh từ danh sách Shop -> Gọi API Mặc Đồ để đồng bộ 100%
      if (selectedItemId) {
        const response = await fetch('http://localhost:3000/api/shop/equip', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ itemId: selectedItemId })
        });
        const data = await response.json();
        
        if (data.success) {
          const updatedUser = { ...user, equipped: data.equipped, avatarUrl: data.avatarUrl };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert("Thay đổi ảnh đại diện thành công!");
          setIsModalOpen(false);
          window.location.reload();
        } else {
          // Báo lỗi nếu người dùng chọn đồ chưa mua
          alert("Lỗi: " + data.message + " (Gợi ý: Ra Shop mua trước nhé!)");
        }
      } 
      // TRƯỜNG HỢP 2: Tải ảnh Custom lên (Tự động cởi đồ Shop đang mặc ra)
      else {
        const updatedUser = { ...user, avatarUrl: previewImage, equipped: {} };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Đã cập nhật ảnh tải lên từ máy tính!");
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      alert("Có lỗi kết nối máy chủ!");
    }
  };

  if (!user) return <div className="text-center mt-20 font-bold">Vui lòng đăng nhập!</div>;

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* THÔNG TIN HỒ SƠ */}
      <div className="bg-white dark:bg-[#1a2e20] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-[#2a3f31] flex flex-col md:flex-row items-center gap-8 mb-8">
        
        <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <div className="w-32 h-32 rounded-full border-4 border-primary p-1 overflow-hidden shadow-lg bg-gray-50">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">{user.username}</h1>
          <p className="text-gray-500 font-medium mb-4">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">monetization_on</span> {user.coins} Xu
            </div>
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">military_tech</span> Cấp {user.level || 1}
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG MODAL ĐỔI ẢNH */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e20] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800 dark:text-white">Đổi Ảnh Đại Diện</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <p className="text-xs font-bold text-primary mb-3 uppercase tracking-widest">Ảnh xem trước</p>
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary p-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              <label className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <span className="material-symbols-outlined">upload</span> Tải ảnh Custom từ máy
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <div className="relative flex py-2 items-center mb-4">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase">Hoặc chọn từ Cửa hàng</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-2">
                {shopItems.length > 0 ? shopItems.map((item) => {
                  const itemImg = item.imageUrl || item.assetUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.itemId}`;
                  return (
                    <button 
                      key={item._id}
                      onClick={() => {
                        setPreviewImage(itemImg);
                        setSelectedItemId(item.itemId); // Nhớ ID khi click
                      }}
                      className={`w-full aspect-square rounded-xl border-2 p-1 overflow-hidden transition-all ${selectedItemId === item.itemId ? 'border-primary scale-105 shadow-md' : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:border-gray-300'}`}
                      title={item.name}
                    >
                      <img src={itemImg} alt={item.name} className="w-full h-full object-cover" />
                    </button>
                  )
                }) : (
                  <p className="col-span-4 text-center text-sm text-gray-500">Chưa có vật phẩm nào.</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-[#102216]">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition">Hủy</button>
              <button onClick={handleSaveAvatar} className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition">Lưu Thay Đổi</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;