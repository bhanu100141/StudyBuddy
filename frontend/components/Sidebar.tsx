'use client';

import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

interface SidebarProps {
  currentChatId?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
  isCollapsed?: boolean;
}

export interface SidebarRef {
  refreshChats: () => void;
}

const Sidebar = forwardRef<SidebarRef, SidebarProps>(({ currentChatId, onChatSelect, onNewChat, onClose, isCollapsed }, ref) => {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await axios.get('/api/chats/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refreshChats: loadChats,
  }));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleEditChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      toast.error('Chat title cannot be empty');
      return;
    }

    try {
      await axios.patch(
        `/api/chats/${chatId}`,
        { title: editTitle.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats(chats.map(c =>
        c.id === chatId ? { ...c, title: editTitle.trim() } : c
      ));
      setEditingChatId(null);
      setEditTitle('');
      toast.success('Chat title updated successfully');
    } catch (error) {
      console.error('Failed to update chat:', error);
      toast.error('Failed to update chat title');
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await axios.delete(`/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(chats.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        onNewChat();
      }
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  return (
    <div className={`bg-gray-900 text-white flex flex-col h-screen transition-all duration-300 ${
      isCollapsed ? 'md:w-0 md:overflow-hidden' : 'w-64 md:w-64 lg:w-72'
    }`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-start min-w-[256px]">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Study Buddy</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded mt-1 inline-block">
            {user?.role}
          </span>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Chat History
        </h2>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="text-gray-400 text-sm">No chats yet</div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => editingChatId !== chat.id && onChatSelect(chat.id)}
                className={`p-3 rounded-lg transition group relative ${
                  editingChatId === chat.id
                    ? 'bg-gray-800'
                    : currentChatId === chat.id
                    ? 'bg-blue-600 cursor-pointer'
                    : 'hover:bg-gray-800 cursor-pointer'
                }`}
              >
                {editingChatId === chat.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(chat.id, e as any);
                        if (e.key === 'Escape') handleCancelEdit(e as any);
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleSaveEdit(chat.id, e)}
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-xs rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {chat._count.messages} messages
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleEditChat(chat, e)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Edit chat title"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={() => router.push('/dashboard/materials')}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
        >
          📁 My Materials
        </button>
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
        >
          📚 Courses
        </button>
        <button
          onClick={() => router.push('/dashboard/schedule')}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
        >
          📅 Schedule
        </button>
        <button
          onClick={() => router.push('/dashboard/focus')}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
        >
          🎯 Focus Mode
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
