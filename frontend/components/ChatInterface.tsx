'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { Upload, Copy, ThumbsUp, ThumbsDown, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  hasAttachment?: boolean;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

interface ChatInterfaceProps {
  chatId: string | null;
  onMessageSent?: () => void;
}

export default function ChatInterface({ chatId, onMessageSent }: ChatInterfaceProps) {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadMessages = async () => {
    if (!chatId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.chat.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, TXT, and DOCX files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
      toast.success('File selected successfully');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId || sendingMessage) return;

    const userMessage = input.trim();
    const fileToSend = selectedFile;
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSendingMessage(true);

    const tempUserMessage: Message = {
      id: 'temp-user',
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
      hasAttachment: !!fileToSend,
      fileName: fileToSend?.name,
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      let response;

      if (fileToSend) {
        // Send message with file attachment
        const formData = new FormData();
        formData.append('content', userMessage);
        formData.append('file', fileToSend);

        response = await axios.post(
          `/api/chats/${chatId}/messages`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Send regular text message
        response = await axios.post(
          `/api/chats/${chatId}/messages`,
          { content: userMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'temp-user'),
        response.data.userMessage,
        response.data.assistantMessage,
      ]);

      // Notify parent to refresh chat list (for title updates)
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== 'temp-user'));
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      toast.success('Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast.error('Failed to copy message');
    }
  };

  const handleLike = (messageId: string) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === 'like' ? null : 'like',
    }));
  };

  const handleDislike = (messageId: string) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === 'dislike' ? null : 'dislike',
    }));
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Welcome to Study Buddy
          </h2>
          <p className="text-gray-500">
            Select a chat from history or start a new conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-white border-b px-4 md:px-6 py-4 flex-shrink-0">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[90%] md:max-w-3xl rounded-2xl px-4 md:px-6 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.hasAttachment && message.fileName && (
                  <div className={`mb-2 pb-2 border-b ${
                    message.role === 'user' ? 'border-blue-400' : 'border-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 text-sm">
                      <span>📎</span>
                      <span className="font-semibold">{message.fileName}</span>
                      {message.fileSize && (
                        <span className="opacity-75">({formatFileSize(message.fileSize)})</span>
                      )}
                    </div>
                    {message.fileUrl && (
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs underline mt-1 inline-block ${
                          message.role === 'user' ? 'text-blue-100' : 'text-blue-600'
                        }`}
                      >
                        View file
                      </a>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                    >
                      <Copy className={`w-4 h-4 ${copiedMessageId === message.id ? 'text-green-600' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => handleLike(message.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Like"
                    >
                      <ThumbsUp className={`w-4 h-4 ${messageFeedback[message.id] === 'like' ? 'text-blue-600 fill-blue-600' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => handleDislike(message.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Dislike"
                    >
                      <ThumbsDown className={`w-4 h-4 ${messageFeedback[message.id] === 'dislike' ? 'text-red-600 fill-red-600' : 'text-gray-600'}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {sendingMessage && (
          <div className="flex justify-start">
            <div className="max-w-3xl rounded-2xl px-6 py-3 bg-gray-100 text-gray-900">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-3 md:p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full">
          {selectedFile && (
            <div className="mb-2 md:mb-3 flex items-center gap-2 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-xl md:text-2xl">📎</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-700 text-xl font-bold flex-shrink-0"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sendingMessage}
              className="px-3 md:px-4 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xl"
              title="Attach file (PDF, TXT, DOCX)"
            >
             <Upload className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={sendingMessage}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sendingMessage}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
             <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
