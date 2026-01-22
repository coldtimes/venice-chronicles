import React, { useState } from 'react';
import { Location, Zone } from '../types';
import { Map, Plus, Trash2, Navigation, Save, Home, MapPin, EyeOff, X } from 'lucide-react';

interface MapPanelProps {
  isOpen: boolean;
  locations: Location[];
  currentLocationId: string | null;
  currentZoneId: string | null;
  onAddLocation: (loc: Location) => void;
  onAddZone: (locId: string, zone: Zone) => void;
  onSetCurrentPosition: (locId: string, zoneId: string) => void;
  onDeleteLocation: (id: string) => void;
  onClose: () => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ 
  isOpen, 
  locations,
  currentLocationId,
  currentZoneId,
  onAddLocation,
  onAddZone,
  onSetCurrentPosition,
  onDeleteLocation,
  onClose
}) => {
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [newZone, setNewZone] = useState<Partial<Zone>>({ name: '', description: '' });

  // State to track which zones have their descriptions expanded
  const [expandedZoneIds, setExpandedZoneIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleZoneExpand = (id: string) => {
    setExpandedZoneIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleCreateLocation = () => {
    if (newLocName.trim()) {
      onAddLocation({
        id: Date.now().toString(),
        name: newLocName,
        zones: []
      });
      setNewLocName('');
      setIsAddingLoc(false);
    }
  };

  const handleCreateZone = (locId: string) => {
    if (newZone.name && newZone.description) {
      const zone: Zone = {
        id: Date.now().toString(),
        name: newZone.name,
        description: newZone.description,
        connections: [],
        isExplored: true // Manual creation assumes knowledge
      };
      onAddZone(locId, zone);
      setNewZone({ name: '', description: '' });
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-30 transform transition-transform duration-500 ease-out flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-100">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Map className="w-4 h-4 text-emerald-300" />
            </div>
            <h2 className="font-serif font-semibold tracking-wide">Atlas & Map</h2>
            </div>
            <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Close"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        <p className="text-[10px] text-zinc-500">Unexplored areas remain hidden. Travel to reveal them.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Active Status */}
        <div className="bg-black/30 border border-emerald-900/30 rounded-lg p-3">
            <h3 className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2">Current Position</h3>
            {currentLocationId && currentZoneId ? (
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <div>
                         {(() => {
                            const loc = locations.find(l => l.id === currentLocationId);
                            const zone = loc?.zones.find(z => z.id === currentZoneId);
                            return (
                                <>
                                    <div className="text-sm font-serif text-emerald-100">{loc?.name}</div>
                                    <div className="text-xs text-emerald-400/70">{zone?.name}</div>
                                </>
                            )
                         })()}
                    </div>
                </div>
            ) : (
                <div className="text-xs text-zinc-500 italic">Position unknown / wandering...</div>
            )}
        </div>

        {/* Locations List */}
        <div className="space-y-4">
             {locations.map(loc => {
                // FOG OF WAR: Calculate statistics for display
                const exploredZones = loc.zones.filter(z => z.isExplored);
                const isLocActive = loc.id === currentLocationId;
                
                 return (
                 <div key={loc.id} className={`border rounded-xl overflow-hidden transition-all ${isLocActive ? 'bg-zinc-900/40 border-emerald-500/30' : 'bg-zinc-950/40 border-white/5'}`}>
                     <div className="p-3 bg-white/5 flex justify-between items-center">
                         <div>
                            <h3 className="font-bold text-sm text-zinc-200">{loc.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                                    {exploredZones.length} / {loc.zones.length} Explored
                                </span>
                            </div>
                         </div>
                         <button onClick={() => onDeleteLocation(loc.id)} className="text-zinc-600 hover:text-red-400">
                             <Trash2 className="w-3.5 h-3.5" />
                         </button>
                     </div>
                     
                     <div className="p-3 space-y-2">
                        {exploredZones.length === 0 && <p className="text-[10px] text-zinc-600 italic">No explored areas yet.</p>}
                        
                        {exploredZones.map(zone => {
                            const isCurrent = currentZoneId === zone.id;
                            return (
                                <div key={zone.id} className={`p-2 rounded border text-xs flex justify-between items-start ${isCurrent ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-black/20 border-white/5'}`}>
                                    <div className="flex-1">
                                        <div className="font-bold text-zinc-300 flex items-center gap-2">
                                            {zone.name}
                                            {isCurrent && <span className="text-[8px] bg-emerald-500 text-black px-1 rounded font-bold uppercase">Here</span>}
                                        </div>
                                        <div 
                                            className={`text-zinc-500 mt-1 cursor-pointer hover:text-zinc-400 transition-colors ${expandedZoneIds.has(zone.id) ? '' : 'line-clamp-2'}`}
                                            title={zone.description}
                                            onClick={() => toggleZoneExpand(zone.id)}
                                        >
                                            {zone.description}
                                        </div>
                                        
                                        {/* Connections Logic */}
                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            <span className="text-[9px] text-zinc-600 uppercase">Paths lead to:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {/* Show all connections, but if target is unexplored, show ??? */}
                                                {(zone.connections || []).map(targetId => {
                                                    const targetZone = loc.zones.find(z => z.id === targetId);
                                                    if (!targetZone) return null;
                                                    
                                                    const isKnown = targetZone.isExplored;
                                                    
                                                    return (
                                                        <div 
                                                            key={targetId}
                                                            className={`px-1.5 py-0.5 rounded text-[9px] border cursor-default flex items-center gap-1 ${isKnown ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-950 text-zinc-600 border-zinc-800 border-dashed'}`}
                                                        >
                                                            {!isKnown && <EyeOff className="w-2 h-2" />}
                                                            {isKnown ? targetZone.name : "Unknown Area"}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Only allow manual teleport to known locations for debugging/stuck prevention */}
                                    <button 
                                        onClick={() => onSetCurrentPosition(loc.id, zone.id)}
                                        disabled={isCurrent}
                                        className="ml-2 p-1.5 rounded bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-500 transition-colors disabled:opacity-0"
                                        title="Teleport Here"
                                    >
                                        <Navigation className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}

                        {/* Add Zone Form (Manual Override) */}
                        <div className="mt-3 pt-3 border-t border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => setEditingLocId(editingLocId === loc.id ? null : loc.id)}
                                className="text-[9px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1 mb-2"
                            >
                                <Plus className="w-3 h-3" /> Manually add room (DM Override)
                            </button>
                            
                             {editingLocId === loc.id && (
                                 <div className="animate-in fade-in slide-in-from-top-1 bg-black/40 p-2 rounded">
                                     <input 
                                        placeholder="Room Name"
                                        value={newZone.name}
                                        onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-zinc-200 mb-2 outline-none focus:border-emerald-500/50"
                                    />
                                    <textarea 
                                        placeholder="Description"
                                        value={newZone.description}
                                        onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-zinc-400 mb-2 outline-none focus:border-emerald-500/50 resize-y min-h-[40px]"
                                    />
                                    <button 
                                        onClick={() => handleCreateZone(loc.id)}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-1.5 rounded"
                                    >
                                        Add Known Room
                                    </button>
                                 </div>
                             )}
                        </div>
                     </div>
                 </div>
             )})}
        </div>

        {/* Add Location Button */}
        {!isAddingLoc ? (
            <button 
                onClick={() => setIsAddingLoc(true)}
                className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:text-emerald-300 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 text-xs"
            >
                <Home className="w-3.5 h-3.5" /> Create New Location
            </button>
        ) : (
            <div className="flex gap-2 animate-in fade-in">
                <input 
                    autoFocus
                    placeholder="Location Name"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                />
                <button 
                    onClick={handleCreateLocation}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 rounded"
                >
                    <Save className="w-4 h-4" />
                </button>
            </div>
        )}

      </div>
    </div>
  );
};