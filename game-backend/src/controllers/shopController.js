const User = require('../models/User');
const Item = require('../models/Item');

// 1. LẤY DANH SÁCH ĐỒ
const getShopItems = async (req, res) => {
    try {
        // XÓA BỎ ĐIỀU KIỆN { isActive: true }
        const items = await Item.find(); 
        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// 2. MUA ĐỒ
const buyItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;

        const item = await Item.findOne({ itemId }); 
        if (!item) return res.status(404).json({ success: false, message: "Vật phẩm không tồn tại!" });

        const user = await User.findById(userId);

        if (user.inventory.includes(itemId)) {
            return res.status(400).json({ success: false, message: "Bạn đã sở hữu vật phẩm này rồi!" });
        }
        if (user.coins < item.price) {
            return res.status(400).json({ success: false, message: "Bạn không đủ Xu để mua!" });
        }

        user.coins -= item.price;
        user.inventory.push(itemId);
        await user.save();

        res.json({ success: true, message: `Mua thành công ${item.name}!`, coins: user.coins, inventory: user.inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// 3. MẶC ĐỒ (ĐÃ FIX LỖI ĐỔI AVATAR)
// 3. MẶC ĐỒ (CHỈ CHO PHÉP 1 AVATAR DUY NHẤT)
const equipItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;

        const item = await Item.findOne({ itemId });
        if (!item) return res.status(404).json({ success: false, message: "Vật phẩm không hợp lệ!" });

        const user = await User.findById(userId);

        if (!user.inventory.includes(itemId)) {
            return res.status(400).json({ success: false, message: "Bạn chưa mua vật phẩm này!" });
        }

        // --- CHIÊU THỨC MỚI ---
        // Xóa sạch toàn bộ đồ đang mặc trước đó
        user.equipped = {}; 
        
        // Mặc đồ mới vào
        user.equipped[item.category] = itemId;

        // Cập nhật Avatar
        user.avatarUrl = item.imageUrl || item.assetUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.itemId}`;

        user.markModified('equipped');
        await user.save();

        res.json({ 
            success: true, 
            message: `Đã trang bị ${item.name}!`, 
            equipped: user.equipped,
            avatarUrl: user.avatarUrl 
        });
    } catch (error) {
        console.error("Lỗi khi mặc đồ:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};
// Xuất khẩu các hàm (Hỗ trợ cả tên getAllItems để phòng hờ route của bạn gọi tên cũ)
module.exports = { getShopItems, getAllItems: getShopItems, buyItem, equipItem };