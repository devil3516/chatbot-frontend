// Updated index.tsx to always create and switch to new chat after deleting current chat

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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/api/user-chat-sessions/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        
        if (!res.ok) throw new Error('Failed to fetch chats');
        
        const data = await res.json();
        const transformedChats = data.map((session: any) => ({
          id: session.id,
          title: session.title,
          createdAt: new Date(session.createdAt).getTime(),
          messages: session.messages.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            timestamp: new Date(msg.timestamp).getTime(),
          })),
          isLocal: false
        }));
        
        setChats(transformedChats);
        
        if (transformedChats.length > 0) {
          setCurrentChatId(transformedChats[0].id);
        }
        if (isMobile) setIsSidebarCollapsed(true);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast({ title: 'Error', description: 'Failed to load chats', variant: 'destructive' });
      }
    };

    if (isAuthenticated) fetchChats();
  }, [isAuthenticated, isMobile, toast]);

  const getCurrentChat = () => chats.find(chat => chat.id === currentChatId) || null;

  const createNewChat = () => {
    const tempId = `temp-${uuidv4()}`;
    const newChat: Chat = {
      id: tempId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      isLocal: true
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(tempId);
    setIsNewChat(true);
    if (isMobile) setIsSidebarCollapsed(true);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsNewChat(false);
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
      const isLocalChat = typeof currentChatId === 'string' && currentChatId.startsWith('temp-');
      let sessionId = currentChatId;
      let response;

      if (isLocalChat) {
        const chatTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        const createRes = await fetch('http://127.0.0.1:8000/api/create-chat-session/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ title: chatTitle }),
        });

        if (!createRes.ok) throw new Error('Failed to create session');
        const newSession = await createRes.json();
        sessionId = newSession.id;

        response = await fetch('http://127.0.0.1:8000/api/groq-chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ message: content, session_id: sessionId }),
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/api/groq-chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ message: content, session_id: sessionId }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI response failed');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.response,
        role: 'assistant',
        timestamp: Date.now(),
      };

      setChats(prev => {
        if (isLocalChat) {
          return prev.map(chat => 
            chat.id === currentChatId
              ? {
                  id: sessionId,
                  title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
                  messages: [userMessage, aiMessage],
                  createdAt: Date.now(),
                  isLocal: false
                }
              : chat
          );
        } else {
          return prev.map(chat =>
            chat.id === sessionId
              ? {
                  ...chat,
                  messages: [...chat.messages, userMessage, aiMessage],
                }
              : chat
          );
        }
      });

      setCurrentChatId(sessionId);
      setIsNewChat(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleDeleteChat = async (chatId: string) => {
    if (chatId.startsWith('temp-')) {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      createNewChat();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/delete-chat-session/${chatId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 204) {
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        setChats(updatedChats);
        createNewChat();
      } else if (response.status === 404) {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Chat session not found',
          variant: 'destructive',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete chat (${response.status})`);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete chat',
        variant: 'destructive',
      });
    }
  };

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
        onDeleteChat={handleDeleteChat}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        headerContent={<UserMenu />}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatWindow
          currentChat={getCurrentChat()}
          onSendMessage={handleSendMessage}
          isWaitingForResponse={isWaitingForResponse}
          isNewChat={isNewChat}
          onFocusHandled={() => setIsNewChat(false)}
        />
      </div>
    </div>
  );
};

export default Index;
