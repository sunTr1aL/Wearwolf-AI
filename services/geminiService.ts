
import { GoogleGenAI } from "@google/genai";
import { GameState, Player, RoleType, Language } from "../types";
import { ROLES, TEXT } from "../constants";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateBotChatter = async (
  gameState: GameState,
  speakingBot: Player
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "...";

  const lang = gameState.language;
  const roleName = ROLES[speakingBot.role].type; 
  const isWolf = ROLES[speakingBot.role].team === 'WEREWOLVES';
  const aliveCount = gameState.players.filter(p => p.isAlive).length;
  
  // Find someone suspicious (random for now, or based on vote history if we tracked it better)
  // For simple chatter, picking a random alive person to accuse or agree with makes it feel alive.
  const otherPlayers = gameState.players.filter(p => p.id !== speakingBot.id && p.isAlive);
  const randomTarget = otherPlayers.length > 0 ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)].name : "someone";

  const prompt = `
    You are playing Werewolf (Social Deduction game).
    
    Game Context:
    - Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
    - Round: ${gameState.round}
    - Players Alive: ${aliveCount}
    
    Your Profile:
    - Name: ${speakingBot.name}
    - Role: ${isWolf ? 'Werewolf' : 'Villager/Good'} (HIDDEN from others)
    - Goal: ${isWolf ? 'Deceive others, blend in, accuse innocents.' : 'Find wolves, be suspicious.'}
    
    Instruction:
    - Generate a SHORT chat message (max 15 words) for the game log.
    - Be conversational, maybe accuse ${randomTarget} or defend yourself.
    - If you are a wolf, DO NOT reveal it. Pretend to be good.
    - If it is early game, be vague. If late game, be decisive.
    - Style: Casual, spoken.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.replace(/"/g, '').trim();
  } catch (error) {
    return lang === 'zh' ? "我在思考..." : "I am thinking...";
  }
};
