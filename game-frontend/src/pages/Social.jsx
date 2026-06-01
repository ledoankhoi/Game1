import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import FriendList from '../components/FriendList';
import ChatWindow from '../components/ChatWindow';
import useFriendStore from '../store/useFriendStore';
import useChatStore from '../store/useChatStore';

function Social() {
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const initFriendSocket = useFriendStore((s) => s.initSocket);
  const initChatSocket = useChatStore((s) => s.initSocket);

  useEffect(() => {
    initFriendSocket();
    initChatSocket();
  }, [initFriendSocket, initChatSocket]);

  useGSAP(() => {
    gsap.fromTo('.social-panel', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">forum</span>
        Social
      </h1>

      <div className="flex-1 flex rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2e20]">
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 social-panel">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Bạn bè
            </button>
            <button
              onClick={() => setActiveTab('lobby')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'lobby'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Lobby
            </button>
          </div>
          {activeTab === 'friends' && (
            <FriendList onSelectChat={(friend) => setActiveChat(friend)} />
          )}
          {activeTab === 'lobby' && (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 social-panel">
              <span className="material-symbols-outlined text-4xl mb-2">groups</span>
              <p className="text-sm">Chat toàn bộ người chơi</p>
              <p className="text-xs mt-1">Tham gia lobby để trò chuyện!</p>
            </div>
          )}
        </div>
        <div className="flex-1 social-panel">
          {activeTab === 'friends' ? (
            <ChatWindow activeChat={activeChat} mode="friend" />
          ) : (
            <ChatWindow activeChat={null} mode="lobby" />
          )}
        </div>
      </div>
    </div>
  );
}

export default Social;
