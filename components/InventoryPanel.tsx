import React, { useState } from 'react';
import { InventoryItem, Currency } from '../types';
import { Plus, Trash2, Backpack, Shield, Sword, Cookie, Gem, Shirt, Save, Coins, ArrowRight, X } from 'lucide-react';

interface InventoryPanelProps {
  isOpen: boolean;
  inventory: InventoryItem[];
  currency: Currency;
  onUpdateCurrency: (currency: Currency) => void;
  onAddItem: (item: InventoryItem) => void;
  onRemoveItem: (id: string) => void;
  onToggleEquip: (id: string) => void;
  onClose: () => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ 
  isOpen, 
  inventory, 
  currency,
  onUpdateCurrency,
  onAddItem, 
  onRemoveItem,
  onToggleEquip,
  onClose
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    type: 'Weapon',
    name: '',
    description: '',
    quantity: 1,
    isEquipped: false
  });
  
  // State to track which items have their descriptions expanded
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleItemExpand = (id: string) => {
    setExpandedItemIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleSave = () => {
    if (newItem.name) {
      onAddItem({
        id: Date.now().toString(),
        type: newItem.type as any,
        name: newItem.name!,
        description: newItem.description || '',
        quantity: newItem.quantity || 1,
        isEquipped: newItem.isEquipped || false
      });
      setNewItem({ type: 'Weapon', name: '', description: '', quantity: 1, isEquipped: false });
      setIsAdding(false);
    }
  };

  const equippedItems = inventory.filter(i => i.isEquipped);
  const bagItems = inventory.filter(i => !i.isEquipped);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Weapon': return <Sword className="w-3.5 h-3.5" />;
      case 'Offhand': return <Shield className="w-3.5 h-3.5" />;
      case 'Head': 
      case 'Body': 
      case 'Legs': 
      case 'Feet': return <Shirt className="w-3.5 h-3.5" />;
      case 'Accessory': return <Gem className="w-3.5 h-3.5" />;
      case 'Consumable': return <Cookie className="w-3.5 h-3.5" />;
      default: return <Backpack className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-30 transform transition-transform duration-500 ease-out flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-100">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Backpack className="w-4 h-4 text-amber-300" />
            </div>
            <h2 className="font-serif font-semibold tracking-wide">Inventory</h2>
            </div>
            <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Close"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Currency Widget */}
        <div className="bg-black/30 rounded-xl p-3 border border-white/10 flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
                <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span className="uppercase tracking-widest text-[10px]">Currency</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-black/40 p-2 rounded-lg border border-white/5 hover:border-amber-500/20 transition-colors">
                    <input 
                        type="number" 
                        value={currency.gold}
                        onChange={(e) => onUpdateCurrency({...currency, gold: parseInt(e.target.value) || 0})}
                        className="w-full text-center bg-transparent text-amber-400 font-bold text-sm outline-none font-mono"
                    />
                    <span className="text-[8px] text-zinc-600 uppercase tracking-wider mt-1">Gold</span>
                </div>
                <div className="flex flex-col items-center bg-black/40 p-2 rounded-lg border border-white/5 hover:border-zinc-400/20 transition-colors">
                    <input 
                        type="number" 
                        value={currency.silver}
                        onChange={(e) => onUpdateCurrency({...currency, silver: parseInt(e.target.value) || 0})}
                        className="w-full text-center bg-transparent text-zinc-300 font-bold text-sm outline-none font-mono"
                    />
                    <span className="text-[8px] text-zinc-600 uppercase tracking-wider mt-1">Silver</span>
                </div>
                <div className="flex flex-col items-center bg-black/40 p-2 rounded-lg border border-white/5 hover:border-orange-700/20 transition-colors">
                    <input 
                        type="number" 
                        value={currency.copper}
                        onChange={(e) => onUpdateCurrency({...currency, copper: parseInt(e.target.value) || 0})}
                        className="w-full text-center bg-transparent text-orange-600 font-bold text-sm outline-none font-mono"
                    />
                    <span className="text-[8px] text-zinc-600 uppercase tracking-wider mt-1">Copper</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Equipped Section */}
        <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between pl-1">
                <span>Currently Equipped</span>
                <span className="text-zinc-600">{equippedItems.length} / 8</span>
            </h3>
            {equippedItems.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-zinc-600 font-serif italic">No gear equipped.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {equippedItems.map(item => (
                        <div key={item.id} className="bg-zinc-900/40 border border-white/5 rounded-lg flex items-center p-2.5 gap-3 group hover:border-indigo-500/30 hover:bg-zinc-800/60 transition-all shadow-sm">
                            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-400 border border-white/10 shadow-inner">
                                {getItemIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-zinc-200 truncate font-serif" title={item.name}>{item.name}</span>
                                    {item.quantity > 1 && <span className="text-xs text-indigo-400 font-mono">x{item.quantity}</span>}
                                </div>
                                <div className="text-[10px] text-zinc-500 truncate uppercase tracking-wide">{item.type}</div>
                            </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onToggleEquip(item.id)}
                                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-indigo-300 transition-colors"
                                    title="Unequip"
                                >
                                    <Shield className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button onClick={() => onRemoveItem(item.id)} className="p-1.5 rounded bg-zinc-800 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Backpack Section */}
        <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between pl-1">
                <span>Backpack Contents</span>
                <span className="text-zinc-600">{bagItems.length} items</span>
            </h3>
             {bagItems.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-zinc-600 font-serif italic">Your bag is empty.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {bagItems.map(item => (
                        <div key={item.id} className="bg-zinc-900/20 border border-white/5 rounded-lg flex items-start p-2.5 gap-3 group hover:border-zinc-700 hover:bg-zinc-900/40 transition-all">
                            <div className="w-9 h-9 rounded-md bg-black/40 flex items-center justify-center text-zinc-600 border border-white/5 flex-shrink-0 mt-0.5">
                                {getItemIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors truncate" title={item.name}>{item.name}</span>
                                    {item.quantity > 1 && <span className="text-xs text-zinc-500 font-mono">x{item.quantity}</span>}
                                </div>
                                <div 
                                    className={`text-[10px] text-zinc-600 mt-0.5 cursor-pointer hover:text-zinc-400 transition-colors ${expandedItemIds.has(item.id) ? 'whitespace-normal break-words' : 'truncate'}`}
                                    title={item.description}
                                    onClick={() => toggleItemExpand(item.id)}
                                >
                                    {item.description}
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button 
                                    onClick={() => onToggleEquip(item.id)}
                                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-emerald-400 transition-colors"
                                    title="Equip"
                                >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onRemoveItem(item.id)} className="p-1.5 rounded bg-zinc-800 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Add Item Logic */}
        {!isAdding ? (
             <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3 border border-dashed border-zinc-700/50 rounded-xl text-zinc-500 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 text-sm group"
            >
                <div className="p-1 rounded-full bg-zinc-800/50 group-hover:bg-amber-500/20 transition-colors">
                    <Plus className="w-3 h-3" />
                </div>
                Add Item
            </button>
        ) : (
            <div className="bg-zinc-900/80 rounded-xl p-3 border border-amber-500/30 shadow-2xl animate-in fade-in slide-in-from-top-2 ring-1 ring-amber-500/20">
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                         <span className="text-xs font-bold text-amber-500/80 uppercase tracking-wider">New Item</span>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={newItem.type}
                            onChange={(e) => setNewItem({...newItem, type: e.target.value as any})}
                            className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-xs text-zinc-300 focus:border-amber-500/50 outline-none"
                        >
                            <option value="Weapon">Weapon</option>
                            <option value="Offhand">Offhand</option>
                            <option value="Head">Head</option>
                            <option value="Body">Body</option>
                            <option value="Legs">Legs</option>
                            <option value="Feet">Feet</option>
                            <option value="Accessory">Accessory</option>
                            <option value="Consumable">Consumable</option>
                            <option value="Material">Material</option>
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                            className="w-14 bg-black/40 border border-white/10 rounded p-2 text-xs text-zinc-300 focus:border-amber-500/50 outline-none text-center"
                            placeholder="Qty"
                        />
                    </div>
                    <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        placeholder="Item Name"
                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-zinc-100 focus:border-amber-500/50 outline-none"
                    />
                    <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Description (optional)"
                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-zinc-300 focus:border-amber-500/50 outline-none"
                    />
                    <div className="flex items-center gap-2 py-1">
                        <input 
                            type="checkbox" 
                            id="equipCheck"
                            checked={newItem.isEquipped}
                            onChange={(e) => setNewItem({...newItem, isEquipped: e.target.checked})}
                            className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500/50"
                        />
                        <label htmlFor="equipCheck" className="text-xs text-zinc-400">Equip immediately</label>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={handleSave}
                            disabled={!newItem.name}
                            className="flex-1 bg-amber-700 hover:bg-amber-600 text-white py-2 rounded text-xs font-medium disabled:opacity-50 transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-1"
                        >
                            <Save className="w-3 h-3" /> Add to Bag
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

      </div>
    </div>
  );
};