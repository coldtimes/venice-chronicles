import React, { useRef, useEffect, useState } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessageList } from './components/ChatMessageList';
import { Header } from './components/Header';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { MemoryPanel } from './components/MemoryPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { MapPanel } from './components/MapPanel';
import { Loader2 } from 'lucide-react';
import { useChatGame } from './hooks/useChatGame';

const App: React.FC = () => {
  const {
    chatState,
    sendMessage,
    toggleSettings,
    toggleMemory,
    toggleInventory,
    toggleMap,
    closeAllPanels,
    updateSystemPrompt,
    actions
  } = useChatGame();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const prevMsgCount = useRef(chatState.messages.length);

  // --- Smart Auto-Scroll Logic ---
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAutoScrollEnabled(isNearBottom);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: behavior
      });
    }
  };

  useEffect(() => {
    if (isAutoScrollEnabled) {
      const behavior = chatState.messages.length > prevMsgCount.current ? 'smooth' : 'auto';
      scrollToBottom(behavior);
    }
    prevMsgCount.current = chatState.messages.length;
  }, [chatState.messages, chatState.isLoading]);

  const handleSendMessage = (content: string) => {
    // Reset auto-scroll when user sends a message
    setIsAutoScrollEnabled(true);
    sendMessage(content);
  };

  const isAnyPanelOpen = chatState.isMemoryOpen || chatState.isInventoryOpen || chatState.isMapOpen || chatState.isSettingsOpen;

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-zinc-950 to-zinc-950 pointer-events-none z-0"></div>

      <div className="flex flex-col h-full max-w-6xl mx-auto w-full relative z-10 shadow-2xl bg-black/20 border-x border-white/5">
        <Header
          onToggleSettings={toggleSettings}
          isSettingsOpen={chatState.isSettingsOpen}
          onToggleMemory={toggleMemory}
          isMemoryOpen={chatState.isMemoryOpen}
          onToggleInventory={toggleInventory}
          isInventoryOpen={chatState.isInventoryOpen}
          onToggleMap={toggleMap}
          isMapOpen={chatState.isMapOpen}
        />

        <SystemPromptEditor
          isOpen={chatState.isSettingsOpen}
          systemPrompt={chatState.systemPrompt}
          onSystemPromptChange={updateSystemPrompt}
          onClose={closeAllPanels}
        />

        <MemoryPanel
          isOpen={chatState.isMemoryOpen}
          memories={chatState.memories}
          onAddMemory={actions.addMemory}
          onDeleteMemory={actions.deleteMemory}
          onToggleStatus={actions.toggleMemoryStatus}
          onClose={closeAllPanels}
        />

        <InventoryPanel
          isOpen={chatState.isInventoryOpen}
          inventory={chatState.inventory}
          currency={chatState.currency}
          onUpdateCurrency={actions.updateCurrency}
          onAddItem={actions.addInventoryItem}
          onRemoveItem={actions.removeInventoryItem}
          onToggleEquip={actions.toggleEquipItem}
          onClose={closeAllPanels}
        />

        <MapPanel
          isOpen={chatState.isMapOpen}
          locations={chatState.locations}
          currentLocationId={chatState.currentLocationId}
          currentZoneId={chatState.currentZoneId}
          onAddLocation={actions.addLocation}
          onDeleteLocation={actions.deleteLocation}
          onAddZone={actions.addZone}
          onSetCurrentPosition={actions.setCurrentPosition}
          onClose={closeAllPanels}
        />

        <main
          className="flex-1 overflow-hidden flex flex-col relative z-0 transition-all duration-500 ease-in-out"
          onClick={() => { if (isAnyPanelOpen) closeAllPanels(); }}
        >
          <div
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 "
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <ChatMessageList messages={chatState.messages} />

            {chatState.isLoading && (
              <div className="flex justify-start mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-start max-w-[80%] lg:max-w-[70%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mr-4 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
                    <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 text-zinc-300 rounded-tl-none shadow-sm">
                    <div className="flex gap-2 h-5 items-center">
                      <span className="text-xs text-indigo-300 font-medium tracking-wide">WEAVING FATE</span>
                      <div className="flex gap-1 ml-1">
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {chatState.error && (
              <div className="flex justify-center my-4">
                <div className="bg-red-950/50 backdrop-blur-sm border border-red-900/50 text-red-200 px-6 py-4 rounded-xl text-sm flex items-center shadow-lg max-w-lg">
                  {chatState.error}
                </div>
              </div>
            )}

          </div>
        </main>

        <footer className="p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-10 transition-all duration-500">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} disabled={chatState.isLoading} />
            <p className="text-center text-zinc-600/60 text-[10px] mt-4 font-medium tracking-widest uppercase">
              Venice AI &bull; zai-org-glm-4.7
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;