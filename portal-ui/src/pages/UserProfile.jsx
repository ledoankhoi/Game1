import React, { useState, useEffect } from 'react';

const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Pepper",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Mario",
    "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Luigi",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Easton"
];

function UserProfile() {
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [customImageBase64, setCustomImageBase64] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        const savedCustomAvatar = localStorage.getItem('user_avatar_custom');
        if (savedCustomAvatar) setCustomImageBase64(savedCustomAvatar);
    }, []);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">lock</span>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Vui lòng đăng nhập để xem hồ sơ!</h2>
            </div>
        );
    }

    const scores = user.scores || {};
    const totalExp = Object.values(scores).reduce((a, b) => a + b, 0); 
    const level = Math.floor(Math.sqrt(totalExp) / 10) + 1;
    const progress = (Math.sqrt(totalExp) % 10) * 10;
    const strokeDashoffset = 289 - (progress / 100) * 289; 
    const gamesPlayed = Object.keys(scores).filter(k => scores[k] > 0).length;

    // Hàm mở Bảng chọn (Kèm log để kiểm tra lỗi)
    const handleOpenModal = () => {
        console.log("Đã bấm vào Avatar! Đang mở Modal...");
        setIsModalOpen(true);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File quá lớn! Vui lòng chọn ảnh dưới 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setSelectedAvatar(e.target.result);
        reader.readAsDataURL(file);
    };

    const saveAvatar = () => {
        if (!selectedAvatar) {
            setIsModalOpen(false);
            return;
        }
        localStorage.setItem('user_avatar_custom', selectedAvatar);
        setCustomImageBase64(selectedAvatar); 
        setIsModalOpen(false);
    };

    const displayAvatar = customImageBase64 || (user.equippedSkin !== 'default' ? user.equippedSkin : PRESET_AVATARS[0]);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
            <div className="bg-white dark:bg-[#1a2e20] rounded-3xl p-8 shadow-xl border border-[#e0e8e2] dark:border-[#2a3f31] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-9xl">fingerprint</span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    
                    {/* ĐÃ CHUYỂN DIV THÀNH BUTTON ĐỂ BẮT CLICK 100% */}
                    <button 
                        type="button"
                        onClick={handleOpenModal} 
                        className="relative group cursor-pointer z-50 hover:scale-105 transition-transform appearance-none bg-transparent border-none outline-none p-0 focus:ring-4 focus:ring-primary/30 rounded-full"
                        title="Bấm vào để thay đổi Avatar"
                    >
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                            <circle 
                                cx="50" cy="50" r="46" 
                                stroke="#25f46a" strokeWidth="6" fill="transparent" 
                                className="transition-all duration-1000 ease-out" 
                                strokeDasharray="289" 
                                strokeDashoffset={strokeDashoffset} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img src={displayAvatar} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a2e20] shadow-md object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-4 border-white dark:border-[#1a2e20] shadow-lg flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </div>
                    </button>

                    {/* Thông tin Text */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-800 dark:text-white">{user.username}</h1>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full border border-primary/20">
                                Level {level}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">MathQuest Elite Member</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-gray-50 dark:bg-[#233829] px-5 py-3 rounded-2xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-500 text-2xl">monetization_on</span>
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Tổng Xu</p>
                                    <p className="font-bold text-lg leading-none text-gray-800 dark:text-white">{user.coins || 0}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#233829] px-5 py-3 rounded-2xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-500 text-2xl">military_tech</span>
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Tổng EXP</p>
                                    <p className="font-bold text-lg leading-none text-gray-800 dark:text-white">{totalExp}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#233829] px-5 py-3 rounded-2xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-500 text-2xl">videogame_asset</span>
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Game Đã Chơi</p>
                                    <p className="font-bold text-lg leading-none text-gray-800 dark:text-white">{gamesPlayed}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold flex items-center gap-2 mt-4 text-gray-800 dark:text-white">
                <span className="material-symbols-outlined text-primary">emoji_events</span> Personal Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(scores).map(([gameSlug, score]) => (
                    <div key={gameSlug} className="bg-white dark:bg-[#1a2e20] p-6 rounded-2xl flex flex-col items-center text-center border border-[#e0e8e2] dark:border-[#2a3f31] shadow-sm">
                        <span className="material-symbols-outlined text-4xl text-primary mb-2">sports_esports</span>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase text-sm">{gameSlug}</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{score}</p>
                        <p className="text-xs text-gray-500 mt-1">điểm cao nhất</p>
                    </div>
                ))}
            </div>

            {/* MODAL CHỌN AVATAR */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1a2e20] w-full max-w-lg rounded-3xl shadow-2xl p-6 relative border border-gray-100 dark:border-gray-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                        <h2 className="text-2xl font-black text-center mb-2 text-gray-800 dark:text-white">Đổi Ảnh Đại Diện</h2>

                        <div className="flex flex-col gap-6 mt-6">
                            <div className="flex flex-col items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Upload Ảnh Của Bạn</span>
                                <div className="relative group cursor-pointer w-24 h-24">
                                    <img src={selectedAvatar || "https://via.placeholder.com/150?text=..."} alt="Preview" className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-600 shadow-inner group-hover:border-primary transition-colors" />
                                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="material-symbols-outlined text-white text-2xl">cloud_upload</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block text-center">Hoặc chọn mẫu có sẵn</span>
                                <div className="grid grid-cols-5 gap-3 justify-items-center max-h-[200px] overflow-y-auto p-2">
                                    {PRESET_AVATARS.map((url, index) => (
                                        <button 
                                            key={index} 
                                            type="button"
                                            onClick={() => setSelectedAvatar(url)}
                                            className={`w-14 h-14 rounded-full border-2 cursor-pointer transition-all overflow-hidden bg-gray-100 p-1 appearance-none outline-none ${selectedAvatar === url ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-primary'}`}
                                        >
                                            <img src={url} alt="Preset" className="w-full h-full object-cover rounded-full pointer-events-none" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Hủy</button>
                            <button onClick={saveAvatar} className="px-6 py-2 rounded-xl font-bold bg-primary text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition">Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;