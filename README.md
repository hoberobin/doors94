# doors94

A Windows 95-style sandbox for learning AI agent design through hands-on experimentation. Create, test, and compare custom AI agents in a nostalgic retro computing environment.

![doors94](https://img.shields.io/badge/doors94-v0.1.0-blue)

## Overview

doors94 is an educational playground disguised as a fake operating system. Learn how to design AI agents by creating, tweaking, testing, and comparing small, single-purpose agents. Experiment with prompts, see how they shape agent behavior, and understand the fundamentals of AI agent design through hands-on play — all inside a familiar retro desktop.

## Features

- **Built-in example agents**: PirateMatey.exe, Haiku.sys, Reviewer.bat, and ELI5.dll ship ready to chat and compare. Remix any of them into an editable copy.
- **Agent Creator**: Build custom AI agents with a step-by-step wizard, or start from an example
- **Playground**: Compare an agent with raw GPT side by side, with sample prompts and a "Show prompt" toggle that reveals the exact system prompt
- **Streaming chat**: Replies stream in token by token, with markdown rendering and a Stop button
- **Conversation memory**: Each agent's chat picks up where you left off; "New chat" starts over
- **Manage Agents**: Edit, remix, duplicate, and delete your agents
- **Windows 95 UI**: Boot screen, Start menu, taskbar clock, draggable and resizable windows, maximize, and a first-run Welcome window
- **Built-in Tutorial Agent**: Learn the system with an interactive guide
- **Real-time Validation**: See validation errors as you build agents

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hoberobin/doors94.git
cd doors94
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Project

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage Guide

### Getting Started

1. **Open the app**: Visit the root URL to see the landing page, then click **“Launch doors94”** to boot into the Windows 95-style desktop at `/app`.

2. **Look around**: The first boot opens a **Welcome** window with three one-click next steps. The **Start** menu lists every program and agent, and double-clicking **“Tutorial”** opens a built-in guide that only talks about doors94.

3. **Create Your First Agent**: Double-click **“Agent Creator”** to open the creation wizard:
   - **Step 1**: Enter basic information (name, description, icon)
   - **Step 2**: Define the agent's purpose
   - **Step 3**: Add behavior rules (optional)
   - **Step 4**: Choose tone and output style
   - **Step 5**: Preview the compiled system prompt and save

4. **Test Your Agent**: A chat window opens as soon as you save. Replies stream in; press Stop to cut one short, or **New chat** to start over. Closing and reopening the window keeps the conversation.

5. **Compare in Playground**: Open the **Playground** to compare your agent's responses with raw GPT side-by-side. Click a **Try:** prompt or type your own, and use **Show prompt** to see the exact system prompt being sent. (The built-in **Tutorial** helper agent is hidden from this dropdown.)

6. **Manage Agents**: Use the **Manage Agents** window to edit, duplicate, or delete your agents. Built-in examples are read-only, but **Remix** gives you an editable copy to tweak.

### Creating Agents

#### Agent Manifest Fields

Each agent is defined by a **manifest** - a structured description that compiles into a system prompt:

- **Name**: Display name for your agent (appears on desktop)
- **Description**: Brief description of what the agent does
- **Icon**: Emoji or character to represent the agent
- **Purpose**: Core mission statement (required) - what the agent does in 1-2 sentences
- **Rules**: "Always" or "never" statements to constrain behavior (optional)
- **Tone**: Communication style - serious, friendly, playful, or blunt
- **Output Style**: Formatting and length guidelines (optional)

#### Tips for Good Agent Design

- **Clear Purpose**: A single, focused purpose works better than trying to do everything
- **Specific Rules**: Use "always" and "never" statements to create predictable behavior
- **Match Tone**: Choose a tone that fits the agent's purpose (serious for PM, playful for creative)
- **Test & Iterate**: Create an agent, test it in Playground, refine the manifest, repeat

### Using the Playground

The Playground lets you compare responses side-by-side:

1. Select an agent from the dropdown
2. Enter a message, or click one of the **Try:** sample prompts
3. Click "Compare" (or press Cmd/Ctrl+Enter); both sides stream at once
4. See the raw GPT response on the left and your agent's response on the right
5. Click **Show prompt** to read the compiled system prompt behind the right pane

This is the core learning mechanism - see how prompts shape behavior!

### Window Management

All windows support:
- **Moving**: Click and drag the title bar
- **Resizing**: Drag the bottom-right corner
- **Maximizing**: Click the "□" button or double-click the title bar
- **Minimizing**: Click the "_" button; click the taskbar button to bring it back
- **Closing**: Click the "×" button
- **Focusing**: Click anywhere on the window or use the taskbar

Window positions are remembered between visits. **Start → Reset window layout** clears them.

## Project Structure

```
doors94/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # OpenAI API integration
│   │   ├── layout.tsx                # Root layout and metadata
│   │   ├── page.tsx                  # Landing page
│   │   └── app/page.tsx              # The desktop at /app: window state, z-order, boot, first run
│   ├── components/
│   │   ├── AgentChatWindow.tsx       # Streaming chat with conversation memory
│   │   ├── AgentCreatorWindow.tsx    # Agent creation wizard
│   │   ├── BootScreen.tsx            # Boot splash shown once per tab session
│   │   ├── Desktop.tsx               # Desktop icons
│   │   ├── ManageAgentsWindow.tsx    # Agent management
│   │   ├── Markdown.tsx              # Minimal markdown renderer for replies
│   │   ├── PlaygroundWindow.tsx      # Side-by-side comparison
│   │   ├── ReadMeWindow.tsx          # Built-in help
│   │   ├── StartMenu.tsx             # Start menu
│   │   ├── Taskbar.tsx               # Taskbar with Start button and clock
│   │   ├── WelcomeWindow.tsx         # First-run welcome
│   │   └── Win95Window.tsx           # Reusable window frame
│   ├── lib/
│   │   ├── agentManifest.ts          # Agent manifest types, validation, prompt compiler
│   │   ├── agentStorage.ts           # localStorage management for agents
│   │   ├── apps.ts                   # The desktop programs (ids, icons, default sizes)
│   │   ├── builtinAgents.ts          # Tutorial + example agents
│   │   ├── chatClient.ts             # Streaming client for /api/chat
│   │   ├── conversationStorage.ts    # Per-agent conversation history
│   │   └── windowStorage.ts          # Saved window layout, first-run and boot flags
│   └── styles/
│       └── globals.css               # Windows 95 styling
├── .env.example                      # Environment variable template
├── next.config.js                    # Next.js configuration
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: CSS with CSS Variables
- **AI**: OpenAI API (gpt-4o-mini)
- **Storage**: Browser localStorage

## How It Works

1. **Agent Manifests**: Agents are defined as structured JSON objects (manifests)
2. **Prompt Compilation**: Manifests are compiled into system prompts using `buildSystemPrompt()`
3. **API Integration**: The `/api/chat` route calls OpenAI with or without a system prompt and streams the reply back as plain text
4. **Storage**: User-created agents are stored in browser localStorage
5. **UI**: Windows 95-style interface built with React and CSS

## What You'll Learn

By using doors94, you'll understand:

- How system prompts shape AI behavior
- The relationship between structured descriptions and prompt engineering
- How different prompt components (purpose, rules, tone) affect responses
- Best practices for designing single-purpose, predictable agents

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE). You are welcome to read the code, fork it, and adapt doors94 for your own tools, teaching demos, or experiments.

## Acknowledgments

- Inspired by Windows 95's iconic interface
- Built with Next.js and React
- Powered by OpenAI's GPT models

## Support

If you encounter any issues or have questions, please open an issue or start a discussion on GitHub — feedback and ideas are very welcome.

---

**Have fun experimenting with agent design!** 🚀



