import OpenAI from 'openai';
import { Message, Role, MemoryItem, InventoryItem, Currency, Location, Zone } from '../types';
import { VENICE_BASE_URL, MODEL_ID, CORE_MECHANICS_PROMPT } from '../constants';

const API_KEY = import.meta.env.VITE_VENICE_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: VENICE_BASE_URL,
  dangerouslyAllowBrowser: true
});

// --- TOOL DEFINITIONS ---

const INVENTORY_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "initialize_character",
      description: "Set the player's starting equipment and wealth based on their background history. Use this once at the very beginning of the story.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["Head", "Body", "Legs", "Feet", "Weapon", "Offhand", "Accessory", "Consumable", "Material"] },
                description: { type: "string" },
                quantity: { type: "integer" },
                isEquipped: { type: "boolean" }
              },
              required: ["name", "type"]
            }
          },
          gold: { type: "integer" },
          silver: { type: "integer" },
          copper: { type: "integer" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manage_inventory",
      description: "Manage the player's inventory. CRITICAL: Only use 'add' if the item explicitly exists in the scene and the player has successfully physically acquired it. Use 'remove' if the item is consumed, lost, or destroyed.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["add", "remove", "equip", "unequip"] },
          item_name: { type: "string" },
          item_type: { type: "string", enum: ["Head", "Body", "Legs", "Feet", "Weapon", "Offhand", "Accessory", "Consumable", "Material"] },
          quantity: { type: "integer" },
          description: { type: "string" }
        },
        required: ["action", "item_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_currency",
      description: "Modify the player's wallet balance.",
      parameters: {
        type: "object",
        properties: {
          gold_delta: { type: "integer" },
          silver_delta: { type: "integer" },
          copper_delta: { type: "integer" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Move the player to a connected zone. ONLY use this if the player explicitly attempts to move to a valid exit.",
      parameters: {
        type: "object",
        properties: {
          target_zone_id: {
            type: "string",
            description: "The exact ID of the zone to move to."
          },
          reason: {
            type: "string",
            description: "Why the movement is happening."
          }
        },
        required: ["target_zone_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_map_location",
      description: "Generate a NEW multi-room layout OR update the existing location map. Use this when entering a new structure or revealing more rooms in the current one.",
      parameters: {
        type: "object",
        properties: {
          location_name: { type: "string", description: "Name of the place (e.g. 'Goblin Cave')" },
          zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Unique ID (e.g. 'cave_entrance', 'main_hall')" },
                name: { type: "string" },
                description: { type: "string", description: "Visual description of the room." },
                connections: { type: "array", items: { type: "string" }, description: "IDs of zones this room connects to." }
              },
              required: ["id", "name", "description", "connections"]
            }
          },
          start_zone_id: { type: "string", description: "The ID of the zone the player is currently in." }
        },
        required: ["location_name", "zones", "start_zone_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_zone_description",
      description: "Update the visual description of a room when the environment changes (e.g., walls broken, items dropped, fire started, mess cleaned up).",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "The new full description of the room." },
          zone_id: { type: "string", description: "Optional. The ID of the zone to update. Defaults to current zone if omitted." }
        },
        required: ["description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "upsert_memory",
      description:
        "Create or update a world memory entry (Character/Place/Item/Lore/Other). " +
        "Only use when something NEW becomes notable (new named NPC, important place, key lore reveal, special item). " +
        "Keep descriptions short (1–2 sentences).",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Character", "Place", "Item", "Lore", "Other"] },
          name: { type: "string" },
          description: { type: "string" },
          isEnabled: { type: "boolean" }
        },
        required: ["category", "name", "description"]
      }
    }
  }
];

// --- SERVICE ---

