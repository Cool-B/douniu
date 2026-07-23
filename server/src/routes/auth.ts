import { Router, Request, Response } from 'express';
import { roomManager } from '../services/roomManager';
import { ApiResponse } from '../types';

const router = Router();

// POST /api/wx/user/login
// 兼容三种登录场景：
//   1. 手动登录: { code, name, avatar }        - 用户手输昵称 + 选头像
//   2. 快速登录: { code, loginType: 'quick', encryptedData, iv, phoneCode } - 微信一键登录
//   3. Mock 调试: { code, name?, avatar? }     - 任意测试
router.post('/user/login', (req: Request, res: Response) => {
  try {
    const { code, name, avatar, loginType, encryptedData, iv, phoneCode } = req.body;

    if (!code) {
      return res.json({
        code: 400,
        message: '缺少必要参数: code',
        data: null,
      } as ApiResponse);
    }

    // 使用 code 作为 openid (实际生产应该调 code2Session 拿真实 openid)
    const openid = `wx_${code.slice(0, 16)}`;

    // 快速登录: 正式环境应该用 session_key + encryptedData + iv 解密手机号/昵称
    // 开发期直接给个默认昵称 + 默认头像, 让流程跑通
    let finalName = name;
    let finalAvatar = avatar;
    if (loginType === 'quick' || (!finalName && !finalAvatar)) {
      finalName = finalName || `微信用户${code.slice(-4)}`;
      finalAvatar = finalAvatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
    }

    if (!finalName) {
      return res.json({
        code: 400,
        message: '缺少必要参数: name',
        data: null,
      } as ApiResponse);
    }

    const result = roomManager.registerUser(finalName, finalAvatar || '', openid);

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
