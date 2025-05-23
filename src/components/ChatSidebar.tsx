import React from 'react';
import { Chat, ChatSidebarProps } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Menu, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatSidebar: React.FC<ChatSidebarProps & { onDeleteChat: (chatId: string) => void }> = ({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onCreateNewChat,
  onDeleteChat,
  isCollapsed,
  toggleSidebar,
  headerContent
}) => {
  const isMobile = useIsMobile();

  // Add confirmation dialog for delete
  const handleDeleteWithConfirmation = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const chatTitle = chats.find(chat => chat.id === chatId)?.title || 'this chat';
    
    if (window.confirm(`Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`)) {
      onDeleteChat(chatId);
    }
  };

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
      
      {headerContent}
      
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
              <div 
                key={chat.id}
                className={cn(
                  "group flex items-center justify-between rounded-md hover:bg-sidebar-accent",
                  currentChatId === chat.id && "bg-sidebar-accent"
                )}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-sidebar-foreground hover:bg-transparent py-3 px-3",
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {chat.title || `Chat ${new Date(chat.createdAt).toLocaleString()}`}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-transparent"
                  onClick={(e) => handleDeleteWithConfirmation(chat.id, e)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
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