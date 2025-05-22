
import React from 'react';
import { Chat } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat: () => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onCreateNewChat,
  isCollapsed,
  toggleSidebar
}) => {
  const isMobile = useIsMobile();

  if (isCollapsed && isMobile) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white shadow-md"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "bg-sidebarBg text-white flex flex-col h-full transition-all duration-300",
        isCollapsed ? "w-0 overflow-hidden" : "w-72"
      )}
    >
      <div className="p-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">AI Chat</h1>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-sidebar-accent"
          >
            <Menu size={20} />
          </Button>
        )}
      </div>
      
      <Button 
        className="mx-3 mb-2 bg-newChat hover:bg-green-600 text-white flex gap-2"
        onClick={onCreateNewChat}
      >
        <Plus size={16} />
        New chat
      </Button>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length > 0 ? (
          <div className="space-y-1">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left text-sidebar-foreground hover:bg-sidebar-accent py-3 px-3",
                  currentChatId === chat.id && "bg-sidebar-accent"
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="truncate">
                  {chat.title || `Chat ${new Date(chat.createdAt).toLocaleDateString()}`}
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-gray-400">
            <p>No saved chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
