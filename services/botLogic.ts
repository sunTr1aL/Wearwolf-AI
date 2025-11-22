
import { GameState, Player, RoleType } from '../types';
import { ROLES } from '../constants';

/**
 * Decides who a bot should vote for during the day/election.
 */
export const getBotVote = (gameState: GameState, bot: Player): string | null => {
  if (!bot.isAlive) return null;

  const alivePlayers = gameState.players.filter(p => p.isAlive && p.id !== bot.id);
  if (alivePlayers.length === 0) return null;

  const isWolf = ROLES[bot.role].team === 'WEREWOLVES';

  if (isWolf) {
    // Wolves try to vote for good guys
    const goodGuys = alivePlayers.filter(p => ROLES[p.role].team !== 'WEREWOLVES');
    if (goodGuys.length > 0) {
      return goodGuys[Math.floor(Math.random() * goodGuys.length)].id;
    }
  }

  // Default: Vote randomly
  return alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
};

/**
 * Processes night actions for all bots and returns updated nightActions state.
 */
export const processBotNightActions = (gameState: GameState): GameState['nightActions'] => {
  const actions = { ...gameState.nightActions };
  const bots = gameState.players.filter(p => p.isBot && p.isAlive);
  const alivePlayers = gameState.players.filter(p => p.isAlive);

  // 1. Werewolves (Collaborative in theory, but here we ensure at least one target is set if not already)
  if (!actions.werewolfTargetId) {
    const wolves = bots.filter(p => ROLES[p.role].team === 'WEREWOLVES');
    if (wolves.length > 0) {
      const nonWolves = alivePlayers.filter(p => ROLES[p.role].team !== 'WEREWOLVES');
      if (nonWolves.length > 0) {
        actions.werewolfTargetId = nonWolves[Math.floor(Math.random() * nonWolves.length)].id;
      }
    }
  }

  // 2. Seer
  if (!actions.seerTargetId) {
    const seer = bots.find(p => p.role === RoleType.SEER);
    if (seer) {
       // Simple: Check random person not self
       const targets = alivePlayers.filter(p => p.id !== seer.id);
       if (targets.length > 0) {
         actions.seerTargetId = targets[Math.floor(Math.random() * targets.length)].id;
       }
    }
  }

  // 3. Guardian
  if (!actions.guardianTargetId) {
    const guardian = bots.find(p => p.role === RoleType.GUARDIAN);
    if (guardian) {
       const targets = alivePlayers.filter(p => p.id !== actions.lastGuardedId);
       if (targets.length > 0) {
         actions.guardianTargetId = targets[Math.floor(Math.random() * targets.length)].id;
       }
    }
  }

  // 4. Witch
  const witch = bots.find(p => p.role === RoleType.WITCH);
  if (witch) {
    // Heal Logic: 50% chance to save if someone is killed and heal not used
    if (actions.werewolfTargetId && !actions.witchHealUsed) {
       if (Math.random() > 0.5) {
         actions.witchSaveTargetId = actions.werewolfTargetId;
         actions.witchHealUsed = true;
       }
    }
    
    // Poison Logic: If not saving, 20% chance to poison random suspect
    if (!actions.witchSaveTargetId && !actions.witchPoisonUsed) {
       if (Math.random() < 0.2) {
          const targets = alivePlayers.filter(p => p.id !== witch.id);
          if (targets.length > 0) {
            actions.witchTargetId = targets[Math.floor(Math.random() * targets.length)].id;
            actions.witchPoisonUsed = true;
          }
       }
    }
  }

  return actions;
};

/**
 * Decides a successor for a dead Sheriff bot.
 */
export const getBotSheriffHandover = (gameState: GameState, bot: Player): string | null => {
   const alivePlayers = gameState.players.filter(p => p.isAlive && p.id !== bot.id);
   if (alivePlayers.length === 0) return null;
   
   // 50% chance to pass to teammate if wolf, otherwise random
   const isWolf = ROLES[bot.role].team === 'WEREWOLVES';
   if (isWolf && Math.random() > 0.3) {
      const teammates = alivePlayers.filter(p => ROLES[p.role].team === 'WEREWOLVES');
      if (teammates.length > 0) return teammates[Math.floor(Math.random() * teammates.length)].id;
   }
   
   return alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
}
