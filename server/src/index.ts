import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import authRoutes from './routes/auth';
import roomRoutes from './routes/room';
import gameRoutes from './routes/game';
import { roomManager } from './services/roomManager';
import { WSMessageType, WSMessage } from './types';
import { evaluateHand, settle } from './services/gameLogic';
import { HandRankNames, HandRankMultipliers } from './types';

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

app.use(cors());
app.use(express.json());

// 请求日志
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 路由
app.get('/', (_req, res) => {
  res.json({ code: 200, message: '斗牛游戏后端服务', version: '1.0.0' });
});

app.get('/health', (_req, res) => {
  res.json({ code: 200, message: 'healthy', timestamp: Date.now() });
});

app.use('/api/wx', authRoutes);
app.use('/poker', roomRoutes);
app.use('/poker', gameRoutes);

// 错误处理
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

// ============ WebSocket 实时通信 ============
const userSockets: Map<number, string> = new Map(); // userId -> socketId
const socketUsers: Map<string, number> = new Map(); // socketId -> userId

function broadcastToRoom(roomId: number, msg: WSMessage) {
  io.to(`room_${roomId}`).emit('message', msg);
}

function sendToUser(userId: number, msg: WSMessage) {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('message', msg);
  }
}

io.on('connection', (socket: Socket) => {
  console.log(`[WS] 客户端连接: ${socket.id}`);

  // 客户端标识自己的 userId
  socket.on('register', (data: { userId: number; roomId?: number }) => {
    const { userId, roomId } = data;
    if (userId) {
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      console.log(`[WS] 用户 ${userId} 注册到 socket ${socket.id}`);
      if (roomId) {
        socket.join(`room_${roomId}`);
      }
    }
  });

  // 游戏消息
  socket.on('gameMessage', (msg: WSMessage) => {
    const userId = socketUsers.get(socket.id);
    if (!userId) {
      socket.emit('message', { type: WSMessageType.Error, message: '未注册用户' } as WSMessage);
      return;
    }

    try {
      switch (msg.type) {
        case WSMessageType.JoinRoom: {
          const { roomId } = msg;
          socket.join(`room_${roomId}`);
          const room = roomManager.getRoom(roomId);
          if (room) {
            broadcastToRoom(roomId, {
              type: WSMessageType.PlayerChange,
              userInfoResList: room.players,
            });
          }
          break;
        }

        case WSMessageType.PlayerChange: {
          // 准备/取消准备
          const { roomId, status, bet } = msg;
          const room = roomManager.playerReady(userId, roomId, status === 2, bet || 1);
          broadcastToRoom(roomId, {
            type: WSMessageType.PlayerChange,
            userInfoResList: room.players,
          });
          break;
        }

        case WSMessageType.GameStart: {
          // 开始游戏
          const { roomId } = msg;
          const game = roomManager.startGame(roomId, userId);
          // 发牌
          roomManager.dealCards(game.gameId);
          const updatedGame = roomManager.getGame(game.gameId)!;

          // 给每人只发自己的牌
          updatedGame.players.forEach(player => {
            sendToUser(player.userId, {
              type: WSMessageType.DealCards,
              gameId: game.gameId,
              userId: player.userId,
              pokers: player.pokers,
              isGaming: true,
            });
          });

          // 广播游戏开始
          broadcastToRoom(roomId, {
            type: WSMessageType.GameStart,
            gameId: game.gameId,
            dealerId: game.dealerId,
          });
          break;
        }

        case WSMessageType.Shuffle: {
          // 洗牌 (开始新一局)
          const { roomId, gameId } = msg;
          roomManager.shuffleGame(gameId);
          broadcastToRoom(roomId, {
            type: WSMessageType.Shuffle,
            gameId,
          });
          break;
        }

        case WSMessageType.ShowHand: {
          // 亮牌
          const { gameId, roomId } = msg;
          const showResult = roomManager.playerShowHand(gameId, userId);

          // 广播该玩家亮牌结果
          broadcastToRoom(roomId, {
            type: WSMessageType.ShowHand,
            gameId,
            userId,
            players: showResult.game.players.map(p => ({
              userId: p.userId,
              show: p.show,
              handResult: p.handResult,
              pokers: p.show ? p.pokers : undefined, // 亮牌后才公开
            })),
          });

          // 全员亮牌完成, 广播结算
          if (showResult.result) {
            broadcastToRoom(roomId, {
              type: WSMessageType.Settlement,
              gameId,
              result: showResult.result,
            });
          }
          break;
        }

        case WSMessageType.Bet: {
          // 下注
          const { roomId, bet } = msg;
          const room = roomManager.playerReady(userId, roomId, true, bet);
          broadcastToRoom(roomId, {
            type: WSMessageType.PlayerChange,
            userInfoResList: room.players,
          });
          break;
        }

        default:
          console.warn(`[WS] 未知消息类型: ${msg.type}`);
      }
    } catch (error: any) {
      socket.emit('message', {
        type: WSMessageType.Error,
        message: error.message,
      } as WSMessage);
    }
  });

  socket.on('disconnect', () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      console.log(`[WS] 用户 ${userId} 断开连接`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 斗牛游戏后端服务已启动`);
  console.log(`📡 HTTP: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

export { io, app, server };
