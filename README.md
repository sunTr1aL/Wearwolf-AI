
# Werewolf AI (狼人杀)

A modern, web-based implementation of the classic social deduction game **Werewolf** (Mafia). This application features a robust Single Player mode with AI opponents powered by Google's Gemini API, as well as a real-time Multiplayer mode for playing with friends.

## Features

*   **Single Player Mode**: Play against 11 AI bots that vote, use abilities, and chat using natural language generation (Gemini).
*   **Multiplayer Mode**: Host a room and invite friends via a Room ID.
*   **Hybrid AI**: Fill empty multiplayer slots with AI bots to fill the roster.
*   **Roles Included**:
    *   Villager, Werewolf, Seer, Witch, Hunter, Guardian, Idiot, White Wolf King, Wolf Beauty, Cupid.
*   **Game Mechanics**:
    *   Real-time Day/Night cycles.
    *   Sheriff Elections with weighted voting (1.5x).
    *   Sheriff Badge handover or destruction logic.
    *   Secret chat channels (Werewolf night chat, Dead player chat).
    *   Host-controlled game flow.
*   **Bilingual Support**: Full support for English and Chinese (Simplified).

## Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS.
*   **Backend**: Node.js, Express, Socket.io.
*   **AI**: Google Gemini API (`@google/genai`).

## Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [npm](https://www.npmjs.com/) or yarn
*   A **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/))

## Installation

1.  **Clone the repository** (or download the source files).
2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

To enable the AI bots' chatting capabilities, you must configure your API key.

1.  Create a `.env` file in the root directory (or set environment variables in your deployment platform).
2.  Add your Google API Key:
    ```env
    API_KEY=your_actual_api_key_here
    ```

## Running the Application

To play Multiplayer, you need to run the backend server. For Single Player, the React app alone is sufficient (though some build setups requires the server context).

### 1. Start the Multiplayer Server
The server handles game state synchronization and socket connections.

```bash
# Using ts-node (recommended for dev)
npx ts-node server.ts

# OR if compiled to JS
node dist/server.js
```
*The server runs on port `3000` by default.*

### 2. Start the Client (Frontend)
Open a new terminal window to run the React application.

```bash
npm start
# OR depending on your bundler (Vite, Parcel, etc.)
npm run dev
```

Open your browser to `http://localhost:1234` (or whatever port your bundler uses).

## How to Play

### Hosting a Local Game (Multiplayer)

1.  Ensure the **Server** is running (`npx ts-node server.ts`).
2.  Open the **Client** in your browser.
3.  Select **Multiplayer**.
4.  Enter your **Nickname**.
5.  Leave the "Room ID" field **empty** and click **Create Room**.
6.  Share the generated **Room ID** (displayed in the Lobby) with your friends.
7.  (Optional) Click **Add Bot** to fill empty seats with AI players.
8.  Adjust role counts using the controls at the bottom.
9.  Click **Start Game**.

### Joining a Game

1.  Select **Multiplayer**.
2.  Enter your **Nickname**.
3.  Enter the **Room ID** provided by the host.
4.  Click **Join Room**.

### Single Player

1.  Select **Single Player** on the main screen.
2.  Enter your Nickname and click **Start Game**.
3.  The game runs entirely in your browser. AI bots will simulate server logic and chat automatically.

## Game Rules & Mechanics

*   **Night Phase**: Werewolves choose a victim. Seer checks identities. Witch uses potions. Guardian protects.
*   **Day Phase**:
    *   **Election**: Players can run for Sheriff (1.5x vote weight).
    *   **Discussion**: Players speak in turn.
    *   **Voting**: Majority vote eliminates a player.
    *   **Death**: Dead players can chat with other dead players (and the Host), but cannot talk to the living.
