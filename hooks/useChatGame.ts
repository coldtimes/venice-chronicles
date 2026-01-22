import { useState, useRef, useEffect } from 'react';
import { Message, ChatState, Role, MemoryItem, InventoryItem, Currency, Location, Zone } from '../types';
import { DEFAULT_WORLD_CONTEXT } from '../constants';
import { streamMessageToVenice } from '../services/veniceService';
import { executeToolCall } from '../services/toolService';

export const useChatGame = () => {
    const [chatState, setChatState] = useState<ChatState>({
        messages: [
            {
                id: 'welcome',
                role: Role.ASSISTANT,
                content: "Hello. I am the narrator of this world. I am powered by the **zai-org-glm-4.7** model. I manage the physics, inventory, and geography. Tell me, where does our story begin?",
                timestamp: Date.now()
            }
        ],
        memories: [],
        inventory: [],
        currency: { gold: 0, silver: 0, copper: 0 },
        locations: [],
        currentLocationId: null,
        currentZoneId: null,
        isLoading: false,
        error: null,
        systemPrompt: DEFAULT_WORLD_CONTEXT,
        isSettingsOpen: false,
        isMemoryOpen: false,
        isInventoryOpen: false,
        isMapOpen: false
    });

    const stateRef = useRef(chatState);
    useEffect(() => { stateRef.current = chatState; }, [chatState]);

    // --- ACTIONS ---

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), role: Role.USER, content: content, timestamp: Date.now() };

        // Initialize authoritative state snapshot from current Ref
        let currentState = structuredClone(stateRef.current);
        currentState.messages.push(userMessage);
        currentState.isLoading = true;
        currentState.error = null;

        setChatState({ ...currentState, isLoading: true, error: null });

        try {
            let turnFinished = false;
            const MAX_TURNS = 5;
            let turns = 0;

            while (!turnFinished && turns < MAX_TURNS) {
                turns++;

                const activeLoc = currentState.locations.find((l: Location) => l.id === currentState.currentLocationId) || null;
                const activeZone = activeLoc ? activeLoc.zones.find((z: Zone) => z.id === currentState.currentZoneId) || null : null;

                // Create placeholder
                const assistantMessageId = Date.now().toString() + Math.random();
                const placeholderMessage: Message = {
                    id: assistantMessageId,
                    role: Role.ASSISTANT,
                    content: '',
                    timestamp: Date.now()
                };

                currentState.messages.push(placeholderMessage);
                setChatState(prev => ({ ...prev, messages: [...currentState.messages] }));

                let lastUiUpdate = 0;

                const finalMessage = await streamMessageToVenice(
                    currentState.messages.slice(0, -1).slice(-15),
                    currentState.systemPrompt,
                    currentState.memories,
                    currentState.inventory,
                    currentState.currency,
                    activeLoc,
                    activeZone,
                    (partialContent, partialReasoning) => {
                        const now = Date.now();
                        if (now - lastUiUpdate > 75) {
                            lastUiUpdate = now;
                            setChatState(prev => {
                                const newMsgs = [...prev.messages];
                                const msgIndex = newMsgs.findIndex(m => m.id === assistantMessageId);
                                if (msgIndex !== -1) {
                                    newMsgs[msgIndex] = { ...newMsgs[msgIndex], content: partialContent, reasoning: partialReasoning };
                                }
                                return { ...prev, messages: newMsgs };
                            });
                        }
                    }
                );

                // Solidify message
                const consolidatedMessage = { ...finalMessage, id: assistantMessageId };
                const finalIndex = currentState.messages.findIndex((m: Message) => m.id === assistantMessageId);

                if (finalIndex !== -1) {
                    currentState.messages[finalIndex] = consolidatedMessage;
                } else {
                    currentState.messages.push(consolidatedMessage);
                }

                // Push final content update
                setChatState(prev => ({ ...prev, messages: currentState.messages }));

                if (consolidatedMessage.toolCalls && consolidatedMessage.toolCalls.length > 0) {
                    for (const toolCall of consolidatedMessage.toolCalls) {
                        const { result, newState } = await executeToolCall(toolCall, currentState);
                        currentState = newState;
                        currentState.isLoading = true;

                        const toolMsg: Message = {
                            id: Date.now().toString() + Math.random(),
                            role: Role.TOOL,
                            content: result,
                            timestamp: Date.now(),
                            toolCallId: toolCall.id,
                            name: toolCall.function.name
                        };
                        currentState.messages.push(toolMsg);

                        setChatState(currentState);
                    }
                } else {
                    turnFinished = true;
                }
            }
            setChatState(prev => ({ ...prev, isLoading: false }));
        } catch (error: any) {
            console.error(error);
            setChatState(prev => ({ ...prev, isLoading: false, error: error.message || "Communication failure." }));
        }
    };

    // --- UI HELPERS ---
    const toggleSettings = () => setChatState(p => ({ ...p, isSettingsOpen: !p.isSettingsOpen, isMemoryOpen: false, isInventoryOpen: false, isMapOpen: false }));
    const toggleMemory = () => setChatState(p => ({ ...p, isMemoryOpen: !p.isMemoryOpen, isSettingsOpen: false, isInventoryOpen: false, isMapOpen: false }));
    const toggleInventory = () => setChatState(p => ({ ...p, isInventoryOpen: !p.isInventoryOpen, isMemoryOpen: false, isSettingsOpen: false, isMapOpen: false }));
    const toggleMap = () => setChatState(p => ({ ...p, isMapOpen: !p.isMapOpen, isInventoryOpen: false, isMemoryOpen: false, isSettingsOpen: false }));
    const closeAllPanels = () => setChatState(p => ({ ...p, isSettingsOpen: false, isMemoryOpen: false, isInventoryOpen: false, isMapOpen: false }));
    const updateSystemPrompt = (newPrompt: string) => setChatState(p => ({ ...p, systemPrompt: newPrompt }));

    // --- STATE MUTATORS (for manual overrides if needed) ---
    const actions = {
        addMemory: (memory: MemoryItem) => setChatState(p => ({ ...p, memories: [...p.memories, memory] })),
        deleteMemory: (id: string) => setChatState(p => ({ ...p, memories: p.memories.filter(m => m.id !== id) })),
        toggleMemoryStatus: (id: string) => setChatState(p => ({ ...p, memories: p.memories.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m) })),
        updateCurrency: (currency: Currency) => setChatState(p => ({ ...p, currency })),
        addInventoryItem: (item: InventoryItem) => setChatState(p => ({ ...p, inventory: [...p.inventory, item] })),
        removeInventoryItem: (id: string) => setChatState(p => ({ ...p, inventory: p.inventory.filter(i => i.id !== id) })),
        toggleEquipItem: (id: string) => setChatState(p => ({ ...p, inventory: p.inventory.map(i => i.id === id ? { ...i, isEquipped: !i.isEquipped } : i) })),
        addLocation: (loc: Location) => setChatState(p => ({ ...p, locations: [...p.locations, loc] })),
        deleteLocation: (id: string) => setChatState(p => ({
            ...p,
            locations: p.locations.filter(l => l.id !== id),
            currentLocationId: p.currentLocationId === id ? null : p.currentLocationId,
            currentZoneId: p.currentLocationId === id ? null : p.currentZoneId
        })),
        addZone: (locId: string, zone: Zone) => setChatState(p => ({
            ...p,
            locations: p.locations.map(l => l.id === locId ? { ...l, zones: [...l.zones, zone] } : l)
        })),
        setCurrentPosition: (locId: string, zoneId: string) => setChatState(p => ({ ...p, currentLocationId: locId, currentZoneId: zoneId }))
    };

    return {
        chatState,
        sendMessage,
        toggleSettings,
        toggleMemory,
        toggleInventory,
        toggleMap,
        closeAllPanels,
        updateSystemPrompt,
        actions
    };
};
