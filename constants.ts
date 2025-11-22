




import { RoleType, RoleConfig, Translation } from './types';

export const ROLES: Record<RoleType, RoleConfig> = {
  [RoleType.VILLAGER]: { type: RoleType.VILLAGER, team: 'VILLAGERS', icon: '🧑‍🌾' },
  [RoleType.WEREWOLF]: { type: RoleType.WEREWOLF, team: 'WEREWOLVES', icon: '🐺' },
  [RoleType.SEER]: { type: RoleType.SEER, team: 'VILLAGERS', icon: '🔮' },
  [RoleType.WITCH]: { type: RoleType.WITCH, team: 'VILLAGERS', icon: '🧪' },
  [RoleType.HUNTER]: { type: RoleType.HUNTER, team: 'VILLAGERS', icon: '🔫' },
  [RoleType.GUARDIAN]: { type: RoleType.GUARDIAN, team: 'VILLAGERS', icon: '🛡️' },
  [RoleType.IDIOT]: { type: RoleType.IDIOT, team: 'VILLAGERS', icon: '🃏' },
  [RoleType.WHITE_WOLF_KING]: { type: RoleType.WHITE_WOLF_KING, team: 'WEREWOLVES', icon: '👑' },
  [RoleType.WOLF_BEAUTY]: { type: RoleType.WOLF_BEAUTY, team: 'WEREWOLVES', icon: '💄' },
  [RoleType.CUPID]: { type: RoleType.CUPID, team: 'NEUTRAL', icon: '💘' },
};

export const PHASE_DURATION = {
  NIGHT: 20,
  ELECTION_NOMINATION: 15,
  ELECTION_SPEECH: 60, // Per player
  ELECTION_VOTE: 20,
  ELECTION_RESULT: 10,
  DAY_SPEECH: 60, // Per player
  DAY_VOTE: 20,
  DAY_VOTE_RESULT: 10,
  SHOOT_ACTION: 15,
  SHERIFF_HANDOVER: 15,
};

export const AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Molly',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bear',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ginger',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Simba',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Tiger',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
];

