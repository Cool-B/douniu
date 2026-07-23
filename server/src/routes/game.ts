import { Router, Request, Response } from 'express';
import { roomManager } from '../services/roomManager';
import { ApiResponse } from '../types';
import { evaluateHand } from '../services/gameLogic';

const router = Router();

// POST /poker/startGame
router.post('/startGame', (req: Request, res: Response) => {
  try {
    const { userId, roomId } = req.body;
    const game = roomManager.startGame(roomId, userId);
    res.json({
      code: 200,
      message: '游戏开始成功',
      data: {
        gameInfo: {
          gameId: game.gameId,
          roomId: game.roomId,
          round: game.round,
          dealerId: game.dealerId,
          status: game.status,
        },
        userInfoList: game.players,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/gameAction
// 通用操作路由(发牌/洗牌/亮牌/结算)
router.post('/gameAction', (req: Request, res: Response) => {
  try {
    const { gameId, userId, action } = req.body;
    if (!gameId || !action) {
      return res.json({ code: 400, message: '缺少必要参数', data: null } as ApiResponse);
    }

    const game = roomManager.getGame(gameId);
    if (!game) {
      return res.json({ code: 404, message: '游戏不存在', data: null } as ApiResponse);
    }

    let result: any = null;
    switch (action) {
      case 'shuffle': {
        const updated = roomManager.shuffleGame(gameId);
        result = { gameInfo: { gameId: updated.gameId, status: updated.status } };
        break;
      }
      case 'dealCards': {
        const updated = roomManager.dealCards(gameId);
        // 返回所有玩家的牌 (但服务端在 WS 推送时只给每人自己的牌)
        result = {
          gameId: updated.gameId,
          status: updated.status,
          players: updated.players.map(p => ({
            userId: p.userId,
            pokers: p.pokers, // 全明牌返回，简单起见
          })),
        };
        break;
      }
      case 'showHand': {
        const showResult = roomManager.playerShowHand(gameId, userId);
        result = {
          gameId: showResult.game.gameId,
          status: showResult.game.status,
          players: showResult.game.players.map(p => ({
            userId: p.userId,
            pokers: p.pokers,
            show: p.show,
            handResult: p.handResult,
          })),
          settlement: showResult.result,
        };
        break;
      }
      case 'settlement': {
        // 强制结算
        result = { message: '请使用 showHand 自动结算' };
        break;
      }
      case 'evaluate': {
        // 客户端自己判定 (调试用)
        const player = game.players.find(p => p.userId === userId);
        if (player) {
          result = { handResult: evaluateHand(player.pokers) };
        }
        break;
      }
      default:
        return res.json({ code: 400, message: `未知操作: ${action}`, data: null } as ApiResponse);
    }

    res.json({
      code: 200,
      message: '操作成功',
      data: { actionResult: result },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/endGame (结束当前局, 回到等待)
router.post('/endGame', (req: Request, res: Response) => {
  try {
    const { roomId, gameId } = req.body;
    roomManager.endGame(roomId, gameId);
    res.json({ code: 200, message: '本局已结束', data: null } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

export default router;
