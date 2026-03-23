const User = require('../models/User');
const Item = require('../models/Item');

// 1. LẤY DANH SÁCH ĐỒ
const getShopItems = async (req, res) => {
    try {
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

// 3. MẶC ĐỒ (ĐÃ NÂNG CẤP: BẢO TOÀN KHUNG VÀ HUY HIỆU)
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

        // Đảm bảo object equipped tồn tại
        if (!user.equipped) user.equipped = {};

        // --- CHIÊU THỨC MỚI ---
        if (item.category === 'frame') {
            // Nếu đồ mặc là KHUNG: Chỉ thay đổi khung, không chạm vào Avatar
            user.equipped.frame = itemId;
        } else {
            // Nếu đồ mặc là AVATAR: Xóa sạch đồ cũ, NHƯNG LƯU LẠI Khung và Huy Hiệu
            const currentFrame = user.equipped.frame;
            const currentBadge = user.equipped.badge;
            
            user.equipped = {}; 
            if (currentFrame) user.equipped.frame = currentFrame;
            if (currentBadge) user.equipped.badge = currentBadge;
            
            // Mặc Avatar mới vào
            user.equipped[item.category] = itemId;
            user.avatarUrl = item.imageUrl || item.assetUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.itemId}`;
        }

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

module.exports = { getShopItems, getAllItems: getShopItems, buyItem, equipItem };