export const TEXT: Translation = {
  gameTitle: { en: 'Werewolf AI', zh: 'AI 狼人杀' },
  lobby: { en: 'Lobby', zh: '大厅' },
  enterName: { en: 'Enter Nickname', zh: '输入昵称' },
  startGame: { en: 'Start Game', zh: '开始游戏' },
  createRoom: { en: 'Create Room', zh: '创建房间' },
  joinRoom: { en: 'Join Room', zh: '加入房间' },
  enterRoom: { en: 'Enter', zh: '进入' },
  copyLink: { en: 'Copy Invite Link', zh: '复制邀请链接' },
  copied: { en: 'Copied!', zh: '已复制' },
  waitingHost: { en: 'Waiting for Host to start...', zh: '等待房主开始游戏...' },
  roomFull: { en: 'Room is full or game started', zh: '房间已满或游戏已开始' },
  onlinePlayers: { en: 'Players', zh: '玩家列表' },
  addBot: { en: 'Add Bot', zh: '添加 AI' },
  removeBot: { en: 'Remove', zh: '移除' },
  spectate: { en: 'Spectate', zh: '旁观' },
  joinGame: { en: 'Join Game', zh: '加入游戏' },
  kick: { en: 'Kick', zh: '踢出' },
  
  nightPhase: { en: 'Night Phase', zh: '入夜' },
  dayPhase: { en: 'Day Phase', zh: '天亮了' },
  electionPhase: { en: 'Election', zh: '警长竞选' },
  gameOver: { en: 'Game Over', zh: '游戏结束' },
  villagersWin: { en: 'Villagers Win!', zh: '好人阵营胜利！' },
  wolvesWin: { en: 'Werewolves Win!', zh: '狼人阵营胜利！' },
  loversWin: { en: 'Lovers Win!', zh: '人狼恋胜利！' },
  playAgain: { en: 'Play Again', zh: '再来一局' },
  
  // Roles
  role_VILLAGER: { en: 'Villager', zh: '平民' },
  role_WEREWOLF: { en: 'Werewolf', zh: '狼人' },
  role_SEER: { en: 'Seer', zh: '预言家' },
  role_WITCH: { en: 'Witch', zh: '女巫' },
  role_HUNTER: { en: 'Hunter', zh: '猎人' },
  role_GUARDIAN: { en: 'Guardian', zh: '守卫' },
  role_IDIOT: { en: 'Idiot', zh: '白痴' },
  role_WHITE_WOLF_KING: { en: 'White Wolf King', zh: '白狼王' },
  role_WOLF_BEAUTY: { en: 'Wolf Beauty', zh: '狼美人' },
  role_CUPID: { en: 'Cupid', zh: '丘比特' },

  // Descriptions
  desc_VILLAGER: { en: 'Find the wolves.', zh: '寻找狼人，投票放逐。' },
  desc_WEREWOLF: { en: 'Kill at night.', zh: '每晚杀一人，隐藏身份。' },
  desc_SEER: { en: 'Inspect identity.', zh: '每晚查验一名玩家身份。' },
  desc_WITCH: { en: 'Heal or Poison.', zh: '拥有解药和毒药。' },
  desc_HUNTER: { en: 'Shoot when dying.', zh: '死亡时可带走一人。' },
  desc_GUARDIAN: { en: 'Protect a player.', zh: '每晚守护一人免疫刀伤（不能连续守同一人）。' },
  desc_IDIOT: { en: 'Flip card to survive vote.', zh: '白天被投出时翻牌免疫死亡，但失去投票权。' },
  desc_WHITE_WOLF_KING: { en: 'Suicide to kill.', zh: '白天自爆可以带走一人。' },
  desc_WOLF_BEAUTY: { en: 'Link a player.', zh: '魅惑一人，你死由于殉情。' },
  desc_CUPID: { en: 'Link two lovers.', zh: '首夜连接两名恋人，同生共死。' },

  // System Messages
  sys_night_start: { en: 'Night falls. Close your eyes.', zh: '天黑请闭眼。' },
  sys_election_nominate: { en: 'Do you want to run for Sheriff?', zh: '是否上警竞选警长？' },
  sys_election_speech: { en: 'Candidates are making speeches.', zh: '警上玩家依次发言。' },
  sys_election_vote: { en: 'Vote for Sheriff!', zh: '请给警长投票！' },
  sys_sheriff_elected: { en: 'is elected Sheriff!', zh: '当选为警长！' },
  sys_sheriff_none: { en: 'No Sheriff elected.', zh: '本局无警长。' },
  sys_day_speech: { en: 'Discussion Phase.', zh: '自由讨论环节（按顺序发言）。' },
  sys_day_vote: { en: 'Vote to lynch.', zh: '请投票放逐玩家。' },
  sys_you_turn_speak: { en: 'It is your turn to speak!', zh: '轮到你发言了！' },
  sys_speak_timeout: { en: '10 seconds left!', zh: '发言还剩 10 秒！' },
  sys_handover: { en: 'Choose a successor for Sheriff.', zh: '请移交警徽。' },
  sys_shoot: { en: 'Choose a target to shoot!', zh: '请选择开枪带走的目标！' },
  sys_link_death: { en: 'died due to love link.', zh: '因为殉情随之而去。' },
  
  btn_join: { en: 'Run for Sheriff', zh: '上警' },
  btn_decline: { en: 'Decline', zh: '不上警' },
  btn_pass: { en: 'End Speech', zh: '结束发言' },
  btn_shoot: { en: 'Shoot', zh: '开枪' },
  btn_handover: { en: 'Handover', zh: '移交' },
  btn_destroy: { en: 'Destroy Badge', zh: '撕毁警徽' },

  // Instructions
  instructions: { en: 'Instructions', zh: '说明书' },
  rules_title: { en: 'Game Rules', zh: '游戏规则' },
  rules_content: { 
    en: 'Werewolf is a social deduction game.\n\n[Teams]\n• Villagers/Gods (Good): Find and eliminate all Werewolves.\n• Werewolves (Evil): Eliminate all Villagers or all Gods.\n\n[Flow]\n1. Night: Werewolves choose a victim. Special roles (Seer, Witch, etc.) use abilities.\n2. Day: Everyone wakes up. Victims are announced.\n3. Discussion: Survivors discuss who they think the wolves are.\n4. Vote: Players vote to eliminate one suspect.', 
    zh: '狼人杀是一个关于欺骗和推理的游戏。\n\n【阵营】\n• 好人（村民+神职）：找出并放逐所有狼人。\n• 狼人：屠边（杀光所有村民或杀光所有神职）。\n\n【流程】\n1. 夜晚：狼人杀人，神职（预言家、女巫等）使用技能。\n2. 白天：天亮，宣布昨晚死亡情况。\n3. 讨论：幸存者发言，寻找狼人踪迹。\n4. 投票：所有人投票放逐一名嫌疑人。' 
  },
  host_title: { en: 'Hosting', zh: '创建房间' },
  host_content: { 
    en: '1. Select "Multiplayer" on the home screen.\n2. Leave "Room ID" empty and click "Create Room".\n3. Share the generated Room ID with friends.\n4. Use the "+" and "-" buttons to adjust the number of roles.\n5. Use "Add Bot" to fill empty spots with AI players.', 
    zh: '1. 在主页选择“多人游戏”。\n2. 留空“房间号”，点击“创建房间”。\n3. 将生成的房间号分享给好友。\n4. 使用“+”和“-”按钮调整板子配置。\n5. 使用“添加 AI”按钮用机器人填补空位。' 
  },
  internet_title: { en: 'Internet Play (Tunneling)', zh: '远程联机 (内网穿透)' },
  internet_content: {
    en: 'To play with friends outside your Wi-Fi, you need to expose your local server to the internet.\n\n1. Download and install [ngrok](https://ngrok.com).\n2. Run the game server: `npm run server`.\n3. Open a terminal and run: `ngrok http 3000`.\n4. Copy the HTTPS Forwarding URL (e.g., https://abcd.ngrok-free.app).\n5. Paste this URL into the "Advanced: Server Connection" box on ALL devices (including yours).',
    zh: '如果朋友不在同一个 WiFi 下，你需要将本地服务器暴露到公网。\n\n1. 下载并安装 [ngrok](https://ngrok.com)。\n2. 启动游戏服务器：`npm run server`。\n3. 打开终端运行：`ngrok http 3000`。\n4. 复制 HTTPS Forwarding 地址（例如 https://abcd.ngrok-free.app）。\n5. 在所有设备（包括你自己）的“高级：服务器连接”框中输入该地址。'
  },
  controls_title: { en: 'Controls', zh: '操作指南' },
  controls_content: { 
    en: '• Tap a Player Avatar to interact (Vote, Kill, Save, Check).\n• Tap the "Microphone" icon to toggle voice chat.\n• Tap the "Speaker" icon to mute audio.\n• In Single Player, use the text box to chat with bots.', 
    zh: '• 点击玩家头像进行交互（投票、刀人、救人、查验）。\n• 点击“麦克风”图标切换发言状态。\n• 点击“扬声器”图标静音。\n• 单人模式下，可在下方输入框与 AI 文字交流。' 
  },
  close: { en: 'Close', zh: '关闭' },
  chatPlaceholder: { en: 'Type a message...', zh: '输入消息...' },
  send: { en: 'Send', zh: '发送' }
};