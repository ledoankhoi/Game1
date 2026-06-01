import { useState } from 'react';
import { api } from '../../services/api';

function TabSettings({ profileData, setProfileData }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('global_sound') !== 'false');
  const [saving, setSaving] = useState(false);

  const updateSetting = async (key, value) => {
    setSaving(true);
    try {
      await api.post('/auth/update-settings', { [key]: value });
      if (profileData) {
        const updated = {
          ...profileData,
          settings: { ...profileData.settings, [key]: value }
        };
        setProfileData(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Lỗi lưu cài đặt:', err);
    }
    setSaving(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateSetting('theme', newTheme);
  };

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('global_sound', newVal);
    window.dispatchEvent(new CustomEvent('settingsChange', {
      detail: { type: 'sound', value: newVal }
    }));
    updateSetting('soundEnabled', newVal);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">settings</span>
        Cài Đặt
      </h2>

      <div className="bg-white dark:bg-[#1a2e20] rounded-2xl p-6 border border-gray-100 dark:border-[#2a3f31] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-yellow-500">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">Giao Diện</p>
              <p className="text-sm text-gray-500">{theme === 'dark' ? 'Tối' : 'Sáng'}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            disabled={saving}
            className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${theme === 'dark' ? 'translate-x-7' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2e20] rounded-2xl p-6 border border-gray-100 dark:border-[#2a3f31] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-blue-500">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">Âm Thanh</p>
              <p className="text-sm text-gray-500">{soundEnabled ? 'Bật' : 'Tắt'}</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            disabled={saving}
            className={`relative w-14 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${soundEnabled ? 'translate-x-7' : ''}`} />
          </button>
        </div>
      </div>

      {saving && (
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-base animate-spin">sync</span>
          Đang lưu...
        </p>
      )}
    </div>
  );
}

export default TabSettings;
