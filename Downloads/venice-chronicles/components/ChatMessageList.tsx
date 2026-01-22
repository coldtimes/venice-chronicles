import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Role } from '../types';
import { User, Feather, BrainCircuit, Terminal, CheckCircle2 } from 'lucide-react';

interface ChatMessageListProps {
  messages: Message[];
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-8 pb-4">
      {messages.map((msg) => {
        // Special rendering for Tool Output (System Events)
        if (msg.role === Role.TOOL) {
          return (
            <div key={msg.id} className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-zinc-900/50 border border-indigo-500/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-mono text-zinc-400">{msg.content}</span>
              </div>
            </div>
          );
        }

        // Standard Chat Messages
        return (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ${
              msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg rotate-3 flex items-center justify-center shadow-lg border ${
              msg.role === Role.USER 
                ? 'bg-indigo-600 border-indigo-400/30' 
                : 'bg-zinc-900 border-zinc-700'
            }`}>
              {msg.role === Role.USER ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Feather className="w-4 h-4 text-zinc-400" />
              )}
            </div>

            {/* Message Container */}
            <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
              
              {/* Tool Invocation Indicator (If Assistant is calling a tool) */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mb-2 flex flex-col gap-1 items-start">
                   {msg.toolCalls.map((call, idx) => (
                     <div key={idx} className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-900/40 px-2 py-1 rounded border border-zinc-800">
                        <Terminal className="w-3 h-3 text-amber-500" />
                        <span className="font-mono">executing: {call.function.name}</span>
                     </div>
                   ))}
                </div>
              )}

              {/* Thinking Process */}
              {msg.reasoning && (
                <details className="mb-3 group w-full">
                  <summary className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-zinc-600 cursor-pointer hover:text-indigo-400 transition-colors list-none select-none">
                    <BrainCircuit className="w-3 h-3" />
                    <span>Cognitive Process</span>
                    <span className="opacity-50 group-open:rotate-180 transition-transform duration-200">▼</span>
                  </summary>
                  <div className="mt-2 p-4 bg-black/40 border border-indigo-500/10 rounded-lg text-xs text-indigo-200/60 font-mono leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                    {msg.reasoning}
                  </div>
                </details>
              )}

              {/* Main Bubble - Only render if content exists (it might be null for pure tool calls) */}
              {msg.content && (
                <div className={`relative px-6 py-4 shadow-xl leading-relaxed w-full transition-all ${
                  msg.role === Role.USER 
                    ? 'bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm backdrop-blur-sm border border-indigo-500/20' 
                    : 'bg-zinc-900/40 text-zinc-200 rounded-xl border border-white/5 backdrop-blur-md'
                }`}>
                  <div className={`prose prose-invert prose-sm max-w-none break-words ${
                    msg.role === Role.ASSISTANT ? 'font-serif text-base text-zinc-100/90' : 'font-sans'
                  }`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 hover:underline decoration-indigo-500/30 underline-offset-2" />,
                        code: ({node, ...props}) => <code {...props} className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-xs border border-white/10 text-indigo-200" />,
                        pre: ({node, ...props}) => <pre {...props} className="bg-zinc-950/80 rounded-lg p-4 overflow-x-auto my-3 border border-white/5 shadow-inner" />,
                        p: ({node, ...props}) => <p {...props} className="mb-3 last:mb-0 leading-7" />,
                        strong: ({node, ...props}) => <strong {...props} className="font-bold text-zinc-50" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 my-2 space-y-1 marker:text-zinc-500" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 my-2 space-y-1 marker:text-zinc-500" />,
                        blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-2 border-indigo-500/30 pl-4 italic text-zinc-400 my-4" />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              <div className={`text-[10px] mt-2 font-medium tracking-wide px-1 ${
                  msg.role === Role.USER ? 'text-indigo-400/50' : 'text-zinc-600'
              }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};