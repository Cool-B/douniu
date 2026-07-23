// ========== 扑克牌 ==========
export type Suit = 'Spade' | 'Heart' | 'Club' | 'Diamond';

export interface Card {
  suit: Suit;
  number: number; // 1-13, 1=A, 11=J, 12=Q, 13=K
}

// ========== 牌型等级 ==========
export enum HandRank {
  NoBull = 0,      // 无牛
  Bull1 = 1,       // 牛一
  Bull2 = 2,
  Bull3 = 3,
  Bull4 = 4,
  Bull5 = 5,
  Bull6 = 6,
  Bull7 = 7,
  Bull8 = 8,
  Bull9 = 9,
  BullBull = 10,   // 牛牛 (x5)
  FullFlower = 11, // 五花牛 (x6)
  FiveSmall = 12,  // 五小牛 (x7)
}

export const HandRankNames: Record<number, string> = {
  [HandRank.NoBull]: '无牛',
  [HandRank.Bull1]: '牛一',
  [HandRank.Bull2]: '牛二',
  [HandRank.Bull3]: '牛三',
  [HandRank.Bull4]: '牛四',
  [HandRank.Bull5]: '牛五',
  [HandRank.Bull6]: '牛六',
  [HandRank.Bull7]: '牛七',
  [HandRank.Bull8]: '牛八',
  [HandRank.Bull9]: '牛九',
  [HandRank.BullBull]: '牛牛',
  [HandRank.FullFlower]: '五花牛',
  [HandRank.FiveSmall]: '五小牛',
};

export const HandRankMultipliers: Record<number, number> = {
  [HandRank.NoBull]: 1,
  [HandRank.Bull1]: 1,
  [HandRank.Bull2]: 1,
  [HandRank.Bull3]: 1,
  [HandRank.Bull4]: 1,
  [HandRank.Bull5]: 1,
  [HandRank.Bull6]: 2,
  [HandRank.Bull7]: 2,
  [HandRank.Bull8]: 3,
  [HandRank.Bull9]: 4,
  [HandRank.BullBull]: 5,
  [HandRank.FullFlower]: 6,
  [HandRank.FiveSmall]: 7,
};

export interface HandResult {
  rank: HandRank;
  rankName: string;
  multiplier: number;
  maxCard: Card;       // 最大的单张牌(用于同牛数比牌)
  isBoom: boolean;     // 炸弹(4张相同)
}

// ========== 玩家 ==========
export interface Player {
  userId: number;
  name: string;
  avatar: string;
  userType: 1 | 2;    // 1=庄家, 2=闲家
  status: 1 | 2;       // 1=待准备, 2=已准备
  state: 1 | 2 | 3;    // 1=正常, 2=退出, 3=离线
  score: number;
  bet: number;
  pokers: Card[];
  lookHand: boolean;   // 是否看牌
  show: boolean;       // 是否亮牌
  handResult?: HandResult;
}

// ========== 房间 ==========
export interface Room {
  roomId: number;
  roomNumber: string;
  roomType: 1 | 2;     // 1=普通房间, 2=快速开始
  creatorId: number;
  status: 0 | 1;       // 0=等待中, 1=游戏中
  maxPlayers: number;
  currentRound: number;
  players: Player[];
  gameId?: string;
}

// ========== 游戏 ==========
export enum GameStatus {
  Ready = 0,     // 准备中
  Dealing = 1,   // 发牌中
  Betting = 2,   // 下注中
  Playing = 3,   // 游戏中(看牌/亮牌)
  Settlement = 4, // 结算中
}

export interface Game {
  gameId: string;
  roomId: number;
  round: number;
  dealerId: number;
  status: GameStatus;
  deck: Card[];
  players: Player[];
  phaseStartTime: number;
  phaseDuration: number; // ms
}

// ========== API 响应 ==========
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// ========== WebSocket 消息 ==========
export interface WSMessage {
  type: number;
  [key: string]: any;
}

export enum WSMessageType {
  JoinRoom = 1,       // 加入房间
  PlayerChange = 2,   // 玩家状态变更(准备/取消)
  GameStart = 3,      // 游戏开始
  Shuffle = 4,        // 洗牌
  DealCards = 5,      // 发牌
  CardState = 6,      // 收到自己的牌
  ShowHand = 7,       // 亮牌
  Settlement = 8,     // 结算
  Bet = 9,            // 下注
  Error = 10,         // 错误
  PhaseChange = 11,   // 阶段变更
}
