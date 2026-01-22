Hey there, adventurer! Ever dreamed of diving into a story where *your* choices truly matter? Well, get ready for **Venice Chronicles**!

This isn't just any game; it's an AI-powered interactive RPG that cooks up epic, immersive tales on the fly, all thanks to the clever folks at Venice AI.

*   **Your Story, Your Way**: The AI is your personal Dungeon Master, crafting a narrative that bends and twists with every decision you make.
*   **Gear Up!**: Just like any good RPG, you've got a full inventory system – equip your best gear and keep your backpack stocked!
*   **Explore & Discover**: Venture through different locations with a "fog of war" map, uncovering new secrets as you go.
*   **A Mind of its Own**: The AI remembers everything – characters, places, items, lore – weaving a rich, consistent world around you.
*   **Real-time Everything**: Watch your inventory, money, and the environment update instantly as you play.
*   **Smooth Storytelling**: No jarring pauses here; the story streams in naturally, making for a truly seamless experience.

**Ready to Jump In?**

It's super easy to get started:

**First, the essentials:**

*   **Node.js** (version 16 or newer)
*   **npm** (it comes with Node.js)
*   Your very own **Venice AI API Key** (grab one at [venice.ai](https://venice.ai/))

**Let's get set up:**

1.  **Get the goods**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/venice-chronicles.git
    cd venice-chronicles
    ```
2.  **Install everything**:
    ```bash
    npm install
    ```
3.  **Plug in your key**:
    *   Open the `.env.local` file.
    *   Swap out `your-api-key-here` with your actual Venice AI API key:
        ```
        VITE_VENICE_API_KEY=your-api-key-here
        ```
4.  **Start your adventure!**
    *   **Windows folks**: Just double-click `start.bat`.
    *   **Command Line wizards**: Type `npm run dev`.

The game will magically pop open in your browser at `http://localhost:5173`.

**Want to Tweak Things?**

Head over to `constants.ts` to customize:

*   **Game Rules**: Fine-tune inventory, physics, and navigation.
*   **World Vibe**: Set the default tone and style of your narrative.
*   **AI Brain**: Pick your preferred AI model (currently `zai-org-glm-4.7`).

**Under the Hood:**

We're running on:

*   **Frontend**: React 18 + TypeScript (snappy and robust!)
*   **Style**: Tailwind CSS 3 (looks great, feels great)
*   **AI Magic**: Venice AI (works just like OpenAI)
*   **Building Block**: Vite 5 (super fast builds)
*   **Desktop Fun**: Electron 29 (if you want it as a desktop app!)

**License:** This project is open-source under the MIT License.

**Got Ideas?** We'd love your contributions! Feel free to send a Pull Request our way.

**Need a Hand?** If you run into any snags or have questions, just open an issue on GitHub.

---

**Venice Chronicles: Powered by [Venice AI](https://venice.ai/)** – where privacy meets uncensored AI creativity.

**How Does the AI Weave its Magic?**

It's all about a clever "tool-calling" system where the AI takes on the role of your narrator and game master:

1.  **Storyteller Extraordinaire**: The AI crafts story responses based on what you do.
2.  **Action Time**: It calls functions to:
    *   Give your character starting gear.
    *   Add or remove items from your inventory.
    *   Manage your gold, silver, and copper.
    *   Create and let you explore different locations.
    *   Remember all the important characters, places, and lore.
3.  **Always Up-to-Date**: Everything changes in real-time, thanks to React.
4.  **Natural Flow**: The story text streams in smoothly, just like a human narrator is telling you a tale.

**Developer Goodies:**

*   `npm run dev` - Start your development server
*   `npm run build` - Build the project for prime-time
*   `npm run preview` - Sneak a peek at your production build
*   `npm run electron:dev` - Run it as a desktop app
*   `npm run electron:build` - Create a desktop installer

**Project Structure (for the curious):**

```
venice-chronicles/
├── components/          # Your UI building blocks
│   ├── ChatInput.tsx
│   ├── ChatMessageList.tsx
│   ├── Header.tsx
│   ├── InventoryPanel.tsx
│   ├── MapPanel.tsx
│   └── MemoryPanel.tsx
├── hooks/              # Custom React magic
│   └── useChatGame.ts  # The heart of your game logic
├── services/           # The brains behind the operations
│   ├── veniceService.ts   # Venice AI connection
│   └── toolService.ts     # Game mechanics & tools
├── App.tsx             # The main stage
├── types.ts            # All your TypeScript definitions
├── constants.ts        # Game rules & AI prompts
└── index.css           # Global style vibes
```
