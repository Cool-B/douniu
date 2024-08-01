// // 创建 WebSocket 连接
// const socket = wx.connectSocket({
//   url: 'wss://your-server-url',
// });

import { Card, CardSuit, GameState, Player } from "./interface";

// // 监听 WebSocket 消息
// socket.onMessage(function (message: any) {
//   console.log('收到消息：', message);
//   // 处理接收到的消息，更新游戏状态
// });

// // 发送 WebSocket 消息
// socket.send({
//   data: {
//     type: 'YOUR_MESSAGE_TYPE',
//     content: 'YOUR_MESSAGE_CONTENT',
//   },
// });
export function initializeGame(players: Player[]): GameState {
  // 创建一副完整的扑克牌
  const deck: Card[] = [];
  for (const suit of Object.values(CardSuit)) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value });
    }
  }

  // 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  // 分配手牌
  const initialState: GameState = { players, deck, currentPlayerId: players[0].id };
  players.forEach(player => {
    player.hand = deck.splice(0, 5); // 假设每人先发5张牌
  });

  return initialState;
}