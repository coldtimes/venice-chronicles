import React, { useState, KeyboardEvent } from 'react';
import { SendHorizontal, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition duration-1000 blur-lg ${disabled ? 'hidden' : ''}`}></div>
      
      <div className="relative flex items-end gap-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 transition-all shadow-2xl">
        <div className="pl-3 py-3 text-zinc-500">
           <Sparkles className="w-5 h-5" />
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "The world is changing..." : "What do you do?"}
          disabled={disabled}
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 resize-none py-3 px-2 h-12 max-h-32 focus:outline-none disabled:opacity-50 text-base font-sans scrollbar-hide"
          rows={1}
          style={{ minHeight: '48px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
             !input.trim() || disabled 
             ? 'bg-zinc-800 text-zinc-600' 
             : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)]'
          }`}
          aria-label="Send message"
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};