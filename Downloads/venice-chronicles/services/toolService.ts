import { ChatState, InventoryItem, Location, Zone, MemoryItem } from '../types';

export const executeToolCall = async (
    toolCall: any,
    currentState: ChatState
): Promise<{ result: string, newState: ChatState }> => {
    const fnName = toolCall.function.name;

    // Safely parse arguments
    let args: any = {};
    try {
        args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
        return { result: "Error: Failed to parse tool arguments.", newState: currentState };
    }

    // Create a deep copy to modify
    const nextState = structuredClone(currentState);

    if (fnName === 'initialize_character') {
        const { items, gold, silver, copper } = args;
        const safeItems = Array.isArray(items) ? items : [];

        const newItems: InventoryItem[] = safeItems.map((item: any) => ({
            id: Date.now().toString() + Math.random().toString(),
            name: item.name,
            type: item.type || 'Material',
            description: item.description || 'Starting equipment.',
            quantity: item.quantity || 1,
            isEquipped: item.isEquipped || false
        }));

        nextState.inventory = newItems;
        nextState.currency = {
            gold: gold || 0,
            silver: silver || 0,
            copper: copper || 0
        };

        return {
            result: `Character initialized. Inventory: ${newItems.length} items. Wallet: ${nextState.currency.gold}G ${nextState.currency.silver}S ${nextState.currency.copper}C.`,
            newState: nextState
        };
    }
    else if (fnName === 'manage_inventory') {
        const { action, item_name, item_type, quantity = 1, description } = args;

        if (action === 'add') {
            const newItem: InventoryItem = {
                id: Date.now().toString() + Math.random().toString(),
                name: item_name,
                type: item_type || 'Material',
                quantity: quantity,
                description: description || 'No description provided.',
                isEquipped: false
            };

            // Check for existing stackable item (same name and type)
            const existing = nextState.inventory.find((i: InventoryItem) => i.name.toLowerCase() === item_name.toLowerCase() && i.type === newItem.type);

            if (existing) {
                existing.quantity += quantity;
                return { result: `Added ${quantity} to existing stack of ${item_name}.`, newState: nextState };
            } else {
                nextState.inventory.push(newItem);
                return { result: `Added ${quantity}x ${item_name} (${newItem.type}) to backpack.`, newState: nextState };
            }
        }
        else if (action === 'remove') {
            const targetIndex = nextState.inventory.findIndex((i: InventoryItem) => i.name.toLowerCase() === item_name.toLowerCase());
            if (targetIndex === -1) return { result: `Error: Item '${item_name}' not found in inventory. Cannot remove.`, newState: currentState };

            const target = nextState.inventory[targetIndex];
            if (target.quantity <= quantity) {
                nextState.inventory.splice(targetIndex, 1);
                return { result: `Removed all ${item_name}.`, newState: nextState };
            } else {
                target.quantity -= quantity;
                return { result: `Removed ${quantity} from ${item_name}.`, newState: nextState };
            }
        }
        else if (action === 'equip' || action === 'unequip') {
            const target = nextState.inventory.find((i: InventoryItem) => i.name.toLowerCase() === item_name.toLowerCase());
            if (!target) return { result: `Error: Item '${item_name}' not found.`, newState: currentState };

            target.isEquipped = (action === 'equip');
            return { result: `${action === 'equip' ? 'Equipped' : 'Unequipped'} ${item_name}.`, newState: nextState };
        }
    }
    else if (fnName === 'update_currency') {
        const { gold_delta = 0, silver_delta = 0, copper_delta = 0 } = args;
        nextState.currency.gold = Math.max(0, nextState.currency.gold + gold_delta);
        nextState.currency.silver = Math.max(0, nextState.currency.silver + silver_delta);
        nextState.currency.copper = Math.max(0, nextState.currency.copper + copper_delta);

        return {
            result: `Wallet updated. New Balance: ${nextState.currency.gold}G ${nextState.currency.silver}S ${nextState.currency.copper}C`,
            newState: nextState
        };
    }
    else if (fnName === 'create_map_location') {
        const { location_name, zones, start_zone_id } = args;
        const safeZones = Array.isArray(zones) ? zones : [];
        const cleanName = (location_name || '').toLowerCase().trim();

        // --- SMART MERGE LOGIC ---
        // 1. Check if the start_zone_id exists in ANY known location.
        let targetLocationIndex = nextState.locations.findIndex((l: Location) =>
            l.zones.some(z => z.id === start_zone_id)
        );

        // 2. If not found by ID, check by fuzzy name
        if (targetLocationIndex === -1) {
            targetLocationIndex = nextState.locations.findIndex((l: Location) => {
                const lName = l.name.toLowerCase().trim();
                return lName === cleanName || lName.includes(cleanName) || cleanName.includes(lName);
            });
        }

        if (targetLocationIndex !== -1) {
            // MERGE MODE
            const existingLoc = nextState.locations[targetLocationIndex];

            if (location_name && location_name.length > existingLoc.name.length) {
                existingLoc.name = location_name;
            }

            safeZones.forEach((z: any) => {
                const existingZone = existingLoc.zones.find((ez: Zone) => ez.id === z.id);
                if (existingZone) {
                    existingZone.name = z.name || existingZone.name;
                    existingZone.description = z.description || existingZone.description;
                    existingZone.connections = Array.isArray(z.connections) ? z.connections : existingZone.connections;
                    if (z.id === start_zone_id) existingZone.isExplored = true;
                } else {
                    existingLoc.zones.push({
                        id: z.id,
                        name: z.name || "Unknown Room",
                        description: z.description || "...",
                        connections: Array.isArray(z.connections) ? z.connections : [],
                        isExplored: z.id === start_zone_id
                    });
                }
            });

            nextState.currentLocationId = existingLoc.id;
            nextState.currentZoneId = start_zone_id;

            return {
                result: `Map updated. Merged ${safeZones.length} zones into '${existingLoc.name}'. Player at ${start_zone_id}.`,
                newState: nextState
            };
        }

        // CREATE NEW MODE
        const newLocationId = Date.now().toString();
        const newLocation: Location = {
            id: newLocationId,
            name: location_name || "Unknown Location",
            zones: safeZones.map((z: any) => ({
                id: z.id,
                name: z.name || "Unknown Room",
                description: z.description || "...",
                connections: Array.isArray(z.connections) ? z.connections : [],
                isExplored: z.id === start_zone_id
            }))
        };

        nextState.locations.push(newLocation);
        nextState.currentLocationId = newLocationId;
        nextState.currentZoneId = start_zone_id;

        return {
            result: `Generated new map '${location_name}' with ${safeZones.length} zones. Player placed in ${start_zone_id}.`,
            newState: nextState
        };
    }
    else if (fnName === 'update_zone_description') {
        const { description, zone_id } = args;
        const targetZoneId = zone_id || nextState.currentZoneId;

        let zoneFound = false;
        let locName = "";

        for (const loc of nextState.locations) {
            const z = loc.zones.find((z: Zone) => z.id === targetZoneId);
            if (z) {
                z.description = description;
                zoneFound = true;
                locName = loc.name;
                break;
            }
        }

        if (zoneFound) {
            return { result: `Description updated for zone ${targetZoneId} in ${locName}.`, newState: nextState };
        } else {
            return { result: `Error: Zone ${targetZoneId} not found. Cannot update description.`, newState: currentState };
        }
    }
    else if (fnName === 'navigate') {
        const { target_zone_id, reason } = args;
        const currentLoc = nextState.locations.find((l: Location) => l.id === nextState.currentLocationId);

        if (!currentLoc) return { result: "Error: Player is not in a valid location.", newState: currentState };

        const targetZone = currentLoc.zones.find((z: Zone) => z.id === target_zone_id);
        if (!targetZone) return { result: "Error: Target zone ID not found in current location.", newState: currentState };

        const currentZone = currentLoc.zones.find((z: Zone) => z.id === nextState.currentZoneId);
        if (currentZone) {
            const safeConnections = Array.isArray(currentZone.connections) ? currentZone.connections : [];
            if (!safeConnections.includes(target_zone_id)) {
                // Soft fail: Allow it but warn, or hard fail? 
                // The original code returned a failure message to the AI.
                return {
                    result: `Movement Failed: The zone '${currentZone.name}' is not connected to '${targetZone.name}' (ID: ${target_zone_id}). Valid exits: ${safeConnections.join(', ') || "None"}.`,
                    newState: currentState
                };
            }
        }

        targetZone.isExplored = true;
        nextState.currentZoneId = targetZone.id;

        return {
            result: `Player moved to ${targetZone.name}. Zone marked explored. Reason: ${reason}`,
            newState: nextState
        };
    }
    else if (fnName === 'upsert_memory') {
        const { category, name, description, isEnabled = true } = args;

        const VALID_CATEGORIES = ["Character", "Place", "Item", "Lore", "Other"];
        if (!VALID_CATEGORIES.includes(category)) {
            return { result: `Error: Invalid category '${category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`, newState: currentState };
        }

        const cleanCategory = category as MemoryItem["category"];
        const cleanName = (name || "").trim();
        const cleanDesc = (description || "").trim();

        if (!cleanCategory || !cleanName || !cleanDesc) {
            return { result: "Error: upsert_memory missing required fields.", newState: currentState };
        }

        // Smart Merge Helper
        const normalizeLine = (line: string) =>
            line.replace(/^[-•*]\s*/, "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

        const mergeDossier = (oldDesc: string, newDesc: string) => {
            const oldLines = (oldDesc || "").split("\n").map(s => s.trim()).filter(Boolean);
            const newLines = (newDesc || "").split("\n").map(s => s.trim()).filter(Boolean);
            const normalizedOld = new Set(oldLines.map(normalizeLine));
            const merged = [...oldLines];

            for (const line of newLines) {
                const key = normalizeLine(line);
                if (!key) continue;
                if (!normalizedOld.has(key)) {
                    merged.push(line);
                    normalizedOld.add(key);
                }
            }
            return merged.slice(0, 15).join("\n");
        };

        const existing = nextState.memories.find(m =>
            m.category === cleanCategory &&
            m.name.toLowerCase().trim() === cleanName.toLowerCase()
        );

        if (existing) {
            existing.description = mergeDossier(existing.description, cleanDesc);
            existing.isEnabled = Boolean(isEnabled);
            return {
                result: `Memory updated: [${cleanCategory}] ${existing.name}. Facts merged.`,
                newState: nextState
            };
        }

        nextState.memories.push({
            id: Date.now().toString() + Math.random().toString(),
            category: cleanCategory,
            name: cleanName,
            description: cleanDesc,
            isEnabled: Boolean(isEnabled)
        });

        return {
            result: `Memory saved: [${cleanCategory}] ${cleanName}`,
            newState: nextState
        };
    }

    return { result: `Error: Unknown function called: ${fnName}`, newState: currentState };
};
