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
    // 开发期用本地头像 + 4位随机数生成友好昵称, 用户可在个人资料页改名
    let finalName = name;
    let finalAvatar = avatar;
    if (loginType === 'quick' || (!finalName && !finalAvatar)) {
      const random4 = String(Math.floor(1000 + Math.random() * 9000));
      finalName = finalName || `斗牛玩家${random4}`;
      // 用空字符串让前端用本地默认头像兜底, 避免外网白名单问题
      finalAvatar = finalAvatar || '';
    }

    if (!finalName) {
      return res.json({
        code: 400,
        message: '缺少必要参数: name',
        data: null,
      } as ApiResponse);
    }

    // 空头像也用本地默认
    if (!finalAvatar) {
      finalAvatar = '';
    }

    const result = roomManager.registerUser(finalName, finalAvatar, openid);

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
