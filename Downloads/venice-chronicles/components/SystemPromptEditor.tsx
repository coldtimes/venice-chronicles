import React from 'react';
import { Save, RotateCcw, Lock, X } from 'lucide-react';
import { DEFAULT_WORLD_CONTEXT } from '../constants';

interface SystemPromptEditorProps {
  systemPrompt: string;
  onSystemPromptChange: (newPrompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ 
  systemPrompt, 
  onSystemPromptChange, 
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pt-[88px] pb-6 px-4 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-3xl mx-auto relative">
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Close Settings"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              World Setting & Narrative
            </label>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 
              Core mechanics (physics, loot rules) are enforced automatically.
            </span>
          </div>
          <button 
            onClick={() => onSystemPromptChange(DEFAULT_WORLD_CONTEXT)}
            className="text-xs flex items-center gap-1 text-zinc-500 hover:text-indigo-400 transition-colors"
            title="Reset to default world context"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Default
          </button>
        </div>
        <div className="relative group">
          <textarea
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none min-h-[300px] resize-y font-mono shadow-inner leading-relaxed"
            placeholder="Enter instructions for the story setting..."
          />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 rounded border border-zinc-700">
              Auto-saves
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-zinc-500">
          This context defines the story's flavor, starting scenario, and the AI's persona.
        </p>
      </div>
    </div>
  );
};