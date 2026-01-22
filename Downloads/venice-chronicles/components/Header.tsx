import React from 'react';
import { Sparkles, Settings, BookOpen, Backpack, Map } from 'lucide-react';

interface HeaderProps {
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  onToggleMemory: () => void;
  isMemoryOpen: boolean;
  onToggleInventory: () => void;
  isInventoryOpen: boolean;
  onToggleMap: () => void;
  isMapOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSettings, 
  isSettingsOpen,
  onToggleMemory,
  isMemoryOpen,
  onToggleInventory,
  isInventoryOpen,
  onToggleMap,
  isMapOpen
}) => {
  return (
    <header className="px-6 py-5 bg-zinc-950/60 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)] border border-indigo-500/20 group">
            <Sparkles className="w-5 h-5 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-zinc-100 tracking-tight font-serif italic">
              Venice Chronicles
            </h1>
            <div className="flex items-center gap-2">
               <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
               <p className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase">Connected</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
           <button 
            onClick={onToggleMap}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent ${
              isMapOpen 
                ? 'bg-zinc-800 text-emerald-300 border-zinc-700/50 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="Atlas & Map"
          >
            <Map className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Map</span>
          </button>

           <button 
            onClick={onToggleMemory}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent ${
              isMemoryOpen 
                ? 'bg-zinc-800 text-indigo-300 border-zinc-700/50 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="World Memory"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Memory</span>
          </button>

          <button 
            onClick={onToggleInventory}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent ${
              isInventoryOpen 
                ? 'bg-zinc-800 text-amber-300 border-zinc-700/50 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="Character Inventory"
          >
            <Backpack className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Items</span>
          </button>

          <div className="w-px h-5 bg-zinc-800 mx-1"></div>

          <button 
            onClick={onToggleSettings}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              isSettingsOpen 
                ? 'bg-zinc-800 text-zinc-200' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="System Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};