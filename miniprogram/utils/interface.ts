// 卡牌类型
export enum CardSuit {
  Hearts,
  Diamonds,
  Clubs,
  Spades
}

export interface Card {
  suit: string | CardSuit;
  value: number; // 假设值为1-13代表A到K
}

// 玩家信息
export interface Player {
  id: string;
  name: string;
  hand: Card[]; // 手中的牌
}

// 游戏状态
export interface GameState {
  players: Player[];
  deck: Card[]; // 牌堆
  currentPlayerId: string; // 当前玩家ID
}