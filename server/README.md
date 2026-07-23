# 斗牛游戏后端服务

微信小程序斗牛游戏后端，提供 HTTP API + WebSocket 实时通信。

## 启动

```bash
# 安装依赖
npm install

# 开发模式 (热重载)
npm run dev

# 生产构建 + 启动
npm run build
npm start
```

默认监听 `3000` 端口,可用 `PORT=8080 npm start` 修改。

## 环境要求

- Node.js >= 18
- TypeScript 5.x (开发依赖)

## API 端点

### 用户
- `POST /api/wx/user/login` - 微信登录

### 房间
- `POST /poker/createRoom` - 创建房间 `{userId, roomType}`
- `POST /poker/joinRoom` - 加入房间 `{userId, roomNumber}`
- `POST /poker/getRoomInfo` - 获取房间信息 `{roomId}`
- `POST /poker/ready` - 准备/取消 `{userId, roomId, status, bet}`
- `POST /poker/exitRoom` - 退出房间 `{userId, roomId}`
- `GET  /poker/listRooms` - 列出等待中的房间

### 游戏
- `POST /poker/startGame` - 开始游戏 `{userId, roomId}`
- `POST /poker/gameAction` - 游戏操作 `{gameId, userId, action}` 其中 action:
  - `shuffle` - 洗牌
  - `dealCards` - 发牌
  - `showHand` - 亮牌
  - `evaluate` - 客户端自己判定手牌
- `POST /poker/endGame` - 结束本局 `{roomId, gameId}`

## WebSocket

连接: `ws://host:3000`

### 客户端 → 服务端

```json
// 1. 注册
{ "event": "register", "data": { "userId": 1001, "roomId": 2001 } }

// 2. 发送游戏消息
{ "event": "gameMessage", "data": { "type": 1, "roomId": 2001 } }
```

消息 `type` 含义:
- 1 - 加入房间
- 2 - 准备/取消准备
- 3 - 开始游戏 (自动发牌)
- 4 - 洗牌
- 5 - 发牌
- 7 - 亮牌
- 8 - 结算 (自动推送, 不需发送)
- 9 - 下注

### 服务端 → 客户端

`{ type, ... }` 格式推送:
- type=1/2 - 玩家列表更新
- type=3 - 游戏开始
- type=5 - 发牌 (`userId` + `pokers` 只发给对应玩家)
- type=7 - 有人亮牌
- type=8 - 结算结果
- type=10 - 错误

## 数据存储

当前用内存 Map 存储,服务重启后数据丢失。
生产环境建议接 Redis (房间/会话) + PostgreSQL/MySQL (用户/战绩)。

## 项目结构

```
server/
├── src/
│   ├── index.ts          # 入口 (Express + Socket.IO)
│   ├── routes/
│   │   ├── auth.ts       # 登录
│   │   ├── room.ts       # 房间
│   │   └── game.ts       # 游戏
│   ├── services/
│   │   ├── roomManager.ts # 房间/游戏状态管理
│   │   └── gameLogic.ts   # 斗牛牌型判定
│   └── types/
│       └── index.ts      # 类型定义
├── package.json
└── tsconfig.json
```
