'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import Sidebar, { SidebarRef } from '@/frontend/components/Sidebar';
import ChatInterface from '@/frontend/components/ChatInterface';
import axios from 'axios';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuthStore();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false); // For desktop/tablet
  const sidebarRef = useRef<SidebarRef>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access the dashboard');
      router.replace('/login');
      return;
    }

    // Redirect teachers to their dashboard
    if (user?.role === 'TEACHER') {
      router.replace('/teacher-dashboard');
      return;
    }
  }, [isAuthenticated, token, user, router]);

  const handleNewChat = async () => {
    try {
      const response = await axios.post(
        '/api/chats/create',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentChatId(response.data.chat.id);
      // Refresh sidebar to show new chat
      sidebarRef.current?.refreshChats();
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleMessageSent = () => {
    // Refresh sidebar to show updated chat titles
    sidebarRef.current?.refreshChats();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  const handleChatSelectWithClose = (chatId: string) => {
    handleChatSelect(chatId);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  if (!isAuthenticated || !token || !user) {
    return null;
  }

  // Additional role check - only students can access this dashboard
  if (user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden relative dark:bg-slate-950 bg-white">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 dark:bg-black/50 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isDesktopCollapsed ? 'md:w-0' : 'md:w-auto'}`}
      >
        <Sidebar
          ref={sidebarRef}
          currentChatId={currentChatId || undefined}
          onChatSelect={handleChatSelectWithClose}
          onNewChat={handleNewChat}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isDesktopCollapsed}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile header with hamburger */}
        <div className="md:hidden dark:bg-slate-900 bg-gray-100 dark:text-white text-gray-900 p-4 flex items-center justify-between border-b dark:border-slate-800 border-gray-200">
          <button
            onClick={toggleSidebar}
            className="p-2 dark:hover:bg-slate-800 hover:bg-gray-200 rounded-lg transition"
            aria-label="Toggle sidebar"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Study Buddy</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Desktop collapse/expand button */}
        <button
          onClick={toggleDesktopCollapse}
          className={`hidden md:flex fixed top-1/2 z-40 dark:bg-slate-800 bg-gray-200 dark:text-white text-gray-900 p-2 rounded-r-lg shadow-lg dark:hover:bg-slate-700 hover:bg-gray-300 transition-all duration-300 items-center justify-center ${
            isDesktopCollapsed ? 'left-0' : 'left-64 lg:left-72'
          }`}
          style={{
            transform: 'translateY(-50%)',
          }}
          title={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isDesktopCollapsed ? 'rotate-0' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Chat interface */}
        <ChatInterface
          chatId={currentChatId}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
}