export const streamMessageToVenice = async (
  history: Message[],
  worldPrompt: string,
  memories: MemoryItem[],
  inventory: InventoryItem[],
  currency: Currency,
  currentLocation: Location | null,
  currentZone: Zone | null,
  onChunk: (content: string, reasoning: string | undefined) => void
): Promise<Message> => {
  if (!API_KEY) throw new Error("Missing API Key.");

  try {
    // 1. Context Construction
    const activeMemories = memories.filter(m => m.isEnabled);
    let memoryContext = activeMemories.length > 0
      ? `\n\n=== HIDDEN MEMORY DATABASE (INTERNAL RECALL ONLY) ===\n` + activeMemories.map(m => `- [${m.category}] ${m.name}: ${m.description}`).join('\n')
      : "";

    // Build Spatial Context
    let spatialContext = "\n\n=== HIDDEN SPATIAL CONTEXT (DO NOT REPEAT TO USER) ===\n";
    if (currentLocation && currentZone) {
      spatialContext += `Current Location: ${currentLocation.name}\n`;
      spatialContext += `Current Zone: ${currentZone.name} (ID: ${currentZone.id})\n`;
      spatialContext += `Zone Description: ${currentZone.description}\n`;

      // List valid exits from the current zone
      const connectedZones = currentLocation.zones.filter(z => (currentZone.connections || []).includes(z.id));
      spatialContext += `VALID EXITS: ${connectedZones.map(z => `"${z.name}" (ID: ${z.id})`).join(', ') || "None"}.\n`;

      // AI OMNISCIENCE: The AI gets to see the full map of the current location to handle physics/logic
      spatialContext += `\n[DM EYES ONLY - FULL LOCATION LAYOUT]:\n`;
      currentLocation.zones.forEach(z => {
        spatialContext += `- ID: ${z.id} | Name: ${z.name} | Exits: ${(z.connections || []).join(', ')}\n`;
      });

    } else {
      spatialContext += "Player is in an undefined location. If they are entering a specific structure (cave, castle), use `create_map_location` to generate the layout.";
    }

    const equipped = inventory.filter(i => i.isEquipped);
    const backpack = inventory.filter(i => !i.isEquipped);

    let inventoryContext = `\n\n=== HIDDEN INVENTORY STATE (DO NOT REPEAT TO USER) ===\n`;
    inventoryContext += `Wallet: ${currency.gold}G, ${currency.silver}S, ${currency.copper}C\n`;
    inventoryContext += `Equipped: ${equipped.length > 0 ? equipped.map(i => `${i.name} (${i.type})`).join(', ') : 'Nothing'}\n`;
    inventoryContext += `Backpack: ${backpack.length > 0 ? backpack.map(i => `${i.name} (x${i.quantity})`).join(', ') : 'Empty'}\n`;

    const fullSystemContent = `${CORE_MECHANICS_PROMPT}\n\n### WORLD SETTING & NARRATIVE\n${worldPrompt}${memoryContext}${spatialContext}${inventoryContext}`;

    // 2. Map Internal Messages to OpenAI Format
    const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: fullSystemContent },
      ...history.map(msg => {
        if (msg.role === Role.TOOL) {
          return {
            role: 'tool',
            tool_call_id: msg.toolCallId,
            content: msg.content
          } as OpenAI.Chat.ChatCompletionToolMessageParam;
        }

        const apiMsg: any = {
          role: msg.role === Role.USER ? 'user' : 'assistant',
          content: msg.content
        };

        if (msg.toolCalls && msg.toolCalls.length > 0) {
          apiMsg.tool_calls = msg.toolCalls;
        }

        return apiMsg;
      })
    ];

    // 3. API Call (Streaming)
    const stream = await client.chat.completions.create({
      model: MODEL_ID,
      messages: apiMessages,
      tools: INVENTORY_TOOLS,
      tool_choice: "auto",
      stream: true // ENABLE STREAMING
    });

    let fullContent = '';
    let fullReasoning = '';
    let toolCallsMap: Record<number, any> = {};

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      // Handle Reasoning (if model supports it)
      if ((delta as any).reasoning_content) {
        fullReasoning += (delta as any).reasoning_content;
        onChunk(fullContent, fullReasoning);
      }

      // Handle Content
      if (delta.content) {
        fullContent += delta.content;
        onChunk(fullContent, fullReasoning);
      }

      // Handle Tool Calls (Buffer them, do not display)
      if (delta.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          const index = toolCall.index;
          if (!toolCallsMap[index]) {
            toolCallsMap[index] = {
              id: toolCall.id,
              function: {
                name: toolCall.function?.name || "",
                arguments: ""
              },
              type: "function"
            };
          }
          if (toolCall.id) toolCallsMap[index].id = toolCall.id;
          if (toolCall.function?.name) toolCallsMap[index].function.name = toolCall.function.name;
          if (toolCall.function?.arguments) toolCallsMap[index].function.arguments += toolCall.function.arguments;
        }
      }
    }

    // Convert buffered tool calls to array
    const finalToolCalls = Object.values(toolCallsMap).map(tc => {
      // Ensure arguments are valid
      return tc;
    });

    // 4. Return final complete message
    return {
      id: Date.now().toString(),
      role: Role.ASSISTANT,
      content: fullContent,
      reasoning: fullReasoning || undefined,
      timestamp: Date.now(),
      toolCalls: finalToolCalls.length > 0 ? finalToolCalls : undefined
    };

  } catch (error: any) {
    console.error("Venice API Error:", error);
    throw error;
  }
};