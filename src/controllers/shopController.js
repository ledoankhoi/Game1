/* File: src/controllers/shopController.js */
const User = require('../models/User');
const Item = require('../models/Item');

exports.buyItem = async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        // Tìm User và Item
        const user = await User.findById(userId);
        const item = await Item.findOne({ itemId: itemId });

        if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại' });
        if (!item) return res.status(404).json({ success: false, message: 'Vật phẩm không tồn tại (chưa chạy seedItems?)' });

        // Kiểm tra nếu đã có rồi
        if (user.inventory.includes(itemId)) {
            user.equippedSkin = itemId;
            await user.save();
            return res.json({ success: true, message: 'Đã trang bị!', newBalance: user.coins, equipped: itemId });
        }

        // Kiểm tra tiền
        if (user.coins < item.price) {
            return res.status(400).json({ success: false, message: 'Không đủ tiền!' });
        }

        // Trừ tiền và thêm đồ
        user.coins -= item.price;
        user.inventory.push(itemId);
        user.equippedSkin = itemId;
        
        await user.save();

        res.json({ 
            success: true, 
            message: `Mua thành công ${item.name}!`, 
            newBalance: user.coins, 
            equipped: itemId 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
};