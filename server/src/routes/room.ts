import { Router, Request, Response } from 'express';
import { roomManager } from '../services/roomManager';
import { ApiResponse } from '../types';

const router = Router();

// POST /poker/createRoom
router.post('/createRoom', (req: Request, res: Response) => {
  try {
    const { userId, roomType } = req.body;
    if (!userId || !roomType) {
      return res.json({ code: 400, message: '缺少必要参数', data: null } as ApiResponse);
    }
    const room = roomManager.createRoom(userId, roomType);
    const user = roomManager.getUser(userId);
    res.json({
      code: 200,
      message: '房间创建成功',
      data: { roomInfo: room, userInfo: user },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/joinRoom
router.post('/joinRoom', (req: Request, res: Response) => {
  try {
    const { userId, roomNumber } = req.body;
    if (!userId || !roomNumber) {
      return res.json({ code: 400, message: '缺少必要参数', data: null } as ApiResponse);
    }
    const room = roomManager.joinRoom(userId, roomNumber);
    const user = roomManager.getUser(userId);
    res.json({
      code: 200,
      message: '加入房间成功',
      data: { roomInfo: room, userInfo: user },
    } as ApiResponse);
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('已满') ? 400 :
                       error.message.includes('已开始') ? 400 : 500;
    res.json({ code: statusCode, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/getRoomInfo
router.post('/getRoomInfo', (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return res.json({ code: 404, message: '房间不存在', data: null } as ApiResponse);
    }
    res.json({
      code: 200,
      message: '获取房间信息成功',
      data: { roomInfo: room, userInfoList: room.players },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/playerReady
router.post('/playerReady', (req: Request, res: Response) => {
  try {
    const { userId, roomId, status, bet } = req.body;
    const ready = status === 2;
    const room = roomManager.playerReady(userId, roomId, ready, bet || 1);
    res.json({
      code: 200,
      message: ready ? '已准备' : '已取消准备',
      data: { roomInfo: room, allReady: roomManager.allReady(roomId) },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/exitRoom
router.post('/exitRoom', (req: Request, res: Response) => {
  try {
    const { userId, roomId } = req.body;
    const room = roomManager.exitRoom(userId, roomId);
    const user = roomManager.getUser(userId);
    res.json({
      code: 200,
      message: '退出房间成功',
      data: { roomInfo: room, userInfo: user },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/addAssistantOrChangeSeat
// 庄家: 添加机器人到空位; 闲家: 换座位
router.post('/addAssistantOrChangeSeat', (req: Request, res: Response) => {
  try {
    const { roomId, userId, seatIndex, isBanker } = req.body;
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return res.json({ code: 404, message: '房间不存在', data: null } as ApiResponse);
    }

    if (isBanker) {
      // 添加机器人
      const botId = 90000 + Math.floor(Math.random() * 1000);
      const botNames = ['智能小将', 'AI玩家', '机器人小明', '智能玩家', 'AI打手', '陪练小助手'];
      const bot = roomManager.addBotToSeat(roomId, seatIndex, {
        id: botId,
        name: botNames[Math.floor(Math.random() * botNames.length)],
        avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        userType: 3,
        status: 2, // 机器人默认已准备
        score: 0,
        bet: 1,
      });
      return res.json({
        code: 200,
        message: '添加机器人成功',
        data: { roomInfo: bot },
      } as ApiResponse);
    } else {
      // 闲家换座位
      const updated = roomManager.changeSeat(roomId, userId, seatIndex);
      return res.json({
        code: 200,
        message: '换座成功',
        data: { roomInfo: updated },
      } as ApiResponse);
    }
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/kickPlayer
router.post('/kickPlayer', (req: Request, res: Response) => {
  try {
    const { roomId, userId, player } = req.body;
    if (!player || !player.userId) {
      return res.json({ code: 400, message: '缺少玩家信息', data: null } as ApiResponse);
    }
    const room = roomManager.removePlayer(roomId, player.userId);
    return res.json({
      code: 200,
      message: '踢出成功',
      data: { roomInfo: room },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// POST /poker/changeBet
router.post('/changeBet', (req: Request, res: Response) => {
  try {
    const { roomId, userId, bet } = req.body;
    const room = roomManager.changeBet(roomId, userId, bet);
    return res.json({
      code: 200,
      message: '下注成功',
      data: { roomInfo: room },
    } as ApiResponse);
  } catch (error: any) {
    res.json({ code: 500, message: error.message, data: null } as ApiResponse);
  }
});

// GET /poker/listRooms (辅助: 获取所有等待中的房间)
router.get('/listRooms', (_req: Request, res: Response) => {
  const rooms = [...roomManager['rooms'].values()].filter(r => r.status === 0);
  res.json({
    code: 200,
    message: '获取成功',
    data: { rooms },
  } as ApiResponse);
});

export default router;
