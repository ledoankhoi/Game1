const User = require('../models/User');
const Item = require('../models/Item');

// 1. Lấy toàn bộ danh sách đồ trong Shop
exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.json({ success: true, items });
    } catch (error) {
        console.error("Lỗi lấy items:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 2. Mua vật phẩm
exports.buyItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id; // Lấy từ thẻ căn cước (token) của người dùng

        const user = await User.findById(userId);
        const item = await Item.findOne({ itemId });

        if (!item) return res.status(404).json({ success: false, message: 'Vật phẩm không tồn tại' });
        if (user.inventory.includes(itemId)) return res.status(400).json({ success: false, message: 'Bạn đã sở hữu vật phẩm này rồi' });
        if (user.coins < item.price) return res.status(400).json({ success: false, message: 'Bạn không đủ Xu để mua' });

        // Trừ tiền và nhét đồ vào Balo (Inventory)
        user.coins -= item.price;
        user.inventory.push(itemId);
        await user.save();

        res.json({ success: true, message: 'Mua thành công!', newCoins: user.coins, inventory: user.inventory });
    } catch (error) {
        console.error("Lỗi mua đồ:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 3. Trang bị vật phẩm (Mặc lên người)
exports.equipItem = async (req, res) => {
    try {
        const { itemId, category } = req.body; // Ví dụ: itemId: 'hat_vip', category: 'hair'
        const userId = req.user.id;

        const user = await User.findById(userId);
        
        // Kiểm tra xem có ăn gian không (chưa mua mà đòi mặc)
        if (!user.inventory.includes(itemId) && itemId !== 'default') {
            return res.status(403).json({ success: false, message: 'Bạn chưa sở hữu vật phẩm này' });
        }

        user.equipped[category] = itemId;
        user.markModified('equipped'); // Bắt buộc có để MongoDB lưu object lồng nhau
        await user.save();

        res.json({ success: true, message: 'Đã thay đổi trang phục!', equipped: user.equipped });
    } catch (error) {
        console.error("Lỗi trang bị:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};