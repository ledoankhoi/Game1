import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import useGuildStore from '../store/useGuildStore';
import useNotificationStore from '../store/useNotificationStore';

function ChatWindow({ activeChat, mode = 'friend', guildId }) {
  const user = useAuthStore((s) => s.user);
  const messages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendTyping = useChatStore((s) => s.sendTyping);
  const sendLobbyMessage = useChatStore((s) => s.sendLobbyMessage);
  const setRead = useNotificationStore((s) => s.setRead);
  const guildMessages = useGuildStore((s) => s.guildMessages);
  const sendGuildMessage = useGuildStore((s) => s.sendGuildMessage);
  const fetchGuildMessages = useGuildStore((s) => s.fetchGuildMessages);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const getMessages = () => {
    if (mode === 'guild') return guildMessages;
    if (mode === 'lobby') return messages['lobby'] || [];
    const key = activeChat?._id;
    return key ? messages[key] || [] : [];
  };

  useEffect(() => {
    if (mode === 'friend' && activeChat) {
      fetchMessages(activeChat._id);
      setRead(activeChat._id);
    }
    if (mode === 'guild' && guildId) {
      fetchGuildMessages(guildId);
      setRead(`guild:${guildId}`);
    }
  }, [activeChat, guildId, mode, fetchMessages, fetchGuildMessages, setRead]);

  const currentMessages = getMessages();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (mode === 'guild' && guildId) {
      sendGuildMessage(guildId, input.trim());
    } else if (mode === 'lobby') {
      sendLobbyMessage(input.trim());
    } else if (activeChat) {
      sendMessage(activeChat._id, input.trim());
    }
    setInput('');
  };

  const handleTyping = () => {
    if (mode === 'friend' && activeChat) {
      sendTyping(activeChat._id);
    }
  };

  const typingEntries = Object.entries(typingUsers);

  if (!activeChat && mode === 'friend') {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4">chat</span>
          <p className="text-lg">Chọn bạn để trò chuyện</p>
        </div>
      </div>
    );
  }

  const headerTitle = mode === 'guild' ? (activeChat?.name || 'Guild Chat') :
    mode === 'lobby' ? 'Lobby Chat' :
    (activeChat?.username || 'Chat');

  return (
    <div className="flex flex-col h-full bg-[#f9fafb] dark:bg-[#0f1a14]">
      <div className="bg-white dark:bg-[#1a2e20] px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        {mode === 'friend' && activeChat && (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {activeChat.username?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="font-semibold text-gray-800 dark:text-white">{headerTitle}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentMessages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">
            <p className="text-sm">Chưa có tin nhắn</p>
          </div>
        )}
        {currentMessages.map((msg, i) => {
          const myId = user?.id || user?._id;
          const isMine = msg.sender?._id === myId || msg.sender === myId;
          return (
            <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                isMine
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
              }`}>
                {!isMine && (
                  <p className="text-xs font-semibold text-primary mb-1">
                    {msg.sender?.username || 'Unknown'}
                  </p>
                )}
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-green-200' : 'text-gray-400 dark:text-gray-500'}`}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          );
        })}
        {typingEntries.map(([userId, username]) => (
          <div key={userId} className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 text-gray-500 text-xs italic p-3 rounded-2xl rounded-tl-none shadow-sm">
              {username} đang nhập...
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#1a2e20] border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
            else handleTyping();
          }}
          placeholder={
            mode === 'guild' ? 'Nhắn tin trong guild...' :
            mode === 'lobby' ? 'Nhắn tin lobby...' :
            'Nhập tin nhắn...'
          }
          className="flex-1 bg-[#f0f5f1] dark:bg-[#0f1a14] border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-[#1a2e20] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-primary hover:bg-green-500 disabled:bg-gray-400 text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
