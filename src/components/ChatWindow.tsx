
import React, { useEffect, useRef } from 'react';
import { Chat, Message } from '@/types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Bot } from 'lucide-react';

interface ChatWindowProps {
  currentChat: Chat | null;
  onSendMessage: (content: string) => void;
  isWaitingForResponse: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  currentChat, 
  onSendMessage,
  isWaitingForResponse
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chatbg">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Bot size={24} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
          <p className="text-muted-foreground mb-6">
            Start a new conversation or select a previous chat from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {currentChat.messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-chatbg">
            <div className="text-center max-w-md p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground">
                Ask me anything and I'll do my best to assist you.
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentChat.messages.map((message: Message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isWaitingForResponse && (
              <div className="p-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-4">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-light"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-light delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-light delay-150"></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput 
        onSendMessage={onSendMessage}
        isWaitingForResponse={isWaitingForResponse}
      />
    </div>
  );
};

export default ChatWindow;
