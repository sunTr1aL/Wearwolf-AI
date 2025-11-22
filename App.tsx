

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import {
  GamePhase,
  RoleType,
  Player,
  GameState,
  Language,
} from './types';
import { ROLES, PHASE_DURATION, AVATARS, TEXT } from './constants';
import PlayerCard from './components/PlayerCard';
import Chat from './components/Chat';
import { generateBotChatter } from './services/geminiService';
import { getBotVote, processBotNightActions, getBotSheriffHandover } from './services/botLogic';

// --- Icons ---
const MicOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.5v3a.75.75 0 0 1-1.5 0v-3a6.751 6.751 0 0 1-6-6.5v-1.5A.75.75 0 0 1 6 10.5Z" /></svg>;
const MicOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10.435 2.76a3.75 3.75 0 0 1 4.335 5.345l-4.335-4.335ZM4.95 4.05a.75.75 0 1 1 1.06-1.06l13.88 13.88a.75.75 0 0 1-1.06 1.06l-3.68-3.68a6.75 6.75 0 0 1-8.4-6.5v-1.5a.75.75 0 0 1 1.5 0v1.5a5.25 5.25 0 0 0 5.9 5.18l-1.94-1.94a3.751 3.751 0 0 1-1.26-2.91v-4.94Z" /></svg>;
const SoundOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" /><path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" /></svg>;
const SoundOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.57 16.476c-.22.382-.492.737-.809 1.06a.75.75 0 0 1-1.06-1.06c.217-.223.406-.468.562-.73a.75.75 0 0 1 1.307.73ZM17.25 10.018l-1.647 1.646a.75.75 0 0 1-1.06-1.06l1.646-1.647a.75.75 0 0 1 1.061 1.061Z" /></svg>;
const InstructionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.918 0-2.645ZM12 15.75a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" /></svg>;


// --- Helpers ---

const createInitialPlayers = (userName: string, roleConfig: Record<RoleType, number>): Player[] => {
  // Offline mode generator (Unchanged logic)
  const players: Player[] = [];
  const roleDeck: RoleType[] = [];
  Object.entries(roleConfig).forEach(([role, count]) => {
    for(let i=0; i<count; i++) roleDeck.push(role as RoleType);
  });
  for (let i = roleDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roleDeck[i], roleDeck[j]] = [roleDeck[j], roleDeck[i]];
  }
  const totalPlayers = roleDeck.length;
  players.push({
    id: 'player-user',
    name: userName,
    role: roleDeck[0],
    isAlive: true,
    isBot: false,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=User',
    votesReceived: 0,
    votedFor: null,
    isSheriff: false,
    isProtected: false,
    isPoisoned: false,
    isLinked: false,
    loverId: null,
    isExposed: false,
    hasActed: false,
    isHost: true,
    isOnline: true,
    isSpectator: false
  });
  const botNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia'];
  for(let i=1; i<totalPlayers; i++) {
    players.push({
      id: `player-bot-${i}`,
      name: botNames[(i-1) % botNames.length],
      role: roleDeck[i],
      isAlive: true,
      isBot: true,
      avatar: AVATARS[i % AVATARS.length],
      votesReceived: 0,
      votedFor: null,
      isSheriff: false,
      isProtected: false,
      isPoisoned: false,
      isLinked: false,
      loverId: null,
      isExposed: false,
      hasActed: false,
      isHost: false,
      isOnline: true,
      isSpectator: false
    });
  }
  return players;
};

