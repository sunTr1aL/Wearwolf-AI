# Wearwolf-AI

Wearwolf-AI is an online, real-time implementation of the social deduction game 狼人杀 (Werewolf), with support for AI players and human players in the same lobby.

The app lets you:

- Create a room and configure a custom role pool
- Invite friends via a shareable room link
- Play with both human and AI players
- Use strict, timed, turn-based speaking phases (voice handled outside the app)
- Play in English or Chinese UI
- Use advanced roles and sheriff / “上警” mechanics

---

## Features

### Core Gameplay

- Real-time, browser-based multi-player Werewolf game
- Room system:
  - Create a room as host
  - Configure player count and role composition
  - Share an invite link so others can join
- AI players:
  - Fill empty seats with AI bots
  - Mix AI and human players in the same game
- Room member list:
  - Shows all players in the room (human + AI)
  - Shows which player is the host

### Roles

Includes classic and extended 狼人杀 roles (exact rules depend on configuration):

- **Villager**
- **Werewolf**
- **Seer / 预言家**
- **Witch / 女巫**
- **Hunter / 猎人**

Extended roles (optional, configurable per room):

- **Guardian / 守卫**
- **Idiot / 白痴**
- **White Wolf King / 白狼王**
- **Wolf Beauty / 狼美人**
- **Cupid / 爱神**
- **Sheriff / 警长** with “上警” election flow

Sheriff mechanics:

- First-day “上警” phase:
  - Players choose whether to campaign for sheriff
  - Candidates speak in order, under time limit
  - All players vote for sheriff
- Sheriff abilities:
  - Controls/anchors day speaking order
  - Has weighted vote during executions
  - Can pass or destroy badge on death (depending on rules)

### Multi-language UI

- Supports **Chinese** and **English** UI
- Each player can choose their own UI language
- System messages (phase changes, timers, speaking turn, etc.) are localized per player

### Speaking & Voice Rules

- The game UI itself is **text-only**:
  - Bot / system communicates solely via text
  - Player communication is assumed to be via **voice** (e.g. Discord / in-person)
- Strict turn-based speaking:
  - Only **one player at a time** is allowed to speak (per game rules)
  - UI shows whose turn it is
  - Other players cannot “speak” in-game while it’s not their turn (no text chat)
- **Per-turn 60-second timer**:
  - Each speaking turn is capped at 60 seconds
  - At the last 10 seconds, the app shows a special “10 seconds left” warning
  - When time is up, turn automatically passes to the next player

### Room Invitations

- When a host creates a room:
  - Server generates a unique **invite link** for the room
  - Anyone with the link can join as a player (while the game hasn’t started and the room is not full)
- Joining via link:
  - Player chooses a nickname
  - Player chooses UI language (English/Chinese)
  - Player enters the room and appears in the room member list

---

## Project Structure

> **Note:** The exact structure may vary slightly; check this section against your repository layout and adjust as needed.

A typical layout looks like:

```text
Wearwolf-AI/
  frontend/        # Web client (React/Vue/etc.)
  backend/         # Game server (Node.js, WebSocket, game state)
  package.json     # Or per-folder package.json files
  README.md
  ...
