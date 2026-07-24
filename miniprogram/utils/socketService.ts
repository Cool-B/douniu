import { WS_BASE_URL } from '../config';

export enum WSMessageType {
  JoinRoom = 1,       // 加入房间
  PlayerChange = 2,   // 玩家状态变更
  GameStart = 3,      // 游戏开始
  Shuffle = 4,        // 洗牌
  DealCards = 5,      // 发牌(收到自己牌)
  CardState = 6,      // 牌局状态
  ShowHand = 7,       // 亮牌
  Settlement = 8,     // 结算
  Bet = 9,            // 下注
  Error = 10,         // 错误
  PhaseChange = 11,   // 阶段变更
}

export interface WSMessage {
  type: number;
  [key: string]: any;
}

type MessageHandler = (msg: WSMessage) => void;

class SocketService {
  private socketTask: WechatMiniprogram.SocketTask | null = null;
  private connected = false;
  private userId: number = 0;
  private roomId: number = 0;
  private handlers: Map<number, MessageHandler[]> = new Map();
  private url: string = WS_BASE_URL;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatTimer: any = null;

  /** 初始化并连接 (在 app onLaunch 时调用一次) */
  connect(userId: number, roomId: number) {
    if (this.connected) {
      console.log('[WS] 已连接, 跳过');
      return;
    }
    this.userId = userId;
    this.roomId = roomId;

    console.log(`[WS] 连接: ${this.url}`);
    this.socketTask = wx.connectSocket({
      url: this.url,
      success: () => console.log('[WS] 连接请求已发送'),
      fail: (err) => console.error('[WS] 连接失败:', err),
    });

    this.socketTask.onOpen(() => {
      console.log('[WS] 已连接');
      this.connected = true;
      this.reconnectAttempts = 0;
      // 注册身份
      this.send('register', { userId: this.userId, roomId: this.roomId });
      // 启动心跳
      this.startHeartbeat();
    });

    this.socketTask.onMessage((res) => {
      try {
        const msg: WSMessage = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        this.dispatch(msg);
      } catch (e) {
        console.error('[WS] 消息解析失败:', res.data, e);
      }
    });

    this.socketTask.onError((err) => {
      console.error('[WS] 错误:', err);
    });

    this.socketTask.onClose(() => {
      console.log('[WS] 连接关闭');
      this.connected = false;
      this.stopHeartbeat();
      this.attemptReconnect();
    });
  }

  /** 发送游戏消息 */
  sendGameMessage(msg: WSMessage) {
    this.send('gameMessage', msg);
  }

  private send(event: string, data: any) {
    if (!this.socketTask) {
      console.warn('[WS] socketTask 不存在, 无法发送');
      return;
    }
    try {
      this.socketTask.send({
        data: JSON.stringify({ event, data }),
      });
    } catch (e) {
      console.error('[WS] 发送失败:', e);
    }
  }

  /** 监听指定类型消息 */
  on(type: WSMessageType, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
  }

  /** 移除监听 */
  off(type: WSMessageType, handler?: MessageHandler) {
    if (!handler) {
      this.handlers.delete(type);
      return;
    }
    const list = this.handlers.get(type);
    if (list) {
      const idx = list.indexOf(handler);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  private dispatch(msg: WSMessage) {
    const handlers = this.handlers.get(msg.type) || [];
    handlers.forEach(h => {
      try {
        h(msg);
      } catch (e) {
        console.error('[WS] handler error:', e);
      }
    });
    // 通用 handler
    const allHandlers = this.handlers.get(0);
    if (allHandlers) {
      allHandlers.forEach((h: any) => h(msg));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.send('ping', { ts: Date.now() });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WS] 达到最大重连次数, 放弃');
      return;
    }
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.log(`[WS] ${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.userId, this.roomId);
    }, delay);
  }

  /** 主动关闭 */
  close() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socketTask) {
      try { this.socketTask.close({ code: 1000 }); } catch (e) { /* ignore */ }
      this.socketTask = null;
    }
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }
}

export const socketService = new SocketService();
