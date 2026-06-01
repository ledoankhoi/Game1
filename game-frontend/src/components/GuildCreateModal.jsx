import React, { useState } from 'react';
import useGuildStore from '../store/useGuildStore';

function GuildCreateModal({ onClose }) {
  const createGuild = useGuildStore((s) => s.createGuild);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !tag.trim()) {
      setError('Vui lòng nhập tên và tag');
      return;
    }
    setLoading(true);
    setError('');
    const result = await createGuild({ name: name.trim(), tag: tag.trim(), description: description.trim() });
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Lỗi tạo guild');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a2e20] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tạo Guild mới</h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên Guild</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Nhập tên guild..."
              className="w-full bg-gray-50 dark:bg-[#0f1a14] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tag (2-5 ký tự)</label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="VD: VIP"
              className="w-full bg-gray-50 dark:bg-[#0f1a14] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary text-gray-800 dark:text-white uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Mô tả guild..."
              className="w-full bg-gray-50 dark:bg-[#0f1a14] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary text-gray-800 dark:text-white resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-500 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Đang tạo...' : 'Tạo Guild'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuildCreateModal;
