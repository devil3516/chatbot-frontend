
import React from 'react';
import { Message } from '../types/chat';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "py-5 px-4 md:px-8 flex items-start gap-4 group",
        isUser ? "bg-chatbg" : "bg-aimsg border-b border-chatBorder"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-blue-600" : "bg-emerald-600"
      )}>
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="font-medium text-sm">
          {isUser ? 'You' : 'AI Assistant'}
        </p>
        <div className="prose prose-sm max-w-none">
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
