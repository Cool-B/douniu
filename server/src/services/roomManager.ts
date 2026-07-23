import { v4 as uuidv4 } from 'uuid';
import {
  Room, Player, Game, Card, GameStatus,
  HandRank, HandRankNames, HandRankMultipliers,
} from '../types';
import { createDeck, shuffleDeck, evaluateHand, compareHands, settle } from './gameLogic';

class RoomManager {
  private rooms: Map<number, Room> = new Map();
  private games: Map<string, Game> = new Map();
  private users: Map<number, { id: number; name: string; avatar: string; openid: string }> = new Map();
  private userIdCounter = 10000;

  // ========== 用户 ==========
  registerUser(name: string, avatar: string, openid: string) {
    // 已有用户直接返回
    const existing = [...this.users.values()].find(u => u.openid === openid);
    if (existing) return { userInfo: existing, token: `token_${existing.id}` };

    const id = ++this.userIdCounter;
    const user = { id, name, avatar, openid };
    this.users.set(id, user);
    return { userInfo: user, token: `token_${id}` };
  }

  getUser(userId: number) {
    return this.users.get(userId) || null;
  }

  // ========== 房间 ==========
  createRoom(userId: number, roomType: 1 | 2): Room {
    const user = this.getUser(userId);
    if (!user) throw new Error('用户不存在');

    const roomNumber = String(Math.floor(100000 + Math.random() * 900000));
    const roomId = Date.now();
    const player: Player = {
      userId,
      name: user.name,
      avatar: user.avatar,
      userType: 1,   // 创建者=庄家
      status: 2,      // 已准备
      state: 1,
      score: 1000,
      bet: 0,
      pokers: [],
      lookHand: false,
      show: false,
    };

    const room: Room = {
      roomId,
      roomNumber,
      roomType,
      creatorId: userId,
      status: 0,
      maxPlayers: 8,
      currentRound: 0,
      players: [player],
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(userId: number, roomNumber: string): Room {
    const user = this.getUser(userId);
    if (!user) throw new Error('用户不存在');

    const room = this.findRoomByNumber(roomNumber);
    if (!room) throw new Error('房间不存在');
    if (room.status === 1) throw new Error('游戏已开始，无法加入');
    if (room.players.length >= room.maxPlayers) throw new Error('房间已满');
    if (room.players.find(p => p.userId === userId)) throw new Error('你已在房间中');

    const player: Player = {
      userId,
      name: user.name,
      avatar: user.avatar,
      userType: 2,   // 闲家
      status: 1,      // 待准备
      state: 1,
      score: 1000,
      bet: 0,
      pokers: [],
      lookHand: false,
      show: false,
    };

    room.players.push(player);
    return room;
  }

  getRoom(roomId: number): Room | undefined {
    return this.rooms.get(roomId);
  }

  findRoomByNumber(roomNumber: string): Room | undefined {
    return [...this.rooms.values()].find(r => r.roomNumber === roomNumber);
  }

  exitRoom(userId: number, roomId: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('房间不存在');

    room.players = room.players.filter(p => p.userId !== userId);

    // 如果庄家退出且还有闲家，指定下一个闲家为庄家
    if (room.creatorId === userId && room.players.length > 0) {
      room.creatorId = room.players[0].userId;
      const newBanker = room.players[0];
      newBanker.userType = 1;
    }

    // 空房间删除
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    return room;
  }

  // 玩家准备/取消准备
  playerReady(userId: number, roomId: number, ready: boolean, bet: number): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('房间不存在');

    const player = room.players.find(p => p.userId === userId);
    if (!player) throw new Error('你不在房间中');

    player.status = ready ? 2 : 1;
    player.bet = bet;
    return room;
  }

  // 检查是否所有玩家都准备好了
  allReady(roomId: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.players.every(p => p.status === 2);
  }

  // ========== 游戏 ==========
  startGame(roomId: number, userId: number): Game {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('房间不存在');
    if (room.creatorId !== userId) throw new Error('只有庄家可以开始游戏');
    if (room.players.length < 2) throw new Error('至少需要2名玩家');
    if (room.status === 1) throw new Error('游戏已在进行中');

    room.status = 1;
    room.currentRound++;

    const gameId = `game_${uuidv4().slice(0, 8)}`;
    const deck = shuffleDeck(createDeck());

    const game: Game = {
      gameId,
      roomId,
      round: room.currentRound,
      dealerId: room.players.find(p => p.userType === 1)!.userId,
      status: GameStatus.Ready,
      deck,
      players: room.players.map(p => ({
        ...p,
        pokers: [],
        lookHand: false,
        show: false,
      })),
      phaseStartTime: Date.now(),
      phaseDuration: 120000, // 2分钟
    };

    this.games.set(gameId, game);
    room.gameId = gameId;
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  // 发牌
  dealCards(gameId: string): Game {
    const game = this.games.get(gameId);
    if (!game) throw new Error('游戏不存在');
    if (game.deck.length < game.players.length * 5) throw new Error('牌不够');

    game.status = GameStatus.Playing;
    game.phaseStartTime = Date.now();

    // 轮流发牌：每轮每人1张，共5轮
    const playerHands: Card[][] = game.players.map(() => []);
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < game.players.length; i++) {
        playerHands[i].push(game.deck.pop()!);
      }
    }

    game.players.forEach((player, i) => {
      player.pokers = playerHands[i];
    });

    return game;
  }

