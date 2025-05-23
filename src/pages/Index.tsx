// Updated index.tsx with server-side chat history fetch

import React, { useState, useEffect } from 'react';
import { Chat, Message } from '@/types/chat';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import AuthPage from '@/components/AuthPage';
import UserMenu from '@/components/UserMenu';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/api/sessions/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await res.json();
        setChats(data);
        if (data.length > 0) {
          setCurrentChatId(data[0].id);
        } else {
          await createNewChat();  // 👈 Create one if none
        }
        if (isMobile) setIsSidebarCollapsed(true);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load chats', variant: 'destructive' });
      }
    };
  
    if (isAuthenticated) fetchChats();
  }, [isAuthenticated]);
  

  const getCurrentChat = () => chats.find(chat => chat.id === currentChatId) || null;

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/sessions/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });
  
      if (!res.ok) throw new Error('Failed to create session');
  
      const newSession = await res.json();
  
      const newChat: Chat = {
        id: newSession.id,
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
      };
  
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newSession.id);
      if (isMobile) setIsSidebarCollapsed(true);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive',
      });
    }
  };
  

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (isMobile) setIsSidebarCollapsed(true);
  };

  const handleSendMessage = async (content: string) => {
    if (isWaitingForResponse) return;
  
    const token = localStorage.getItem('token');
    setIsWaitingForResponse(true);
  
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ message: content, session_id: currentChatId }),
      });
  
      if (!response.ok) throw new Error('AI response failed');
  
      const data = await response.json();
  
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.response,
        role: 'assistant',
        timestamp: Date.now(),
      };
  
      const sessionId = data.session_id;
  
      // Ensure currentChatId is synced with server response
      if (currentChatId !== sessionId) {
        setCurrentChatId(sessionId);
      }
  
      // Update chats with both messages
      setChats(prev => {
        const chatExists = prev.some(chat => chat.id === sessionId);
  
        if (chatExists) {
          return prev.map(chat =>
            chat.id === sessionId
              ? {
                  ...chat,
                  title:
                    chat.title === 'New Chat' && chat.messages.length === 0
                      ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
                      : chat.title,
                  messages: [...chat.messages, userMessage, aiMessage],
                }
              : chat
          );
        } else {
          // If new chat from backend
          const newChat: Chat = {
            id: sessionId,
            title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
            createdAt: Date.now(),
            messages: [userMessage, aiMessage],
          };
          return [newChat, ...prev];
        }
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };
  
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-chatbg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <AuthPage />;

  return (
    <div className="h-screen flex overflow-hidden bg-chatbg">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onCreateNewChat={createNewChat}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        headerContent={<UserMenu />}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatWindow
          currentChat={getCurrentChat()}
          onSendMessage={handleSendMessage}
          isWaitingForResponse={isWaitingForResponse}
        />
      </div>
    </div>
  );
};

export default Index;
