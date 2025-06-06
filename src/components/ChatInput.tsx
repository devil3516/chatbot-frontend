import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isWaitingForResponse: boolean;
  focusInput?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isWaitingForResponse,
  focusInput = false 
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focusInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || isWaitingForResponse) return;
    onSendMessage(message);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-chatBorder bg-white p-4">
      <div className="relative flex items-end max-w-3xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none pr-12 py-3 min-h-[56px] max-h-[200px] rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          disabled={isWaitingForResponse}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!input.trim() || isWaitingForResponse}
        >
          <Send size={16} />
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2">
        AI might produce inaccurate information about people, places, or facts.
      </p>
    </form>
  );
};

export default ChatInput;