  // 玩家亮牌
  playerShowHand(gameId: string, userId: number): { game: Game; result?: any } {
    const game = this.games.get(gameId);
    if (!game) throw new Error('游戏不存在');

    const player = game.players.find(p => p.userId === userId);
    if (!player) throw new Error('玩家不在游戏中');
    if (player.show) throw new Error('已亮牌');

    // 判定手牌
    player.handResult = evaluateHand(player.pokers);
    player.show = true;

    // 所有玩家都亮牌后自动结算
    if (game.players.every(p => p.show)) {
      return { game, result: this.settleGame(game) };
    }

    return { game };
  }

  // 结算
  private settleGame(game: Game) {
    game.status = GameStatus.Settlement;

    const banker = game.players.find(p => p.userType === 1);
    if (!banker || !banker.handResult) return null;

    const settlements: any[] = [];
    let bankerTotalWin = 0;

    for (const player of game.players) {
      if (player.userType === 1 || !player.handResult) continue;

      const winAmount = settle(banker.handResult, player.handResult, player.bet || 1);
      player.score += winAmount;
      bankerTotalWin -= winAmount;

      settlements.push({
        userId: player.userId,
        name: player.name,
        hand: HandRankNames[player.handResult.rank] || '未知',
        multiplier: HandRankMultipliers[player.handResult.rank] || 1,
        winAmount,
        newScore: player.score,
      });
    }

    banker.score += bankerTotalWin;

    return {
      banker: {
        userId: banker.userId,
        name: banker.name,
        hand: HandRankNames[banker.handResult.rank] || '未知',
        multiplier: HandRankMultipliers[banker.handResult.rank] || 1,
        winAmount: bankerTotalWin,
        newScore: banker.score,
      },
      players: settlements,
    };
  }

  // 洗牌(新一局)
  shuffleGame(gameId: string): Game {
    const game = this.games.get(gameId);
    if (!game) throw new Error('游戏不存在');

    game.status = GameStatus.Ready;
    game.deck = shuffleDeck(createDeck());
    game.players.forEach(p => {
      p.pokers = [];
      p.lookHand = false;
      p.show = false;
      p.handResult = undefined;
      p.status = 2; // 保持准备状态
    });
    game.phaseStartTime = Date.now();
    return game;
  }

  // 清理游戏(游戏结束后清理状态，房间回到等待)
  endGame(roomId: number, gameId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = 0;
      room.gameId = undefined;
      room.players.forEach(p => {
        p.pokers = [];
        p.lookHand = false;
        p.show = false;
        p.handResult = undefined;
        p.status = 2; // 保持准备
      });
    }
    this.games.delete(gameId);
  }
}

export const roomManager = new RoomManager();
