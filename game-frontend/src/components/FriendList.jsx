import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useFriendStore from '../store/useFriendStore';
import useNotificationStore from '../store/useNotificationStore';

function FriendList({ onSelectChat }) {
  const friends = useFriendStore((s) => s.friends);
  const requests = useFriendStore((s) => s.requests);
  const isOnline = useFriendStore((s) => s.isOnline);
  const fetchFriends = useFriendStore((s) => s.fetchFriends);
  const fetchRequests = useFriendStore((s) => s.fetchRequests);
  const sendRequest = useFriendStore((s) => s.sendRequest);
  const acceptRequest = useFriendStore((s) => s.acceptRequest);
  const rejectRequest = useFriendStore((s) => s.rejectRequest);
  const removeFriend = useFriendStore((s) => s.removeFriend);
  const unreadCounts = useNotificationStore((s) => s.unreadCounts);

  const [showAdd, setShowAdd] = useState(false);
  const [username, setUsername] = useState('');
  const [addMsg, setAddMsg] = useState('');

  React.useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  const handleSendRequest = async () => {
    if (!username.trim()) return;
    const result = await sendRequest(username.trim());
    setAddMsg(result.success ? 'Đã gửi lời mời!' : result.error || 'Lỗi');
    if (result.success) setUsername('');
    setTimeout(() => setAddMsg(''), 3000);
  };

  const onlineCount = friends.filter(f => isOnline(f._id)).length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a2e20] rounded-l-2xl">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white">Bạn bè</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-green-500 transition-colors"
          >
            + Thêm bạn
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />
          {onlineCount} online / {friends.length} bạn
        </p>
      </div>

      {showAdd && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#0f1a14] border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
              placeholder="Nhập username..."
              className="flex-1 bg-white dark:bg-[#1a2e20] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary text-gray-800 dark:text-white"
            />
            <button
              onClick={handleSendRequest}
              className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-green-500"
            >
              Gửi
            </button>
          </div>
          {addMsg && <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{addMsg}</p>}
        </div>
      )}

      {requests.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Lời mời kết bạn ({requests.length})
          </h3>
          {requests.map((req) => (
            <div key={req._id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {req.requester.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-800 dark:text-white">{req.requester.username}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => acceptRequest(req._id)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Đồng ý
                </button>
                <button
                  onClick={() => rejectRequest(req._id)}
                  className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {friends.length === 0 ? (
          <div className="p-6 text-center text-gray-400 dark:text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">people</span>
            <p className="text-sm">Chưa có bạn bè</p>
            <p className="text-xs mt-1">Thêm bạn để bắt đầu trò chuyện!</p>
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend._id}
              onClick={() => onSelectChat(friend)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#0f1a14] cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {friend.username?.[0]?.toUpperCase()}
                </div>
                {isOnline(friend._id) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#1a2e20] rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${friend.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-sm text-gray-800 dark:text-white hover:text-primary truncate block"
                  >
                    {friend.username}
                  </Link>
                  {unreadCounts[friend._id] > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full leading-none shrink-0">
                      {unreadCounts[friend._id] > 99 ? '99+' : unreadCounts[friend._id]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Level {friend.level} {isOnline(friend._id) ? '• Online' : ''}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Xóa bạn này?')) removeFriend(friend._id);
                }}
                className="text-gray-400 hover:text-red-500 text-xs"
                title="Xóa bạn"
              >
                <span className="material-symbols-outlined text-lg">person_remove</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FriendList;
