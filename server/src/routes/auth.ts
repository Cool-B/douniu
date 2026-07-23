import { Router, Request, Response } from 'express';
import { roomManager } from '../services/roomManager';
import { ApiResponse } from '../types';

const router = Router();

// POST /api/wx/user/login
router.post('/user/login', (req: Request, res: Response) => {
  try {
    const { code, name, avatar } = req.body;

    if (!code || !name) {
      return res.json({
        code: 400,
        message: '缺少必要参数',
        data: null,
      } as ApiResponse);
    }

    // 使用 code 作为 openid (实际应该调用微信接口换取 openid)
    const openid = `wx_${code.slice(0, 16)}`;
    const result = roomManager.registerUser(name, avatar || '', openid);

    res.json({
      code: 200,
      message: '登录成功',
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    res.json({
      code: 500,
      message: error.message || '服务器错误',
      data: null,
    } as ApiResponse);
  }
});

export default router;
