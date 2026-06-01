import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import useGuildStore from '../store/useGuildStore';
import GuildCreateModal from '../components/GuildCreateModal';
import GuildMemberList from '../components/GuildMemberList';
import ChatWindow from '../components/ChatWindow';

function Guild() {
  const myGuild = useGuildStore((s) => s.myGuild);
  const loading = useGuildStore((s) => s.loading);
  const leaderboard = useGuildStore((s) => s.leaderboard);
  const fetchMyGuild = useGuildStore((s) => s.fetchMyGuild);
  const fetchLeaderboard = useGuildStore((s) => s.fetchLeaderboard);
  const joinGuild = useGuildStore((s) => s.joinGuild);
  const leaveGuild = useGuildStore((s) => s.leaveGuild);
  const initGuildSocket = useGuildStore((s) => s.initSocket);

  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const [joinId, setJoinId] = useState('');

  useEffect(() => {
    fetchMyGuild();
    fetchLeaderboard();
    initGuildSocket();
  }, [fetchMyGuild, fetchLeaderboard, initGuildSocket]);

  useGSAP(() => {
    gsap.fromTo('.guild-page', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  }, []);

  const handleLeave = async () => {
    if (!confirm('Rời guild?')) return;
    await leaveGuild(myGuild._id);
  };

  const handleJoinById = async () => {
    if (!joinId.trim()) return;
    await joinGuild(joinId.trim());
    setJoinId('');
  };

  if (loading) {
    return <div className="text-center py-20 text-xl font-bold text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto guild-page">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">military_tech</span>
        Guild
      </h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          Guild của tôi
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          Bảng xếp hạng
        </button>
      </div>

      {activeTab === 'my' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!myGuild ? (
            <div className="lg:col-span-2 bg-white dark:bg-[#1a2e20] rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">military_tech</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Chưa tham gia Guild</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Tạo guild mới hoặc tham gia guild bằng ID</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500 transition-colors"
                >
                  Tạo Guild
                </button>
                <div className="flex gap-2">
                  <input
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Nhập Guild ID..."
                    className="bg-gray-50 dark:bg-[#0f1a14] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary text-gray-800 dark:text-white w-40"
                  />
                  <button
                    onClick={handleJoinById}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Tham gia
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#1a2e20] rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {myGuild.tag}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{myGuild.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level {myGuild.level} • {myGuild.members?.length || 0} thành viên
                    </p>
                  </div>
                </div>
                {myGuild.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{myGuild.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-[#0f1a14] px-4 py-2 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">EXP</p>
                    <p className="font-bold text-gray-800 dark:text-white">{myGuild.exp.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={handleLeave}
                    className="ml-auto bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Rời Guild
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2e20] rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Thành viên</h3>
                <GuildMemberList guild={myGuild} />
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-[#1a2e20] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: '400px' }}>
                <ChatWindow
                  activeChat={{ name: myGuild.name, _id: myGuild._id }}
                  mode="guild"
                  guildId={myGuild._id}
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-[#1a2e20] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
              <p className="text-sm">Chưa có guild nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {leaderboard.map((g, i) => (
                <div key={g._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#0f1a14] transition-colors">
                  <span className={`w-8 text-center font-bold ${
                    i === 0 ? 'text-yellow-500 text-lg' :
                    i === 1 ? 'text-gray-400 text-lg' :
                    i === 2 ? 'text-orange-500 text-lg' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-lg font-bold text-white shadow">
                    {g.tag}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">{g.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Level {g.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-white">{g.exp.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">EXP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && <GuildCreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

export default Guild;
