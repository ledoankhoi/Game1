import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { api, endpoints } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useFriendStore from '../store/useFriendStore';
import AvatarDisplay from '../components/AvatarDisplay';

function PublicProfile() {
  const { username } = useParams();
  const user = useAuthStore((s) => s.user);
  const sendRequest = useFriendStore((s) => s.sendRequest);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendMsg, setFriendMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(endpoints.publicProfile(username));
        if (data.success) {
          setProfile(data.profile);
        } else {
          setError('Không tìm thấy người dùng');
        }
      } catch (_e) {
        setError('Không tìm thấy người dùng');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  useGSAP(() => {
    gsap.fromTo('.profile-page', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }, [profile]);

  const handleAddFriend = async () => {
    const result = await sendRequest(profile.username);
    setFriendMsg(result.success ? 'Đã gửi lời mời!' : result.error || 'Lỗi');
    setTimeout(() => setFriendMsg(''), 3000);
  };

  const isOwnProfile = user?.username === username;

  if (loading) {
    return <div className="text-center py-20 text-xl font-bold text-gray-500">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">person_off</span>
        <p className="text-xl text-gray-500">{error}</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto profile-page">
      <div className="bg-white dark:bg-[#1a2e20] rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <AvatarDisplay user={profile} size="xl" />

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {profile.username}
              {profile.guild && (
                <span className="ml-2 text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-lg">
                  [{profile.guild.tag}]
                </span>
              )}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-sm">
              <div className="bg-gray-50 dark:bg-[#0f1a14] px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary">{profile.level}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#0f1a14] px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-yellow-500">{profile.coins?.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Coin</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#0f1a14] px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-500">{profile.totalScore?.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Điểm</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#0f1a14] px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-500">{profile.friendCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bạn bè</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="material-symbols-outlined text-lg">star</span>
                <span>EXP: {profile.exp?.toLocaleString()}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-primary to-green-400 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min((profile.exp % 1000) / 10, 100)}%` }}
                />
              </div>
            </div>

            {!isOwnProfile && (
              <div className="mt-6">
                <button
                  onClick={handleAddFriend}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Kết bạn
                </button>
                {friendMsg && (
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{friendMsg}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {profile.unlockedAchievements?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">emoji_events</span>
              Thành tựu ({profile.unlockedAchievements.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.unlockedAchievements.map((ach, i) => (
                <span key={i} className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800">
                  {ach}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.favoriteGames?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">favorite</span>
              Game yêu thích
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteGames.map((game, i) => (
                <span key={i} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Tham gia từ {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
