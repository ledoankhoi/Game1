import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users'); 
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); 
  
  // STATE ĐỂ BIẾT LÀ ĐANG "THÊM MỚI" HAY "SỬA"
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      alert('⛔ Bạn không có quyền truy cập!');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setData([]);
    try {
      const token = localStorage.getItem('token');
      let url = '';
      if (activeTab === 'users') url = 'http://localhost:3000/api/admin/users';
      else if (activeTab === 'games') url = 'http://localhost:3000/api/game/list';
      else if (activeTab === 'items') url = 'http://localhost:3000/api/shop/items'; 
      
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      if (result.success) setData(result[activeTab] || result.items || result.games || result.users || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác!')) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'items' ? 'items' : (activeTab === 'users' ? 'users' : 'games');
      const response = await fetch(`http://localhost:3000/api/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        alert('Xóa thành công!');
        fetchData(); 
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Lỗi kết nối server!');
    }
  };

  // --- HÀM KÍCH HOẠT CHẾ ĐỘ SỬA ---
  const handleEdit = (item) => {
    setEditingId(item._id); // Lưu lại ID đang sửa
    setFormData(item);      // Đổ toàn bộ dữ liệu cũ vào Form
    setImagePreview(item.imageUrl || item.assetUrl || item.avatarUrl || item.thumbnailUrl || null);
    setShowModal(true);     // Mở bảng lên
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh có dung lượng dưới 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setImagePreview(base64String); 
      if (activeTab === 'items') setFormData({ ...formData, imageUrl: base64String });
      else if (activeTab === 'games') setFormData({ ...formData, thumbnailUrl: base64String });
      else if (activeTab === 'users') setFormData({ ...formData, avatarUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'items' ? 'items' : (activeTab === 'users' ? 'users' : 'games');
      
      // KIỂM TRA: Nếu có editingId thì CẬP NHẬT (PUT), nếu không thì THÊM MỚI (POST)
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3000/api/admin/${endpoint}/${editingId}` 
        : `http://localhost:3000/api/admin/${endpoint}`;
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        setShowModal(false);
        fetchData(); 
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Lỗi kết nối Server!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // HÀM KÍCH HOẠT CHẾ ĐỘ THÊM MỚI
  const openModal = () => {
    setEditingId(null); // Xóa trắng ID
    setFormData({}); 
    setImagePreview(null); 
    setShowModal(true);
  };

  return (
    <div className="w-full bg-white dark:bg-[#1a2e20] rounded-3xl shadow-xl border border-[#e0e8e2] dark:border-[#2a3f31] overflow-hidden min-h-[600px] flex flex-col relative">
      
      <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-red-500">admin_panel_settings</span>
          <h1 className="text-2xl font-black uppercase tracking-widest">Trạm Điều Khiển</h1>
        </div>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition">Thoát</button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#102216]">
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 font-bold text-center flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'text-primary border-b-4 border-primary bg-white dark:bg-[#1a2e20]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <span className="material-symbols-outlined">group</span> Người Chơi
        </button>
        <button onClick={() => setActiveTab('items')} className={`flex-1 py-4 font-bold text-center flex items-center justify-center gap-2 transition-colors ${activeTab === 'items' ? 'text-primary border-b-4 border-primary bg-white dark:bg-[#1a2e20]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <span className="material-symbols-outlined">inventory_2</span> Cửa Hàng
        </button>
        <button onClick={() => setActiveTab('games')} className={`flex-1 py-4 font-bold text-center flex items-center justify-center gap-2 transition-colors ${activeTab === 'games' ? 'text-primary border-b-4 border-primary bg-white dark:bg-[#1a2e20]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <span className="material-symbols-outlined">stadia_controller</span> Kho Game
        </button>
      </div>

      <div className="p-6 flex-1 bg-gray-50/50 dark:bg-[#0f1a14] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">Danh sách {activeTab}</h2>
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition active:scale-95">
            <span className="material-symbols-outlined">add</span> Thêm Mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 font-bold text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2e20]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <th className="p-4 font-bold"># ID / Tên</th>
                  <th className="p-4 font-bold">Thông tin phụ</th>
                  <th className="p-4 font-bold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item) => (
                  <tr key={item._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4 flex items-center gap-3">
                      {activeTab === 'users' && <img src={item.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.username}`} className="w-10 h-10 rounded-full border border-gray-300 object-cover" alt="avatar" />}
                      {activeTab === 'games' && <img src={item.thumbnailUrl || 'https://via.placeholder.com/150'} className="w-16 h-10 rounded-md object-cover border border-gray-300" alt="thumb" />}
                      {activeTab === 'items' && <img src={item.imageUrl || item.assetUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-md object-cover bg-gray-100" alt="item" />}
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{activeTab === 'users' ? item.username : (activeTab === 'items' ? item.name : item.title)}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {activeTab === 'items' ? `ID: ${item.itemId}` : (activeTab === 'games' ? `Slug: ${item.slug}` : item._id)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {activeTab === 'users' && (
                        <div className="flex flex-col gap-1">
                           <span className="text-sm">{item.email}</span>
                           <div className="flex gap-2 items-center">
                             <span className={`px-2 py-0.5 inline-block w-fit rounded-md text-[10px] font-bold ${item.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.role === 'admin' ? 'ADMIN' : 'USER'}</span>
                             <span className="text-xs font-bold text-yellow-500">{item.coins} Xu</span>
                           </div>
                        </div>
                      )}
                      {activeTab === 'games' && (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold w-fit uppercase">{item.category}</span>
                          <span className="text-xs text-blue-500">{item.gameUrl}</span>
                        </div>
                      )}
                      {activeTab === 'items' && <div className="flex items-center gap-1 font-bold text-yellow-500"><span className="material-symbols-outlined text-sm">monetization_on</span> {item.price}</div>}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {/* ĐÃ BỔ SUNG NÚT SỬA VÀO ĐÂY */}
                      <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 transition">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 p-2 transition">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="3" className="p-8 text-center text-gray-500">Chưa có dữ liệu.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a2e20] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] md:max-h-[85vh]">
            
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#102216]">
              <h3 className="font-black text-lg text-gray-800 dark:text-white uppercase">
                {editingId ? 'Cập Nhật' : 'Thêm'} {activeTab === 'items' ? 'Vật Phẩm' : (activeTab === 'users' ? 'Tài Khoản' : 'Game')}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
              
              <div className="flex flex-col items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase block w-full text-left mb-1">
                  Hình ảnh đính kèm (Dưới 2MB) <span className="text-gray-400 normal-case font-normal">(Tùy chọn)</span>
                </span>
                <label className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#102216] border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <span className="material-symbols-outlined text-primary">cloud_upload</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-1 truncate">
                    {imagePreview ? 'Đã có ảnh' : 'Click để tải ảnh lên...'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="w-full mt-2 flex justify-center">
                    <img src={imagePreview} alt="Preview" className={`object-cover border-2 border-primary rounded-xl ${activeTab === 'users' ? 'w-24 h-24 rounded-full' : 'w-full h-32'}`} />
                  </div>
                )}
              </div>

              {activeTab === 'items' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mã Vật Phẩm (ID)</label>
                    <input required value={formData.itemId || ''} type="text" name="itemId" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" disabled={editingId ? true : false} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tên hiển thị</label>
                    <input required value={formData.name || ''} type="text" name="name" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mô tả vật phẩm</label>
                    <input value={formData.description || ''} type="text" name="description" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phân Loại</label>
                      <select required value={formData.category || ''} name="category" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white">
                        <option value="">Chọn...</option>
                        <option value="skin">Skin / Áo</option>
                        <option value="face">Face / Khuôn mặt</option>
                        <option value="hair">Hair / Tóc</option>
                        <option value="shirt">Shirt / Áo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Giá (Xu)</label>
                      <input required value={formData.price || ''} type="number" name="price" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Đường dẫn Asset Game</label>
                    <input value={formData.assetUrl || ''} type="text" name="assetUrl" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white text-sm" />
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tên người dùng</label>
                    <input required value={formData.username || ''} type="text" name="username" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                    <input required value={formData.email || ''} type="email" name="email" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" disabled={editingId ? true : false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mật khẩu <span className="text-gray-400 normal-case">{editingId ? '(Bỏ trống giữ nguyên)' : ''}</span></label>
                      <input required={!editingId} type="password" name="password" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cấp quyền</label>
                      <select required value={formData.role || 'user'} name="role" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white">
                        <option value="user">User (Người chơi)</option>
                        <option value="admin">Admin (Quản trị)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Số Xu</label>
                    <input value={formData.coins || 0} type="number" name="coins" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                  </div>
                </>
              )}

              {activeTab === 'games' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tên Game</label>
                    <input required value={formData.title || ''} type="text" name="title" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Slug (ID Game)</label>
                      <input required value={formData.slug || ''} type="text" name="slug" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Thể loại</label>
                      <select required value={formData.category || ''} name="category" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white">
                        <option value="">Chọn...</option>
                        <option value="Math">Math</option>
                        <option value="Logic">Logic</option>
                        <option value="Speed">Speed</option>
                        <option value="Memory">Memory</option>
                        <option value="Elite">Elite</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Đường dẫn chạy Game (gameUrl)</label>
                    <input required value={formData.gameUrl || ''} type="text" name="gameUrl" onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-primary dark:bg-gray-800 dark:text-white text-sm" />
                  </div>
                </>
              )}
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#102216]">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold rounded-xl transition">
                Hủy
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
                {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập Nhật' : 'Thêm Mới')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;