const App: React.FC = () => {
  // --- Local Settings State ---
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [serverUrl, setServerUrl] = useState(() => {
    // If running in browser, try to infer backend URL if on same host
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  });
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasApiKey] = useState(!!process.env.API_KEY);
  
  // Local role counts for offline mode
  const [offlineRoleCounts, setOfflineRoleCounts] = useState<Record<RoleType, number>>({
    [RoleType.WEREWOLF]: 3,
    [RoleType.VILLAGER]: 3,
    [RoleType.SEER]: 1,
    [RoleType.WITCH]: 1,
    [RoleType.HUNTER]: 1,
    [RoleType.GUARDIAN]: 0,
    [RoleType.IDIOT]: 0,
    [RoleType.WHITE_WOLF_KING]: 0,
    [RoleType.WOLF_BEAUTY]: 0,
    [RoleType.CUPID]: 0,
  });

  // --- Voice State ---
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // --- Game State ---
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.LOBBY,
    round: 0,
    players: [],
    messages: [],
    timer: 0,
    winner: null,
    language: 'en',
    roleCounts: offlineRoleCounts,
    sheriffCandidateIds: [],
    speechQueue: [],
    currentSpeakerId: null,
    nightActions: {
      werewolfTargetId: null,
      seerTargetId: null,
      witchHealUsed: false,
      witchPoisonUsed: false,
      witchTargetId: null,
      witchSaveTargetId: null,
      guardianTargetId: null,
      lastGuardedId: null,
      cupidTargetIds: [],
      beautyLinkedId: null
    },
    pendingShootActorId: null,
    pendingSheriffDeathId: null
  });

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [speechWarningTriggered, setSpeechWarningTriggered] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // --- Initialization Checks (URL Params) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setMode('online');
      setRoomId(roomParam);
    }
    // Restore user name
    const storedName = localStorage.getItem('ww_username');
    if (storedName) setUserName(storedName);
  }, []);

  // --- Localization Helper ---
  const t = useCallback((key: string) => {
    return TEXT[key]?.[gameState.language] || key;
  }, [gameState.language]);

  const addLog = (content: string, isSystem = true, senderName = 'System') => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: uuidv4(),
        senderId: 'sys',
        senderName,
        content,
        timestamp: Date.now(),
        isSystem
      }]
    }));
  };

  // --- Voice Logic ---
  const toggleMic = async () => {
    if (isMicOn) {
      // Turn off
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      setIsMicOn(false);
    } else {
      // Turn on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setIsMicOn(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone. Please check permissions.");
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  // --- Chat Logic ---
  const handleSendMessage = (text: string) => {
     if (mode === 'online') {
         socketRef.current?.emit('send_message', text);
     } else {
        // Offline logic
        const newMsg = {
          id: uuidv4(),
          senderId: 'player-user',
          senderName: userName || 'You',
          content: text,
          timestamp: Date.now(),
          isSystem: false
        };
        setGameState(prev => ({
           ...prev,
           messages: [...prev.messages, newMsg]
        }));
     }
  };

  // --- Socket Effects (Online Mode) ---
  useEffect(() => {
    if (mode === 'online' && hasJoined && !socketRef.current) {
      // Get or create persistent ID
      let playerId = localStorage.getItem('ww_player_id');
      if (!playerId) {
          playerId = uuidv4();
          localStorage.setItem('ww_player_id', playerId);
      }
      localStorage.setItem('ww_username', userName);

      // Connect
      const socket = io(serverUrl, {
        query: { 
            name: userName, 
            roomId: roomId, 
            playerId: playerId,
            create: (!roomId).toString() // If no ID, ask server to create
        }
      });

      socket.on('connected_info', (data: { playerId: string, roomId: string }) => {
          setRoomId(data.roomId);
          window.history.pushState({}, '', `?room=${data.roomId}`);
          setIsConnected(true);
      });

      socket.on('connect', () => {
        addLog('Connected to server.', true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        addLog('Disconnected from server.', true);
      });

      socket.on('game_state_update', (newState: GameState) => {
        // Merge server state with local language preference
        setGameState(prev => ({ ...newState, language: prev.language }));
      });
      
      socket.on('error_message', (msg: string) => {
         alert(msg);
         setHasJoined(false);
         if (msg === 'Room not found') {
             setRoomId('');
             window.history.pushState({}, '', window.location.pathname);
         }
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [mode, hasJoined, serverUrl, userName, roomId]);


  // --- Offline Timer ---
  useEffect(() => {
    if (mode === 'online') return; // Server handles timer
    let interval: ReturnType<typeof setInterval>;
    if (gameState.phase !== GamePhase.LOBBY && gameState.phase !== GamePhase.GAME_OVER && gameState.timer > 0) {
      interval = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timer - 1;
          if ((prev.phase === GamePhase.ELECTION_SPEECH || prev.phase === GamePhase.DAY_SPEECH) && newTime === 10) {
             setSpeechWarningTriggered(true); 
          }
          return { ...prev, timer: newTime };
        });
      }, 1000);
    } else if (gameState.timer === 0 && gameState.phase !== GamePhase.LOBBY && gameState.phase !== GamePhase.GAME_OVER) {
      handleTimerExpiry();
    }
    return () => clearInterval(interval);
  }, [gameState.timer, gameState.phase, mode]);

  // Speech Warning Log
  useEffect(() => {
    if (speechWarningTriggered) {
      addLog(t('sys_speak_timeout'));
      setSpeechWarningTriggered(false);
    }
  }, [speechWarningTriggered, t]);

  // Bot Chatter (Offline + Online Host side)
  useEffect(() => {
    // In online mode, only the host triggers bot chatter to avoid duplication
    const localPlayer = gameState.players.find(p => p.name === userName);
    if (mode === 'online' && !localPlayer?.isHost) return;

    if (gameState.phase === GamePhase.DAY_SPEECH && gameState.currentSpeakerId) {
      const speaker = gameState.players.find(p => p.id === gameState.currentSpeakerId);
      if (speaker && speaker.isBot && speaker.isAlive) {
        const delay = Math.random() * 3000 + 2000;
        const speakTimeout = setTimeout(async () => {
          const text = await generateBotChatter(gameState, speaker);
          
          if (mode === 'online') {
             // Emit as a message from the host on behalf of the bot
             socketRef.current?.emit('bot_chat', { senderId: speaker.id, senderName: speaker.name, content: text });
          } else {
             addLog(text, false, speaker.name);
             setTimeout(() => handleNextSpeaker(), 2000);
          }
        }, delay);
        return () => clearTimeout(speakTimeout);
      }
    }
  }, [gameState.phase, gameState.currentSpeakerId, mode]);


  // --- Actions ---

  const updateRoleCounts = (role: RoleType, increment: number) => {
     if (mode === 'online') {
         const newCounts = { ...gameState.roleCounts, [role]: Math.max(0, (gameState.roleCounts[role] || 0) + increment) };
         socketRef.current?.emit('update_role_counts', newCounts);
     } else {
         setOfflineRoleCounts(prev => ({ ...prev, [role]: Math.max(0, prev[role] + increment) }));
         setGameState(prev => ({...prev, roleCounts: { ...prev.roleCounts, [role]: Math.max(0, prev.roleCounts[role] + increment) } }));
     }
  };

  const startGame = () => {
    if (mode === 'online') {
      socketRef.current?.emit('start_game');
    } else {
      const players = createInitialPlayers(userName, offlineRoleCounts);
      setGameState(prev => ({
        ...prev,
        phase: GamePhase.NIGHT,
        round: 1,
        players: players,
        timer: PHASE_DURATION.NIGHT,
        language: language,
        messages: [{ id: uuidv4(), senderId: 'sys', senderName: 'Narrator', content: t('sys_night_start'), timestamp: Date.now(), isSystem: true }]
      }));
    }
  };

  const handleTimerExpiry = () => {
    if (mode === 'online') return;
    if (gameState.phase === GamePhase.ELECTION_SPEECH || gameState.phase === GamePhase.DAY_SPEECH) {
      handleNextSpeaker();
    } else {
      handlePhaseTransition();
    }
  };

  const handleNextSpeaker = () => {
    if (mode === 'online') {
       return;
    }
    setGameState(prev => {
      const queue = [...prev.speechQueue];
      queue.shift(); 
      if (queue.length === 0) {
        const nextPhase = prev.phase === GamePhase.ELECTION_SPEECH ? GamePhase.ELECTION_VOTE : GamePhase.DAY_VOTE;
        const duration = prev.phase === GamePhase.ELECTION_SPEECH ? PHASE_DURATION.ELECTION_VOTE : PHASE_DURATION.DAY_VOTE;
        
        // PRE-CALCULATE BOT VOTES
        const playersWithVotes = prev.players.map(p => {
           if (p.isBot && p.isAlive) {
              const targetId = getBotVote(prev, p);
              return { ...p, votedFor: targetId };
           }
           return p;
        });

        return {
          ...prev, phase: nextPhase, timer: duration, currentSpeakerId: null, speechQueue: [], players: playersWithVotes,
          messages: [...prev.messages, { id: uuidv4(), senderId: 'sys', senderName: 'Sys', content: t('sys_election_vote'), timestamp: Date.now(), isSystem: true }]
        };
      } else {
        const nextId = queue[0];
        const speaker = prev.players.find(p => p.id === nextId);
        return {
           ...prev, speechQueue: queue, currentSpeakerId: nextId, timer: PHASE_DURATION.DAY_SPEECH,
           messages: [...prev.messages, { id: uuidv4(), senderId: 'sys', senderName: 'Sys', content: `${speaker?.name}: ${t('sys_you_turn_speak')}`, timestamp: Date.now(), isSystem: true }]
        };
      }
    });
  };

  const handlePhaseTransition = () => {
    setGameState(prev => {
      let nextPhase = prev.phase;
      let nextRound = prev.round;
      let nextTimer = 0;
      let newPlayers = prev.players.map(p => ({...p}));
      let pendingSheriffDeath = prev.pendingSheriffDeathId;
      let currentNightActions = {...prev.nightActions};
      let messages = [...prev.messages];

      // --- Offline Mode Logic for Results & Transitions ---
      
      if (prev.phase === GamePhase.NIGHT) {
          // 1. Simulate Bot Night Actions
          currentNightActions = processBotNightActions({...prev, nightActions: currentNightActions});

          // 2. Resolve Night Actions (Simple Version)
          const deadIds: string[] = [];
          if (currentNightActions.werewolfTargetId) {
             let victimId = currentNightActions.werewolfTargetId;
             
             // Guardian Save
             if (currentNightActions.guardianTargetId === victimId) {
                 victimId = '';
             }
             
             // Witch Save
             if (currentNightActions.witchSaveTargetId === victimId) {
                 victimId = '';
             }

             if (victimId) deadIds.push(victimId);
          }

          // Witch Poison
          if (currentNightActions.witchPoisonUsed && currentNightActions.witchTargetId) {
              deadIds.push(currentNightActions.witchTargetId);
          }

          // Apply Deaths
          if (deadIds.length > 0) {
              deadIds.forEach(id => {
                  const p = newPlayers.find(pl => pl.id === id);
                  if (p) {
                      p.isAlive = false;
                      // Check Sheriff
                      if (p.isSheriff) pendingSheriffDeath = p.id;
                  }
              });
          }

          // Update Guard History
          currentNightActions.lastGuardedId = currentNightActions.guardianTargetId;
          // Reset Round Actions
          currentNightActions.guardianTargetId = null;
          currentNightActions.werewolfTargetId = null;
          currentNightActions.seerTargetId = null;
          currentNightActions.witchTargetId = null;
          currentNightActions.witchSaveTargetId = null;

          nextPhase = GamePhase.DAY_SPEECH;
          nextTimer = PHASE_DURATION.DAY_SPEECH;
          // Reset votes
          newPlayers.forEach(p => { p.votedFor = null; p.votesReceived = 0; });
          
          // Add Log
          messages.push({ id: uuidv4(), senderId: 'sys', senderName: 'System', content: deadIds.length > 0 ? `Night over. ${deadIds.length} player(s) died.` : 'Night over. No one died.', timestamp: Date.now(), isSystem: true });
      }
      else if (prev.phase === GamePhase.DAY_VOTE) {
          // 1. Tally Votes (With Sheriff 1.5x Weight)
          const voteCounts: Record<string, number> = {};
          let maxVotes = -1;
          let victimId: string | null = null;

          newPlayers.forEach(p => {
             if (p.isAlive && p.votedFor) {
                 const weight = p.isSheriff ? 1.5 : 1.0;
                 voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + weight;
             }
          });

          // Apply counts and find victim
          newPlayers.forEach(p => {
             p.votesReceived = voteCounts[p.id] || 0;
             if (p.votesReceived > maxVotes) {
                 maxVotes = p.votesReceived;
                 victimId = p.id;
             } else if (p.votesReceived === maxVotes) {
                 victimId = null; // Tie
             }
          });

          // 2. Eliminate Victim
          if (victimId) {
              const victim = newPlayers.find(p => p.id === victimId);
              if (victim) {
                  victim.isAlive = false;
                  messages.push({ id: uuidv4(), senderId: 'sys', senderName: 'System', content: `${victim.name} was voted out.`, timestamp: Date.now(), isSystem: true });
                  if (victim.isSheriff) {
                      pendingSheriffDeath = victim.id;
                  }
              }
          } else {
               messages.push({ id: uuidv4(), senderId: 'sys', senderName: 'System', content: `No one voted out (Tie or No Votes).`, timestamp: Date.now(), isSystem: true });
          }
          
          nextPhase = GamePhase.DAY_VOTE_RESULT;
          nextTimer = PHASE_DURATION.DAY_VOTE_RESULT;
      } 
      else if (prev.phase === GamePhase.DAY_VOTE_RESULT) {
          // Check for Sheriff death handover
          if (pendingSheriffDeath) {
              const sheriffBot = newPlayers.find(p => p.id === pendingSheriffDeath && p.isBot);
              if (sheriffBot) {
                  // Bot Sheriff Logic
                  const successorId = getBotSheriffHandover({ ...prev, players: newPlayers }, sheriffBot);
                  if (successorId) {
                      const successor = newPlayers.find(p => p.id === successorId);
                      if (successor) successor.isSheriff = true;
                      sheriffBot.isSheriff = false;
                      messages.push({ id: uuidv4(), senderId: 'sys', senderName: 'System', content: `${sheriffBot.name} passed badge to ${successor?.name}.`, timestamp: Date.now(), isSystem: true });
                  } else {
                      sheriffBot.isSheriff = false;
                      messages.push({ id: uuidv4(), senderId: 'sys', senderName: 'System', content: `Badge torn up.`, timestamp: Date.now(), isSystem: true });
                  }
                  pendingSheriffDeath = null;
                  nextPhase = GamePhase.NIGHT;
                  nextTimer = PHASE_DURATION.NIGHT;
                  nextRound++;
              } else {
                  // Human sheriff - wait for input
                  nextPhase = GamePhase.SHERIFF_HANDOVER;
                  nextTimer = PHASE_DURATION.SHERIFF_HANDOVER;
              }
          } else {
              nextPhase = GamePhase.NIGHT;
              nextTimer = PHASE_DURATION.NIGHT;
              nextRound++;
          }
      }
      else if (prev.phase === GamePhase.SHERIFF_HANDOVER) {
          // If timed out, badge is destroyed (simplified)
          const oldSheriff = newPlayers.find(p => p.id === pendingSheriffDeath);
          if (oldSheriff) oldSheriff.isSheriff = false;
          
          pendingSheriffDeath = null;
          nextPhase = GamePhase.NIGHT;
          nextTimer = PHASE_DURATION.NIGHT;
          nextRound++;
      }
      else if (prev.phase === GamePhase.DAY_SPEECH) {
          nextPhase = GamePhase.DAY_VOTE;
          nextTimer = PHASE_DURATION.DAY_VOTE;
          // Bot Votes Logic duplicate needed here if transition happens via timer not nextSpeaker
          const playersWithVotes = newPlayers.map(p => {
            if (p.isBot && p.isAlive) {
                const targetId = getBotVote(prev, p);
                return { ...p, votedFor: targetId };
            }
            return p;
          });
          newPlayers = playersWithVotes;
      }

      // Check Winner
      let winner: 'VILLAGERS' | 'WEREWOLVES' | 'LOVERS' | null = null;
      const wolves = newPlayers.filter(p => p.isAlive && ROLES[p.role].team === 'WEREWOLVES').length;
      const villagers = newPlayers.filter(p => p.isAlive && ROLES[p.role].team === 'VILLAGERS').length; // Simply count non-wolves for basic check
      
      if (wolves === 0) winner = 'VILLAGERS';
      else if (wolves >= villagers) winner = 'WEREWOLVES';

      if (winner) {
         nextPhase = GamePhase.GAME_OVER;
         messages.push({ id: uuidv4(), senderId: 'sys', senderName: 'System', content: 'Game Over!', timestamp: Date.now(), isSystem: true });
      }

      return { 
        ...prev, 
        phase: nextPhase, 
        round: nextRound, 
        timer: nextTimer, 
        players: newPlayers,
        nightActions: currentNightActions,
        pendingSheriffDeathId: pendingSheriffDeath,
        messages: messages,
        winner
      };
    });
  };

  const handleInteraction = (targetId: string) => {
    if (mode === 'online') {
      const local = gameState.players.find(p => p.id === localStorage.getItem('ww_player_id'));
      if (local?.isSpectator) return;

      if (gameState.phase === GamePhase.SHERIFF_HANDOVER) {
          socketRef.current?.emit('sheriff_handover', { targetId });
      } else {
          socketRef.current?.emit('interaction', { targetId });
      }
      return;
    }
    
    // Offline Interaction
    if (gameState.phase === GamePhase.SHERIFF_HANDOVER) {
       handleSheriffAction(targetId);
       return;
    }
    
    // Offline Night Action (User)
    if (gameState.phase === GamePhase.NIGHT) {
       const localPlayer = gameState.players.find(p => p.id === 'player-user');
       if (localPlayer && localPlayer.isAlive) {
          setGameState(prev => {
             const newActions = { ...prev.nightActions };
             if (localPlayer.role === RoleType.WEREWOLF) newActions.werewolfTargetId = targetId;
             if (localPlayer.role === RoleType.SEER) newActions.seerTargetId = targetId;
             if (localPlayer.role === RoleType.GUARDIAN) newActions.guardianTargetId = targetId;
             if (localPlayer.role === RoleType.WITCH) {
                // Simplified Witch click: Toggle Poison if clicked
                // Real UI would need split buttons
                if (newActions.werewolfTargetId === targetId && !newActions.witchHealUsed) {
                    newActions.witchSaveTargetId = targetId;
                    newActions.witchHealUsed = true;
                } else if (!newActions.witchPoisonUsed) {
                    newActions.witchTargetId = targetId;
                    newActions.witchPoisonUsed = true;
                }
             }
             return { ...prev, nightActions: newActions };
          });
       }
       return;
    }

    if (gameState.phase === GamePhase.DAY_VOTE || gameState.phase === GamePhase.ELECTION_VOTE) {
       const localId = 'player-user';
       if (targetId === localId) return; 
       
       setGameState(prev => {
         const newPlayers = prev.players.map(p => 
            p.id === localId ? { ...p, votedFor: targetId } : p
         );
         return { ...prev, players: newPlayers };
       });
       setSelectedTargetId(targetId);
    } else {
       setSelectedTargetId(targetId);
    }
  };

  const handleSheriffAction = (targetId: string | null) => {
     setGameState(prev => {
        const newPlayers = prev.players.map(p => ({...p}));
        const oldSheriff = newPlayers.find(p => p.id === prev.pendingSheriffDeathId);
        
        if (oldSheriff) {
            oldSheriff.isSheriff = false;
        }

        if (targetId) {
            const newSheriff = newPlayers.find(p => p.id === targetId);
            if (newSheriff && newSheriff.isAlive) {
                newSheriff.isSheriff = true;
                addLog(`${newSheriff.name} ${t('sys_sheriff_elected')}`);
            }
        } else {
             addLog(t('sys_sheriff_none'));
        }
        
        return {
            ...prev,
            players: newPlayers,
            phase: GamePhase.NIGHT, 
            timer: PHASE_DURATION.NIGHT,
            round: prev.round + 1,
            pendingSheriffDeathId: null
        };
     });
  };

  // --- Instructions Modal ---
  const InstructionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
       <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
             <h2 className="text-xl font-bold font-serif text-slate-100">{t('instructions')}</h2>
             <button 
               onClick={() => setShowInstructions(false)}
               className="text-slate-400 hover:text-white p-1"
             >
               ✕
             </button>
          </div>
          <div className="p-6 space-y-6">
             <section>
               <h3 className="text-lg font-bold text-blue-400 mb-2">{t('rules_title')}</h3>
               <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{t('rules_content')}</p>
             </section>
             <section>
               <h3 className="text-lg font-bold text-purple-400 mb-2">{t('host_title')}</h3>
               <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{t('host_content')}</p>
             </section>
             <section>
               <h3 className="text-lg font-bold text-pink-400 mb-2">{t('internet_title')}</h3>
               <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{t('internet_content')}</p>
             </section>
             <section>
               <h3 className="text-lg font-bold text-green-400 mb-2">{t('controls_title')}</h3>
               <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{t('controls_content')}</p>
             </section>
          </div>
          <div className="p-4 border-t border-slate-800">
             <button 
               onClick={() => setShowInstructions(false)}
               className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-bold"
             >
               {t('close')}
             </button>
          </div>
       </div>
    </div>
  );


  // --- Render ---

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        {showInstructions && <InstructionsModal />}
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 relative">
          {/* Top Controls */}
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-4xl font-serif text-slate-100">{TEXT.gameTitle[language]}</h1>
             <div className="flex gap-2">
                <button onClick={() => setShowInstructions(true)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 flex items-center gap-1">
                   <span className="w-4 h-4"><InstructionIcon /></span>
                   <span className="hidden sm:inline">{t('instructions')}</span>
                </button>
                <button onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-sm text-slate-300">
                  {language === 'en' ? '中文' : 'English'}
                </button>
             </div>
          </div>

          {/* Mode Selection */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => { setMode('offline'); setRoomId(''); }}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${mode === 'offline' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Single Player
            </button>
            <button 
              onClick={() => setMode('online')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${mode === 'online' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Multiplayer
            </button>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm text-slate-400 mb-1">{TEXT.enterName[language]}</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder={t('enterName')}
                />
             </div>

             {mode === 'online' && (
                 <div>
                    <div className="mb-2">
                      <label className="block text-sm text-slate-400 mb-1">Room ID (Optional - Leave empty to Create)</label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        placeholder="e.g. 53a1b..."
                      />
                      {roomId && <p className="text-xs text-purple-400 mt-1">Joining existing room...</p>}
                    </div>

                    {/* Server Config Toggle */}
                    <div className="pt-2">
                        <button 
                            onClick={() => setShowServerConfig(!showServerConfig)}
                            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                        >
                            {showServerConfig ? '▼' : '▶'} Advanced: Server Connection
                        </button>
                        
                        {showServerConfig && (
                            <div className="mt-2 p-3 bg-slate-950/50 rounded border border-slate-800 transition-all">
                                <label className="block text-xs text-slate-400 mb-1">Backend Server URL</label>
                                <input
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-blue-500 outline-none font-mono"
                                    value={serverUrl}
                                    onChange={e => setServerUrl(e.target.value)}
                                    placeholder="http://localhost:3000"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    If playing with friends over the internet, use a public URL (e.g. from ngrok). See "Instructions" for details.
                                </p>
                            </div>
                        )}
                    </div>
                 </div>
             )}

             <button
                onClick={() => { if(userName) { setHasJoined(true); if(mode === 'offline') startGame(); } }}
                disabled={!userName}
                className={`w-full font-bold py-4 rounded-xl transition-all mt-4 ${!userName ? 'opacity-50 cursor-not-allowed bg-slate-700' : mode === 'online' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}
             >
                {mode === 'online' 
                  ? (roomId ? t('joinRoom') : t('createRoom'))
                  : t('startGame')
                }
             </button>
          </div>
          
          {/* API Key Missing Banner - Start Screen */}
          {!hasApiKey && (
            <div className="mt-4 p-3 rounded bg-yellow-900/20 border border-yellow-700 text-yellow-200 text-xs text-center">
              ⚠ <strong>No API Key Detected.</strong> Game will run, but AI bots will not chat. <br/>
              Create a <code>.env</code> file with <code>API_KEY=...</code> to enable full features.
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LOBBY UI (Online) ---
  if (mode === 'online' && gameState.phase === GamePhase.LOBBY) {
     const localPlayer = gameState.players.find(p => p.id === localStorage.getItem('ww_player_id') || p.name === userName);
     const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
     const roleCounts = gameState.roleCounts;
     
     return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
           {showInstructions && <InstructionsModal />}
           <div className="max-w-4xl w-full space-y-8">
              
              {/* Header */}
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                 <div>
                    <h1 className="text-3xl font-serif font-bold text-purple-400">{t('lobby')}</h1>
                    <div className="flex items-center gap-2 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
                       <span className="text-xs text-slate-500">Room ID:</span>
                       <span className="font-mono font-bold">{roomId}</span>
                    </div>
                 </div>
                 <div className="flex gap-2 items-center">
                    <button onClick={() => setShowInstructions(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300" title={t('instructions')}>
                       <InstructionIcon />
                    </button>
                    {localPlayer && (
                       <button
                         onClick={() => socketRef.current?.emit('toggle_participation')}
                         className={`px-4 py-2 rounded text-sm font-bold border transition-all ${localPlayer.isSpectator ? 'bg-green-600 border-green-500 hover:bg-green-500' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                       >
                         {localPlayer.isSpectator ? t('joinGame') : t('spectate')}
                       </button>
                    )}
                    <button 
                       onClick={() => { navigator.clipboard.writeText(inviteLink); setInviteCopied(true); setTimeout(()=>setInviteCopied(false), 2000); }}
                       className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded border border-slate-700 text-sm transition-all"
                    >
                       {inviteCopied ? t('copied') : t('copyLink')}
                    </button>
                 </div>
              </div>

              {/* Player List */}
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {t('onlinePlayers')} 
                    <span className="text-sm font-normal text-slate-500">({gameState.players.filter(p => !p.isSpectator).length}/12)</span>
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {gameState.players.filter(p => !p.isSpectator).map(p => (
                       <div key={p.id} className="relative group flex flex-col items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                          {localPlayer?.isHost && localPlayer.id !== p.id && (
                             <button 
                               onClick={() => socketRef.current?.emit('kick_player', p.id)}
                               className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                               title={t('kick')}
                             >
                               ✕
                             </button>
                          )}
                          <img src={p.avatar} className={`w-12 h-12 rounded-full ${p.isOnline ? 'opacity-100' : 'opacity-50 grayscale'}`} />
                          <span className="mt-2 font-bold text-sm truncate max-w-full">{p.name}</span>
                          <div className="flex gap-1 mt-1">
                             {p.isHost && <span className="text-[10px] bg-yellow-900 text-yellow-200 px-1 rounded">HOST</span>}
                             {p.isBot && <span className="text-[10px] bg-blue-900 text-blue-200 px-1 rounded">BOT</span>}
                             {!p.isOnline && <span className="text-[10px] bg-red-900 text-red-200 px-1 rounded">OFFLINE</span>}
                          </div>
                       </div>
                    ))}
                    
                    {/* Add/Remove Bot Button (Host Only) */}
                    {localPlayer?.isHost && (
                       <div className="flex flex-col gap-2 h-full min-h-[100px] justify-center p-2 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                          <button 
                             onClick={() => socketRef.current?.emit('add_bot')}
                             disabled={gameState.players.filter(p => !p.isSpectator).length >= 12}
                             className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-bold text-green-400 border border-slate-600 transition-all"
                          >
                             + {t('addBot')}
                          </button>
                          <button 
                             onClick={() => socketRef.current?.emit('remove_bot')}
                             disabled={!gameState.players.some(p => p.isBot)}
                             className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-bold text-red-400 border border-slate-600 transition-all"
                          >
                             - {t('removeBot')}
                          </button>
                       </div>
                    )}
                 </div>
              </div>

              {/* Host Controls */}
              {localPlayer?.isHost ? (
                 <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <h3 className="font-bold text-slate-300 mb-4">Role Configuration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                       {Object.keys(ROLES).map((r) => (
                          <div key={r} className="bg-slate-950 p-2 rounded flex justify-between items-center">
                             <span className="text-xs flex items-center gap-1">
                                <span>{ROLES[r as RoleType].icon}</span> {TEXT[`role_${r}`][language]}
                             </span>
                             <div className="flex items-center gap-1">
                                <button onClick={() => updateRoleCounts(r as RoleType, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-xs">-</button>
                                <span className="text-xs w-3 text-center">{roleCounts[r as RoleType] || 0}</span>
                                <button onClick={() => updateRoleCounts(r as RoleType, 1)} className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 text-xs">+</button>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="text-xs text-slate-500">
                          Total Roles: {Object.values(roleCounts).reduce((a,b)=>a+b,0)} vs Players: {gameState.players.filter(p=>!p.isSpectator).length}
                       </div>
                       <button 
                          onClick={() => socketRef.current?.emit('start_game')}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-lg transition-all"
                       >
                          {t('startGame')}
                       </button>
                    </div>
                 </div>
              ) : (
                 <div className="text-center p-8 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 animate-pulse">
                    <p className="text-slate-400">{t('waitingHost')}</p>
                 </div>
              )}
           </div>
        </div>
     );
  }

  // --- MAIN GAME UI (Same for Offline/Online) ---
  
  const localPlayerRef = gameState.players.find(p => p.id === localStorage.getItem('ww_player_id')) || gameState.players.find(p => p.name === userName);
  const isNight = gameState.phase === GamePhase.NIGHT;
  const isMyTurn = gameState.currentSpeakerId === localPlayerRef?.id;
  const spectators = gameState.players.filter(p => p.isSpectator);

  // --- Chat Filtering ---
  // Visible messages:
  // 1. System Messages (Always)
  // 2. My own messages (Always)
  // 3. Host messages (Always)
  // 4. Dead/Spectator messages: Only if I am Host OR Dead OR Spectator
  const visibleMessages = gameState.messages.filter(msg => {
     if (msg.isSystem) return true;
     if (msg.senderId === localPlayerRef?.id) return true;
     if (msg.isHostChat) return true; // Host global chat

     if (msg.isDeadChat) {
         // Only visible to dead/spectators/host
         if (localPlayerRef?.isHost || !localPlayerRef?.isAlive || localPlayerRef?.isSpectator) {
             return true;
         }
         return false;
     }
     
     return true;
  });

  // Can I chat?
  // 1. Offline: Yes
  // 2. Online: Host (Always), Dead (Yes), Spectator (Yes), Alive (No)
  const canChat = mode === 'offline' || (localPlayerRef && (localPlayerRef.isHost || !localPlayerRef.isAlive || localPlayerRef.isSpectator));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {showInstructions && <InstructionsModal />}
      
      {/* Missing Key Banner */}
      {!hasApiKey && (
         <div className="bg-yellow-600/20 border-b border-yellow-500/50 text-yellow-200 text-center text-xs p-1 font-mono">
           ⚠ API_KEY missing. Bots will not chat. Check README.
         </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${isNight ? 'bg-indigo-950 border-indigo-800' : 'bg-amber-950/50 border-amber-800'}`}>
            <span className="text-2xl">{isNight ? '🌙' : '☀️'}</span>
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold hidden md:block">
              {t(isNight ? 'nightPhase' : 'dayPhase')}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
               <span>Round {gameState.round}</span>
               {mode === 'online' && <span className="ml-2 text-purple-400">ID: {roomId}</span>}
            </div>
          </div>
        </div>
        
        {/* Voice Controls */}
        <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowInstructions(true)}
               className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 mr-2"
               title={t('instructions')}
             >
                <InstructionIcon />
             </button>
             <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-full border border-slate-700">
                <button 
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${isMicOn ? 'bg-green-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                  title="Toggle Microphone"
                >
                  {isMicOn ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                <div className="w-px h-6 bg-slate-700 mx-1"></div>
                <button 
                  onClick={toggleAudio}
                  className={`p-2 rounded-full transition-all ${isAudioOn ? 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'bg-red-600 text-white shadow-lg'}`}
                  title="Toggle Audio"
                >
                  {isAudioOn ? <SoundOnIcon /> : <SoundOffIcon />}
                </button>
             </div>
        </div>

        <div className={`text-3xl font-mono font-bold ${gameState.timer <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
            {Math.floor(gameState.timer / 60)}:{(gameState.timer % 60).toString().padStart(2, '0')}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        
        {/* Left: Board */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Spectator Banner */}
          {localPlayerRef?.isSpectator && (
             <div className="bg-blue-900/30 border border-blue-500 p-4 rounded-xl text-center">
                 <p className="font-bold text-blue-300">You are spectating.</p>
                 <p className="text-xs text-blue-400">Wait for the next game to join the action.</p>
             </div>
          )}

          {/* Action Banner */}
          {localPlayerRef?.isAlive && !localPlayerRef?.isSpectator && isMyTurn && (
             <div className="bg-green-900/50 border border-green-500 p-4 rounded-xl flex justify-between items-center animate-bounce-slight">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎤</span>
                  <div>
                     <p className="font-bold text-green-200">{t('sys_you_turn_speak')}</p>
                     <p className="text-xs text-green-300">
                        {isMicOn ? "Microphone active." : "Microphone is muted! Tap 'Talk' to speak."}
                     </p>
                  </div>
                </div>
                <button onClick={handleNextSpeaker} className="bg-green-600 px-4 py-2 rounded font-bold hover:bg-green-500">
                   {t('btn_pass')}
                </button>
             </div>
          )}

          {/* Nomination Banner */}
          {gameState.phase === GamePhase.ELECTION_NOMINATION && localPlayerRef?.isAlive && !localPlayerRef?.isSpectator && (
            <div className="bg-indigo-900/50 border border-indigo-500 p-6 rounded-xl text-center space-y-4">
               <p className="text-lg font-serif">{t('sys_election_nominate')}</p>
               <div className="flex justify-center gap-4">
                 <button 
                   onClick={() => mode === 'online' ? socketRef.current?.emit('nominate_sheriff') : setGameState(prev => ({...prev, sheriffCandidateIds: [...prev.sheriffCandidateIds, localPlayerRef!.id]}))}
                   className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-500"
                 >
                   {t('btn_join')}
                 </button>
               </div>
            </div>
          )}

          {/* Sheriff Handover Banner */}
          {gameState.phase === GamePhase.SHERIFF_HANDOVER && localPlayerRef?.id === gameState.pendingSheriffDeathId && (
             <div className="bg-yellow-900/50 border border-yellow-500 p-6 rounded-xl text-center space-y-4 animate-pulse">
                <p className="text-lg font-serif text-yellow-200 font-bold">{t('sys_handover')}</p>
                <p className="text-sm text-yellow-100/70">Select a player below to pass the badge, or destroy it.</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => mode === 'online' ? socketRef.current?.emit('sheriff_handover', { targetId: null }) : handleSheriffAction(null)}
                    className="bg-red-600 px-6 py-2 rounded hover:bg-red-500 text-white font-bold"
                  >
                    {t('btn_destroy')}
                  </button>
                </div>
             </div>
          )}

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {gameState.players.filter(p => !p.isSpectator).map(p => (
              <PlayerCard
                key={p.id}
                player={p}
                isLocalPlayer={localPlayerRef ? p.id === localPlayerRef.id : false}
                gamePhase={gameState.phase}
                localPlayerRole={localPlayerRef?.role || RoleType.VILLAGER}
                onClick={handleInteraction}
                isSelected={selectedTargetId === p.id}
                isSpeaking={gameState.currentSpeakerId === p.id}
                showRole={gameState.phase === GamePhase.GAME_OVER || localPlayerRef?.isSpectator}
                voterNames={gameState.players.filter(v => v.votedFor === p.id).map(v => v.name)}
              />
            ))}
          </div>

          {/* Game Over */}
          {gameState.phase === GamePhase.GAME_OVER && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 text-center max-w-md mx-4">
                <h2 className={`text-4xl font-serif font-bold mb-4 ${gameState.winner === 'WEREWOLVES' ? 'text-red-500' : 'text-green-400'}`}>
                   {gameState.winner === 'LOVERS' ? t('loversWin') : gameState.winner === 'WEREWOLVES' ? t('wolvesWin') : t('villagersWin')}
                </h2>
                <button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold">
                  {t('playAgain')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Logs */}
        <div className="h-[400px] lg:h-[calc(100vh-140px)] sticky top-24">
          <Chat 
            messages={visibleMessages} 
            onSendMessage={handleSendMessage}
            inputEnabled={!!canChat}
            placeholder={t('chatPlaceholder')}
            sendButtonText={t('send')}
          />
        </div>

      </main>
    </div>
  );
};

export default App;