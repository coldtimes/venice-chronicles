# Venice Chronicles

An AI-powered interactive storytelling RPG that creates dynamic, immersive narratives powered by the Venice AI platform.

![Venice Chronicles](https://img.shields.io/badge/Powered%20by-Venice%20AI-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6)

## 🎮 Features

- **Dynamic Storytelling**: AI-driven narrative that adapts to your choices
- **Inventory System**: Full RPG-style item management with equipped gear and backpack
- **Map & Navigation**: Multi-room location system with fog of war exploration
- **Memory System**: AI remembers characters, places, items, and lore throughout your journey
- **Tool-Based Mechanics**: Real-time inventory, currency, and environment updates
- **Streaming Responses**: Smooth, real-time story generation

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Venice AI API Key** ([Get one here](https://venice.ai/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/venice-chronicles.git
cd venice-chronicles
```

2. Install dependencies:
```bash
npm install
```

3. Set up your API key:
   - Open `.env.local`
   - Replace the placeholder with your Venice AI API key:
   ```
   VITE_VENICE_API_KEY=your-api-key-here
   ```

4. Start the app:
   - **Windows**: Double-click `start.bat`
   - **Command Line**: `npm run dev`

The app will automatically open in your default browser at `http://localhost:5173`

## 📁 Project Structure

```
venice-chronicles/
├── components/          # React UI components
│   ├── ChatInput.tsx
│   ├── ChatMessageList.tsx
│   ├── Header.tsx
│   ├── InventoryPanel.tsx
│   ├── MapPanel.tsx
│   └── MemoryPanel.tsx
├── hooks/              # Custom React hooks
│   └── useChatGame.ts  # Main game logic hook
├── services/           # API and business logic
│   ├── veniceService.ts   # Venice AI integration
│   └── toolService.ts     # Game mechanics & tools
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── constants.ts        # Game mechanics & prompts
└── index.css           # Global styles
```

## 🎯 How It Works

Venice Chronicles uses a sophisticated tool-calling system where the AI acts as the narrator and game master:

1. **Narrative Engine**: The AI generates story responses based on your input
2. **Tool Execution**: The AI calls functions to:
   - Initialize your character with starting gear
   - Add/remove inventory items when you find or lose them
   - Update currency (gold, silver, copper)
   - Create and navigate multi-room locations
   - Record important NPCs, places, and lore
3. **State Management**: All changes persist in real-time through React state
4. **Streaming**: Story text streams in naturally, like a human narrator

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run electron:dev` - Run as Electron desktop app
- `npm run electron:build` - Build desktop installer

## 🔧 Configuration

Edit `constants.ts` to customize:
- **Core Mechanics**: Rules about inventory, physics, navigation
- **World Setting**: Default narrative style and tone
- **Model Settings**: AI model selection (currently `zai-org-glm-4.7`)

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **AI**: Venice AI (OpenAI-compatible API)
- **Build**: Vite 5
- **Desktop**: Electron 29 (optional)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Powered by [Venice AI](https://venice.ai/)** - Privacy-focused, uncensored AI platform
