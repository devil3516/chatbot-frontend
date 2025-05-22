
import React, { useState, useEffect } from 'react';
import { Chat, Message } from '@/types/chat';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Initialize from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (error) {
        console.error('Error parsing saved chats:', error);
        toast({
          title: "Error",
          description: "Could not load saved chats",
          variant: "destructive"
        });
      }
    }

    // Auto-collapse sidebar on mobile
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId) || null;
  };

  const createNewChat = () => {
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      title: `New Chat`,
      messages: [],
      createdAt: Date.now(),
    };

    setChats([newChat, ...chats]);
    setCurrentChatId(newChatId);
    
    // Auto-collapse sidebar on mobile after selecting a chat
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    
    // Auto-collapse sidebar on mobile after selecting a chat
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  const handleSendMessage = async (content: string) => {
    // If no current chat, create one
    if (!currentChatId) {
      createNewChat();
    }

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    // Update chat with user message
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    // Show waiting indicator
    setIsWaitingForResponse(true);

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      try {
        const aiMessage: Message = {
          id: uuidv4(),
          content: generateAIResponse(content),
          role: 'assistant',
          timestamp: Date.now(),
        };

        // Update chat with AI response
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === currentChatId) {
              // Update title based on first message if it's a new chat
              let title = chat.title;
              if (chat.messages.length === 0 || chat.title === 'New Chat') {
                title = content.length > 30 
                  ? content.substring(0, 30) + '...' 
                  : content;
              }
              return { 
                ...chat, 
                title,
                messages: [...chat.messages, aiMessage] 
              };
            }
            return chat;
          });
          return updatedChats;
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate response",
          variant: "destructive"
        });
      } finally {
        setIsWaitingForResponse(false);
      }
    }, 1500);
  };

  const generateAIResponse = (message: string) => {
    // This is a simple mock response function
    // In a real app, this would call an API like OpenAI
    const responses = [
      `I understand you're asking about "${message}". This is a simulated response in your demo app. In a real application, this would connect to an AI API like GPT to generate meaningful responses.`,
      `Thanks for your message about "${message}". This is just a demo response. If this were connected to a real AI model, you'd get an intelligent answer here.`,
      `Your question about "${message}" is interesting! In a production app, this would connect to an AI service to provide helpful information.`,
      `I see you're interested in "${message}". This is a placeholder response. To get real AI responses, you would need to integrate with an AI provider's API.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-chatbg">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onCreateNewChat={createNewChat}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
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
