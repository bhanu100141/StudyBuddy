'use client';

import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import { useThemeStore } from '@/frontend/store/themeStore';
import axios from 'axios';
import {
  Pencil,
  Trash2,
  Plus,
  FolderOpen,
  BookOpen,
  Calendar,
  Target,
  LogOut,
  MessageSquare,
  Sparkles,
  User,
  Search,
  X,
  ChevronDown,
  Settings,
  Moon,
  Sun,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

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

const Sidebar = forwardRef<SidebarRef, SidebarProps>(
  ({ currentChatId, onChatSelect, onNewChat, onClose, isCollapsed }, ref) => {
    const router = useRouter();
    const { user, token, logout } = useAuthStore();
    const { resolvedTheme, setTheme } = useThemeStore();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRecent, setShowRecent] = useState(true);

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
        setChats(
          chats.map((c) => (c.id === chatId ? { ...c, title: editTitle.trim() } : c))
        );
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
        setChats(chats.filter((c) => c.id !== chatId));
        if (currentChatId === chatId) {
          onNewChat();
        }
        toast.success('Chat deleted successfully');
      } catch (error) {
        console.error('Failed to delete chat:', error);
        toast.error('Failed to delete chat');
      }
    };

    // Filter chats based on search query
    const filteredChats = chats.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const recentChats = filteredChats.slice(0, 5);
    const olderChats = filteredChats.slice(5);

    const getUserInitials = (name: string | undefined) => {
      if (!name) return 'U';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <TooltipProvider>
        <div
          className={cn(
            'relative flex flex-col h-screen transition-all duration-300 border-r',
            'dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white dark:border-white/5',
            'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 border-gray-200',
            isCollapsed ? 'md:w-0 md:overflow-hidden' : 'w-64 md:w-64 lg:w-72'
          )}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none dark:opacity-100 opacity-30" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Premium Header with User Profile */}
            <div className="p-4 border-b dark:border-white/10 border-gray-200 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-12 w-12 rounded-xl p-0 hover:scale-105 transition-transform"
                      >
                        <Avatar className="h-12 w-12 rounded-xl border-2 dark:border-white/20 border-gray-300">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white font-bold">
                            {getUserInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 dark:border-slate-900 border-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 dark:bg-slate-900 dark:border-slate-700 bg-white border-gray-200" align="start">
                      <DropdownMenuLabel className="dark:bg-slate-900 bg-white">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium dark:text-white text-gray-900">{user?.name}</p>
                          <p className="text-xs dark:text-gray-400 text-gray-500">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="dark:bg-slate-700 bg-gray-200" />
                      <DropdownMenuItem
                        onClick={() => router.push('/dashboard/profile')}
                        className="dark:text-gray-200 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 dark:focus:bg-slate-800 focus:bg-gray-100 dark:focus:text-white focus:text-gray-900"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/dashboard/settings')}
                        className="dark:text-gray-200 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 dark:focus:bg-slate-800 focus:bg-gray-100 dark:focus:text-white focus:text-gray-900"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="dark:text-gray-200 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 dark:focus:bg-slate-800 focus:bg-gray-100 dark:focus:text-white focus:text-gray-900"
                      >
                        {resolvedTheme === 'dark' ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Moon className="mr-2 h-4 w-4" />
                        )}
                        {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="dark:bg-slate-700 bg-gray-200" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 dark:hover:text-red-400 hover:text-red-600 dark:focus:bg-red-500/10 focus:bg-red-50 dark:focus:text-red-400 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Study Buddy
                      </h1>
                      <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs dark:text-gray-400 text-gray-600 truncate mt-0.5">{user?.name}</p>
                  </div>
                </div>

                {/* Close button for mobile */}
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="md:hidden h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* User role badge with stats */}
              <div className="flex items-center justify-between">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg shadow-blue-500/30">
                  {user?.role}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs dark:text-gray-400 text-gray-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>{chats.length} chats</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total conversations</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* New Chat Button */}
            <div className="p-4 space-y-3">
              <Button
                onClick={onNewChat}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all group"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                New Chat
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 dark:text-gray-400 text-gray-500" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 dark:bg-white/5 bg-gray-100 dark:border-white/10 border-gray-300 dark:focus:border-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-500/20 focus:ring-blue-500/20 dark:placeholder:text-gray-500 placeholder:text-gray-400 dark:text-white text-gray-900"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {/* Recent Chats Section */}
                {recentChats.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowRecent(!showRecent)}
                      className="flex items-center gap-2 w-full mb-3 text-xs font-bold dark:text-gray-400 text-gray-600 uppercase tracking-wider dark:hover:text-gray-300 hover:text-gray-800 transition-colors group"
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          !showRecent && '-rotate-90'
                        )}
                      />
                      <MessageSquare className="w-3.5 h-3.5" />
                      Recent
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {recentChats.length}
                      </Badge>
                    </button>

                    {showRecent && (
                      <div className="space-y-2">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          </div>
                        ) : (
                          recentChats.map((chat) => (
                            <ChatItem
                              key={chat.id}
                              chat={chat}
                              isActive={currentChatId === chat.id}
                              isEditing={editingChatId === chat.id}
                              editTitle={editTitle}
                              onSelect={() =>
                                editingChatId !== chat.id && onChatSelect(chat.id)
                              }
                              onEdit={(e) => handleEditChat(chat, e)}
                              onDelete={(e) => handleDeleteChat(chat.id, e)}
                              onSave={(e) => handleSaveEdit(chat.id, e)}
                              onCancel={handleCancelEdit}
                              onEditTitleChange={setEditTitle}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Older Chats Section */}
                {olderChats.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold dark:text-gray-400 text-gray-600 uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Older
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {olderChats.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {olderChats.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={currentChatId === chat.id}
                          isEditing={editingChatId === chat.id}
                          editTitle={editTitle}
                          onSelect={() =>
                            editingChatId !== chat.id && onChatSelect(chat.id)
                          }
                          onEdit={(e) => handleEditChat(chat, e)}
                          onDelete={(e) => handleDeleteChat(chat.id, e)}
                          onSave={(e) => handleSaveEdit(chat.id, e)}
                          onCancel={handleCancelEdit}
                          onEditTitleChange={setEditTitle}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!loading && filteredChats.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-8 h-8 dark:text-gray-500 text-gray-400" />
                    </div>
                    <p className="text-sm dark:text-gray-400 text-gray-600">
                      {searchQuery ? 'No chats found' : 'No chats yet'}
                    </p>
                    <p className="text-xs dark:text-gray-500 text-gray-500 mt-1">
                      {searchQuery
                        ? 'Try a different search term'
                        : 'Start a conversation to begin'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Premium Navigation Footer */}
            <div className="p-4 border-t dark:border-white/10 border-gray-200 backdrop-blur-xl space-y-2">
              <NavButton
                icon={TrendingUp}
                label="Assignments & Doubts"
                onClick={() => router.push('/student-portal')}
                color="orange"
              />
              <NavButton
                icon={FolderOpen}
                label="My Materials"
                onClick={() => router.push('/dashboard/materials')}
                color="blue"
              />
              <NavButton
                icon={BookOpen}
                label="Courses"
                onClick={() => router.push('/dashboard/courses')}
                color="purple"
              />
              <NavButton
                icon={Calendar}
                label="Schedule"
                onClick={() => router.push('/dashboard/schedule')}
                color="green"
              />
              <NavButton
                icon={Target}
                label="Focus Mode"
                onClick={() => router.push('/dashboard/focus')}
                color="pink"
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }
);

// Chat Item Component
interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  onEditTitleChange: (value: string) => void;
}

const ChatItem = ({
  chat,
  isActive,
  isEditing,
  editTitle,
  onSelect,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditTitleChange,
}: ChatItemProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative p-3 rounded-xl transition-all duration-200 border cursor-pointer',
        isEditing && 'dark:bg-white/5 bg-gray-100 backdrop-blur-xl dark:border-white/10 border-gray-300',
        isActive &&
          !isEditing &&
          'bg-gradient-to-r from-blue-600/90 to-purple-600/90 shadow-lg shadow-blue-500/20 scale-[1.02] border-blue-400/30 text-white',
        !isActive &&
          !isEditing &&
          'dark:hover:bg-white/5 hover:bg-gray-100 hover:backdrop-blur-xl dark:border-white/5 border-transparent dark:hover:border-white/10 hover:border-gray-300 hover:scale-[1.01]'
      )}
    >
      {isEditing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="dark:bg-white/10 bg-gray-50 dark:border-white/20 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:focus:ring-blue-500/20 focus:ring-blue-500/20 dark:text-white text-gray-900"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave(e as any);
              if (e.key === 'Escape') onCancel(e as any);
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              size="sm"
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <p className={cn("font-medium truncate text-sm", isActive ? "text-white" : "dark:text-white text-gray-900")}>{chat.title}</p>
            <p className={cn("text-xs mt-1 flex items-center gap-1", isActive ? "text-white/80" : "dark:text-gray-400 text-gray-600")}>
              <MessageSquare className="w-3 h-3" />
              {chat._count.messages} messages
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-7 w-7 dark:hover:bg-blue-500/20 hover:bg-blue-100 text-blue-400 dark:hover:text-blue-300 hover:text-blue-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-7 w-7 dark:hover:bg-red-500/20 hover:bg-red-100 text-red-400 dark:hover:text-red-300 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete chat</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

// Navigation Button Component
interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'green' | 'pink' | 'orange';
}

const NavButton = ({ icon: Icon, label, onClick, color }: NavButtonProps) => {
  const colorClasses = {
    blue: 'text-blue-400 group-hover:text-blue-300',
    purple: 'text-purple-400 group-hover:text-purple-300',
    green: 'text-green-400 group-hover:text-green-300',
    pink: 'text-pink-400 group-hover:text-pink-300',
    orange: 'text-orange-400 group-hover:text-orange-300',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant="ghost"
          className="group w-full justify-start dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 border dark:border-white/5 border-transparent dark:hover:border-white/20 hover:border-gray-300 hover:scale-[1.02] transition-all"
          size="sm"
        >
          <Icon
            className={cn(
              'w-4 h-4 mr-2 group-hover:scale-110 transition-transform',
              colorClasses[color]
            )}
          />
          <span className="font-medium text-sm dark:text-white text-gray-900">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};






Sidebar.displayName = 'Sidebar';

export default Sidebar;
