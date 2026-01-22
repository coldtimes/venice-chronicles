export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool' // New role for tool outputs
}

export interface Message {
  id: string;
  role: Role;
  content: string | null; // Content can be null if it's purely a tool call
  reasoning?: string;
  timestamp: number;
  // Fields for Tool Usage
  toolCalls?: any[]; // Array of tool calls from the assistant
  toolCallId?: string; // The ID of the tool call this message is responding to (for role: tool)
  name?: string; // The function name (for role: tool)
}

export interface MemoryItem {
  id: string;
  category: 'Character' | 'Place' | 'Item' | 'Lore' | 'Other';
  name: string;
  description: string;
  isEnabled: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'Head' | 'Body' | 'Legs' | 'Feet' | 'Weapon' | 'Offhand' | 'Accessory' | 'Consumable' | 'Material';
  quantity: number;
  isEquipped: boolean;
}

export interface Currency {
  gold: number;
  silver: number;
  copper: number;
}

// --- MAP SYSTEM TYPES ---

export interface Zone {
  id: string;
  name: string; // e.g., "Main Taproom"
  description: string; // e.g., "Tables, bar, wood stove."
  connections: string[]; // IDs of other zones this connects to
  isExplored: boolean; // FOG OF WAR: If false, user cannot see this on the map panel
}

export interface Location {
  id: string;
  name: string; // e.g., "Smallwood Tavern"
  zones: Zone[];
}

export interface ChatState {
  messages: Message[];
  memories: MemoryItem[];
  inventory: InventoryItem[];
  currency: Currency;
  
  // Map State
  locations: Location[];
  currentLocationId: string | null; // Which Location (Building/City) are we in?
  currentZoneId: string | null;     // Which specific Zone (Room) are we in?

  isLoading: boolean;
  error: string | null;
  systemPrompt: string;
  
  // UI State
  isSettingsOpen: boolean;
  isMemoryOpen: boolean;
  isInventoryOpen: boolean;
  isMapOpen: boolean;
}

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
}