import React, { useState } from 'react';
import { MemoryItem } from '../types';
import { Plus, Trash2, BookOpen, Save, Search, Filter, Info, Power, PowerOff, Sparkles, X } from 'lucide-react';

interface MemoryPanelProps {
  isOpen: boolean;
  memories: MemoryItem[];
  onAddMemory: (memory: MemoryItem) => void;
  onDeleteMemory: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onClose: () => void;
}

const CATEGORY_EXAMPLES: Record<string, string> = {
  'Character': "e.g., The Mercenary Captain - A stoic fighter who secretly loves poetry.",
  'Place': "e.g., The Floating Spire - A tower suspended by ancient gravity magic.",
  'Item': "e.g., The Key of Shadows - Unlocks any door but alerts nearby guards.",
  'Lore': "e.g., The 100-Year War - A past conflict that makes Elves distrust Humans.",
  'Other': "e.g., Rules of Magic - Using fire magic drains stamina twice as fast."
};

export const MemoryPanel: React.FC<MemoryPanelProps> = ({ 
  isOpen, 
  memories, 
  onAddMemory, 
  onDeleteMemory,
  onToggleStatus,
  onClose
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [newItem, setNewItem] = useState<Partial<MemoryItem>>({
    category: 'Character',
    name: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (newItem.name && newItem.description) {
      onAddMemory({
        id: Date.now().toString(),
        category: newItem.category as any,
        name: newItem.name!,
        description: newItem.description!,
        isEnabled: true
      });
      setNewItem({ category: 'Character', name: '', description: '' });
      setIsAdding(false);
    }
  };

  const filteredMemories = memories.filter(mem => {
    const matchesSearch = mem.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || mem.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-30 transform transition-transform duration-500 ease-out flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-zinc-100">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
               <BookOpen className="w-4 h-4 text-indigo-300" />
            </div>
            <h2 className="font-serif font-semibold tracking-wide">World Memory</h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
                onClick={() => setShowHelp(!showHelp)}
                className={`p-1.5 rounded-lg transition-colors border border-transparent ${showHelp ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                title="Show Category Help"
            >
                <Info className="w-4 h-4" />
            </button>
            <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Close"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search lore..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-zinc-200 focus:border-indigo-500/50 focus:bg-black/40 focus:outline-none placeholder-zinc-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:border-indigo-500/50 focus:outline-none cursor-pointer hover:bg-black/30 transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Character">Characters</option>
              <option value="Place">Places</option>
              <option value="Item">Items</option>
              <option value="Lore">Lore</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-indigo-950/30 border-b border-indigo-500/10 p-4 text-[10px] space-y-2 animate-in slide-in-from-top-2 backdrop-blur-md">
          <h3 className="font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Guide
          </h3>
          {Object.entries(CATEGORY_EXAMPLES).map(([cat, ex]) => (
            <div key={cat} className="flex gap-2 leading-relaxed">
              <span className="text-indigo-300/80 w-16 font-medium shrink-0">{cat}:</span>
              <span className="text-zinc-400">{ex}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add New Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border border-dashed border-zinc-700/50 rounded-xl text-zinc-500 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-sm group"
          >
            <div className="p-1 rounded-full bg-zinc-800/50 group-hover:bg-indigo-500/20 transition-colors">
              <Plus className="w-3 h-3" />
            </div>
            Record New Memory
          </button>
        )}

        {/* Add New Form */}
        {isAdding && (
          <div className="bg-zinc-900/80 rounded-xl p-3 border border-indigo-500/30 shadow-2xl animate-in fade-in slide-in-from-top-2 ring-1 ring-indigo-500/20">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">New Entry</span>
              </div>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-zinc-300 focus:border-indigo-500/50 outline-none"
              >
                <option value="Character">Character</option>
                <option value="Place">Place</option>
                <option value="Item">Item</option>
                <option value="Lore">Lore</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Name"
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-zinc-100 focus:border-indigo-500/50 outline-none placeholder-zinc-600"
              />
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Description..."
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-zinc-300 focus:border-indigo-500/50 outline-none placeholder-zinc-600 min-h-[80px] resize-y"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!newItem.name || !newItem.description}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-3 h-3" /> Save Entry
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors border border-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filteredMemories.length === 0 && !isAdding && (
            <div className="text-center py-12 opacity-30 flex flex-col items-center">
              <BookOpen className="w-8 h-8 mb-3 text-zinc-500" />
              <p className="text-xs font-serif italic text-zinc-400">The archives are empty.</p>
            </div>
          )}

          {filteredMemories.map((mem) => (
            <div 
              key={mem.id} 
              className={`group relative rounded-xl p-3 transition-all duration-300 border ${
                mem.isEnabled 
                  ? 'bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-800/40 shadow-sm' 
                  : 'bg-zinc-950/20 border-white/5 opacity-50 grayscale hover:grayscale-0'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                     !mem.isEnabled ? 'bg-zinc-900 text-zinc-500 border-zinc-800' :
                     mem.category === 'Character' ? 'bg-blue-900/20 text-blue-300 border-blue-500/20' :
                     mem.category === 'Place' ? 'bg-emerald-900/20 text-emerald-300 border-emerald-500/20' :
                     mem.category === 'Item' ? 'bg-amber-900/20 text-amber-300 border-amber-500/20' :
                     mem.category === 'Lore' ? 'bg-purple-900/20 text-purple-300 border-purple-500/20' :
                     'bg-zinc-800 text-zinc-400 border-zinc-700'
                   }`}>
                     {mem.category}
                   </span>
                   <span className={`font-serif tracking-wide text-sm ${mem.isEnabled ? 'text-zinc-200' : 'text-zinc-500 line-through'}`}>
                     {mem.name}
                   </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleStatus(mem.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      mem.isEnabled 
                        ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' 
                        : 'text-zinc-600 hover:text-emerald-400 hover:bg-zinc-800'
                    }`}
                    title={mem.isEnabled ? "Deactivate" : "Activate"}
                  >
                    {mem.isEnabled ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => onDeleteMemory(mem.id)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className={`text-xs leading-relaxed mt-2 pl-2 border-l-2 font-serif ${mem.isEnabled ? 'text-zinc-400/90 border-indigo-500/20' : 'text-zinc-600 border-zinc-800'}`}>
                {mem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-black/20 border-t border-white/5 text-[10px] text-zinc-500/80 text-center flex justify-between items-center px-4 font-mono">
        <span>Active: <span className="text-zinc-300">{memories.filter(m => m.isEnabled).length}</span></span>
        <span>Total: <span className="text-zinc-300">{memories.length}</span></span>
      </div>
    </div>
  );
};