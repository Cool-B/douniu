# 斗牛扑克游戏 - 数据模型与API文档

## 1. 数据模型总览

### 1.1 实体关系图 (ER图)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │───────│   RoomUser   │───────│     Room     │
│   (用户)     │  1:N  │  (房间成员)  │  N:1  │   (房间)     │
└──────────────┘       └──────────────┘       └──────────────┘
       │                                              │
       │ 1:N                                          │ 1:N
       │                                              │
       ▼                                              ▼
┌──────────────┐                              ┌──────────────┐
│  UserStats   │                              │     Game     │
│  (用户统计)  │                              │   (游戏局)   │
└──────────────┘                              └──────────────┘
                                                      │
                                                      │ 1:N
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │  GameRecord  │
                                              │  (游戏记录)  │
                                              └──────────────┘
```

---

## 2. 核心数据模型

### 2.1 User (用户表)

**表名**: `users`

**用途**: 存储用户基本信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 用户ID | PK, AUTO_INCREMENT |
| openid | VARCHAR(64) | 微信OpenID | UNIQUE, NOT NULL |
| username | VARCHAR(32) | 用户名 | NOT NULL |
| nickname | VARCHAR(32) | 昵称 | NOT NULL |
| avatar | VARCHAR(255) | 头像URL | |
| phone | VARCHAR(20) | 手机号 | |
| sex | TINYINT | 性别(1男2女0未知) | DEFAULT 0 |
| score | INT | 积分 | DEFAULT 1000 |
| level | INT | 等级 | DEFAULT 1 |
| total_games | INT | 总局数 | DEFAULT 0 |
| win_games | INT | 胜场数 | DEFAULT 0 |
| status | TINYINT | 状态(1正常2封禁) | DEFAULT 1 |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |

**索引**:
```sql
CREATE INDEX idx_openid ON users(openid);
CREATE INDEX idx_score ON users(score DESC);
```

**TypeScript接口**:
```typescript
interface User {
  id: number;
  openid: string;
  username: string;
  nickname: string;
  avatar: string;
  phone?: string;
  sex: 0 | 1 | 2;
  score: number;
  level: number;
  total_games: number;
  win_games: number;
  status: 1 | 2;
  created_at: Date;
  updated_at: Date;
}
```

---

### 2.2 Room (房间表)

**表名**: `rooms`

**用途**: 存储房间信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 房间ID | PK |
| room_number | VARCHAR(8) | 房间号(6位) | UNIQUE, NOT NULL |
| creator_id | INT | 创建者ID | NOT NULL, FK→users.id |
| room_type | TINYINT | 房间类型(1普通2快速) | DEFAULT 1 |
| max_players | TINYINT | 最大人数 | DEFAULT 5 |
| current_players | TINYINT | 当前人数 | DEFAULT 1 |
| base_bet | INT | 底注 | DEFAULT 1 |
| status | TINYINT | 状态(1等待2游戏中3已结束) | DEFAULT 1 |
| is_gaming | BOOLEAN | 是否游戏中 | DEFAULT FALSE |
| is_private | BOOLEAN | 是否私密房间 | DEFAULT FALSE |
| password | VARCHAR(32) | 房间密码(可选) | |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |
| expired_at | DATETIME | 过期时间 | |

**索引**:
```sql
CREATE INDEX idx_room_number ON rooms(room_number);
CREATE INDEX idx_creator ON rooms(creator_id);
CREATE INDEX idx_status ON rooms(status);
```

**TypeScript接口**:
```typescript
interface Room {
  id: number;
  room_number: string;
  creator_id: number;
  room_type: 1 | 2;
  max_players: number;
  current_players: number;
  base_bet: number;
  status: 1 | 2 | 3;
  is_gaming: boolean;
  is_private: boolean;
  password?: string;
  created_at: Date;
  updated_at: Date;
  expired_at: Date;
}
```

---

### 2.3 RoomUser (房间成员表)

**表名**: `room_users`

**用途**: 存储房间内玩家信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 记录ID | PK, AUTO_INCREMENT |
| room_id | BIGINT | 房间ID | NOT NULL, FK→rooms.id |
| user_id | INT | 用户ID(0为空位) | NOT NULL |
| seat_index | TINYINT | 座位号(0-8) | NOT NULL |
| user_type | TINYINT | 类型(1庄2闲3机器人4空位) | NOT NULL |
| user_status | TINYINT | 状态(1未准备2已准备) | DEFAULT 1 |
| online_status | TINYINT | 在线(1在线2离线3退出) | DEFAULT 1 |
| bet_amount | INT | 下注倍数 | DEFAULT 1 |
| current_score | INT | 当前局分数变化 | DEFAULT 0 |
| joined_at | DATETIME | 加入时间 | NOT NULL |

**索引**:
```sql
CREATE UNIQUE INDEX idx_room_seat ON room_users(room_id, seat_index);
CREATE INDEX idx_room_user ON room_users(room_id, user_id);
```

**TypeScript接口**:
```typescript
interface RoomUser {
  id: number;
  room_id: number;
  user_id: number;
  seat_index: number;
  user_type: 1 | 2 | 3 | 4;
  user_status: 1 | 2;
  online_status: 1 | 2 | 3;
  bet_amount: number;
  current_score: number;
  joined_at: Date;
}
```

---

### 2.4 Game (游戏局表)

**表名**: `games`

**用途**: 存储每一局游戏的信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 游戏ID | PK |
| room_id | BIGINT | 房间ID | NOT NULL, FK→rooms.id |
| round_number | INT | 回合数 | NOT NULL |
| banker_id | INT | 庄家ID | NOT NULL, FK→users.id |
| game_status | TINYINT | 状态(1准备2发牌3进行4结算) | DEFAULT 1 |
| start_time | DATETIME | 开始时间 | NOT NULL |
| end_time | DATETIME | 结束时间 | |

**索引**:
```sql
CREATE INDEX idx_room_game ON games(room_id);
CREATE INDEX idx_banker ON games(banker_id);
```

**TypeScript接口**:
```typescript
interface Game {
  id: number;
  room_id: number;
  round_number: number;
  banker_id: number;
  game_status: 1 | 2 | 3 | 4;
  start_time: Date;
  end_time?: Date;
}
```

---

### 2.5 GameRecord (游戏记录表)

**表名**: `game_records`

**用途**: 存储每局每个玩家的详细记录

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 记录ID | PK, AUTO_INCREMENT |
| game_id | BIGINT | 游戏ID | NOT NULL, FK→games.id |
| user_id | INT | 用户ID | NOT NULL, FK→users.id |
| seat_index | TINYINT | 座位号 | NOT NULL |
| user_type | TINYINT | 类型(1庄2闲3机器人) | NOT NULL |
| bet_amount | INT | 下注倍数 | NOT NULL |
| cards | JSON | 手牌(JSON数组) | NOT NULL |
| card_type | VARCHAR(32) | 牌型名称 | |
| point_number | TINYINT | 牛点数(0-10) | |
| is_win | BOOLEAN | 是否赢 | |
| score_change | INT | 积分变化 | DEFAULT 0 |
| created_at | DATETIME | 创建时间 | NOT NULL |

**cards字段示例**:
```json
[
  {"suit": "Spade", "number": 10},
  {"suit": "Heart", "number": 7},
  {"suit": "Club", "number": 3},
  {"suit": "Diamond", "number": 12},
  {"suit": "Spade", "number": 5}
]
```

**索引**:
```sql
CREATE INDEX idx_game_record ON game_records(game_id);
CREATE INDEX idx_user_record ON game_records(user_id);
```

**TypeScript接口**:
```typescript
interface GameRecord {
  id: number;
  game_id: number;
  user_id: number;
  seat_index: number;
  user_type: 1 | 2 | 3;
  bet_amount: number;
  cards: {suit: string, number: number}[];
  card_type: string;
  point_number: number;
  is_win: boolean;
  score_change: number;
  created_at: Date;
}
```

---

### 2.6 UserStats (用户统计表)

**表名**: `user_stats`

**用途**: 存储用户的详细统计数据

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 记录ID | PK, AUTO_INCREMENT |
| user_id | INT | 用户ID | UNIQUE, NOT NULL, FK→users.id |
| total_games | INT | 总局数 | DEFAULT 0 |
| win_games | INT | 胜局数 | DEFAULT 0 |
| lose_games | INT | 负局数 | DEFAULT 0 |
| draw_games | INT | 平局数 | DEFAULT 0 |
| max_win_streak | INT | 最高连胜 | DEFAULT 0 |
| current_win_streak | INT | 当前连胜 | DEFAULT 0 |
| total_bet | BIGINT | 累计下注 | DEFAULT 0 |
| total_win_score | BIGINT | 累计赢分 | DEFAULT 0 |
| total_lose_score | BIGINT | 累计输分 | DEFAULT 0 |
| max_single_win | INT | 单局最大赢分 | DEFAULT 0 |
| max_single_lose | INT | 单局最大输分 | DEFAULT 0 |
| niu_niu_count | INT | 牛牛次数 | DEFAULT 0 |
| bomb_count | INT | 炸弹次数 | DEFAULT 0 |
| five_small_count | INT | 五小牛次数 | DEFAULT 0 |
| updated_at | DATETIME | 更新时间 | NOT NULL |

**TypeScript接口**:
```typescript
interface UserStats {
  id: number;
  user_id: number;
  total_games: number;
  win_games: number;
  lose_games: number;
  draw_games: number;
  max_win_streak: number;
  current_win_streak: number;
  total_bet: number;
  total_win_score: number;
  total_lose_score: number;
  max_single_win: number;
  max_single_lose: number;
  niu_niu_count: number;
  bomb_count: number;
  five_small_count: number;
  updated_at: Date;
}
```

---

## 3. API接口定义

### 3.1 接口规范

**Base URL**: `https://api.yourdomain.com`

**通用请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**通用响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "data": {},
  "timestamp": 1703056123456
}
```

**状态码**:
| Code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

### 3.2 用户相关API

#### 3.2.1 微信登录

**接口**: `POST /api/wx/user/login`

**说明**: 用户通过微信授权登录

**请求参数**:
```typescript
{
  code: string;        // 微信登录code
  name: string;        // 用户昵称
  avatar: string;      // 头像URL
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "登录成功",
  data: {
    id: number;
    openid: string;
    username: string;
    nickname: string;
    avatar: string;
    score: number;
    level: number;
    token: string;      // JWT token
  }
}
```

**错误码**:
- 400: code无效
- 500: 服务器错误

---

#### 3.2.2 获取用户信息

**接口**: `GET /api/user/info`

**说明**: 获取当前登录用户的详细信息

**请求参数**: 无 (通过token识别)

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    id: number;
    nickname: string;
    avatar: string;
    score: number;
    level: number;
    total_games: number;
    win_games: number;
    win_rate: number;    // 计算得出
  }
}
```

---

#### 3.2.3 更新用户信息

**接口**: `PUT /api/user/info`

**说明**: 更新用户昵称、头像等信息

**请求参数**:
```typescript
{
  nickname?: string;
  avatar?: string;
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "更新成功",
  data: {
    // 更新后的用户信息
  }
}
```

**限制**:
- 昵称7天内只能修改1次
- 昵称长度2-12字符

---

### 3.3 房间相关API

#### 3.3.1 创建房间

**接口**: `POST /poker/createRoom`

**说明**: 创建新的游戏房间

**请求参数**:
```typescript
{
  userId: number;
  roomType: 1 | 2;     // 1普通 2快速
  maxPlayers?: number; // 可选,默认5
  baseBet?: number;    // 可选,默认1
  isPrivate?: boolean; // 可选,默认false
  password?: string;   // 私密房间密码
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "房间创建成功",
  data: {
    roomInfo: {
      roomId: number;
      roomNumber: string;    // 6位房间号
      creatorId: number;
      maxPlayers: number;
      currentPlayers: number;
      baseBet: number;
      status: 1;
      isGaming: false;
      players: [
        {
          userId: number;
          nickname: string;
          avatar: string;
          seatIndex: number;
          userType: 1;      // 创建者为庄家
          status: 1;
          score: number;
        },
        // ... 其他空座位
      ]
    }
  }
}
```

---

#### 3.3.2 加入房间

**接口**: `POST /poker/joinRoom`

**说明**: 通过房间号加入房间

**请求参数**:
```typescript
{
  userId: number;
  roomNumber: string;  // 6位房间号
  password?: string;   // 私密房间需提供密码
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "加入房间成功",
  data: {
    roomInfo: {
      // 完整房间信息
    }
  }
}
```

**错误码**:
- 404: 房间不存在
- 400: 房间已满
- 403: 密码错误
- 409: 游戏进行中,不允许加入

---

#### 3.3.3 获取房间信息

**接口**: `POST /poker/getRoomInfo`

**说明**: 获取指定房间的详细信息

**请求参数**:
```typescript
{
  roomId: number;
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    roomInfo: {
      roomId: number;
      roomNumber: string;
      creatorId: number;
      maxPlayers: number;
      currentPlayers: number;
      baseBet: number;
      status: number;
      isGaming: boolean;
      isStart: boolean;
      isStartDeal: boolean;
      isDealComplete: boolean;
      players: Player[];
    }
  }
}
```

---

#### 3.3.4 退出房间

**接口**: `POST /poker/exitRoom`

**说明**: 玩家退出房间

**请求参数**:
```typescript
{
  roomId: number;
  userId: number;
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "退出房间成功",
  data: {
    roomInfo: null | {
      // 如果房间未解散,返回更新后的房间信息
    }
  }
}
```

**业务逻辑**:
- 如果是庄家退出,转让庄家身份给下一个玩家
- 如果所有玩家退出,解散房间
- 如果游戏中退出,扣除相应积分

---

#### 3.3.5 获取房间列表

**接口**: `GET /poker/rooms`

**说明**: 获取大厅房间列表

**请求参数**:
```typescript
{
  page?: number;       // 页码,默认1
  pageSize?: number;   // 每页数量,默认20
  status?: number;     // 筛选状态(1等待中)
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    total: number;
    page: number;
    pageSize: number;
    rooms: [
      {
        roomId: number;
        roomNumber: string;
        currentPlayers: number;
        maxPlayers: number;
        baseBet: number;
        isPrivate: boolean;
        creatorName: string;
      }
    ]
  }
}
```

---

### 3.4 游戏相关API

#### 3.4.1 开始游戏

**接口**: `POST /poker/startGame`

**说明**: 庄家发起游戏开始

**请求参数**:
```typescript
{
  roomId: number;
  userId: number;      // 必须是庄家
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "游戏开始成功",
  data: {
    gameInfo: {
      gameId: number;
      roomId: number;
      roundNumber: number;
      bankerId: number;
      gameStatus: 1;
      startTime: string;
    }
  }
}
```

**前置条件**:
- 至少2名玩家
- 所有闲家已准备
- 操作者必须是庄家

---

#### 3.4.2 玩家准备

**接口**: `POST /poker/playerReady`

**说明**: 闲家准备并设置下注倍数

**请求参数**:
```typescript
{
  roomId: number;
  userId: number;
  betAmount: number;   // 下注倍数(1-10)
  status: 1 | 2;       // 1取消准备 2确认准备
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    roomInfo: {
      // 更新后的房间信息
    }
  }
}
```

**验证**:
- 下注倍数在1-10范围内
- 用户积分足够支付可能的最大损失

---

#### 3.4.3 发牌

**接口**: `POST /poker/dealCards`

**说明**: 庄家执行发牌操作

**请求参数**:
```typescript
{
  gameId: number;
  roomId: number;
  userId: number;      // 必须是庄家
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "发牌成功",
  data: {
    gameInfo: {
      gameId: number;
      players: [
        {
          userId: number;
          cards: [
            {suit: string, number: number}
          ]
        }
      ]
    }
  }
}
```

**业务逻辑**:
- 服务端生成并洗牌
- 给每个已准备的玩家发5张牌
- 更新游戏状态为"进行中"

---

#### 3.4.4 结算

**接口**: `POST /poker/settlement`

**说明**: 庄家触发结算

**请求参数**:
```typescript
{
  gameId: number;
  roomId: number;
  userId: number;
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "结算成功",
  data: {
    settlement: [
      {
        userId: number;
        nickname: string;
        avatar: string;
        cards: Card[];
        cardType: string;    // 牌型名称
        pointNumber: number;
        isWin: boolean;
        scoreChange: number; // 积分变化
        totalScore: number;  // 总积分
      }
    ]
  }
}
```

**业务逻辑**:
1. 计算每个玩家的牌型和点数
2. 比较庄家与每个闲家
3. 计算输赢积分
4. 更新玩家积分
5. 记录游戏历史
6. 更新统计数据

---

#### 3.4.5 添加AI机器人

**接口**: `POST /poker/addAssistant`

**说明**: 添加AI机器人到空座位

**请求参数**:
```typescript
{
  roomId: number;
  seatIndex: number;   // 座位号
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "添加机器人成功",
  data: {
    roomInfo: {
      // 更新后的房间信息
    }
  }
}
```

**业务逻辑**:
- 生成随机机器人名称和头像
- 设置userType=3
- 自动设置为已准备状态
- 随机下注倍数(1-5)

---

### 3.5 数据统计API

#### 3.5.1 获取游戏战绩

**接口**: `GET /api/user/stats`

**说明**: 获取用户的游戏统计数据

**请求参数**: 无 (通过token识别)

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    total_games: number;
    win_games: number;
    lose_games: number;
    draw_games: number;
    win_rate: number;
    max_win_streak: number;
    current_win_streak: number;
    total_win_score: number;
    total_lose_score: number;
    niu_niu_count: number;
    bomb_count: number;
  }
}
```

---

#### 3.5.2 获取历史记录

**接口**: `GET /api/user/history`

**说明**: 获取用户最近的游戏记录

**请求参数**:
```typescript
{
  page?: number;       // 页码,默认1
  pageSize?: number;   // 每页数量,默认20
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    total: number;
    records: [
      {
        gameId: number;
        roundNumber: number;
        playTime: string;
        cards: Card[];
        cardType: string;
        pointNumber: number;
        isWin: boolean;
        scoreChange: number;
        opponents: string[]; // 对手昵称列表
      }
    ]
  }
}
```

---

#### 3.5.3 获取排行榜

**接口**: `GET /api/leaderboard`

**说明**: 获取排行榜数据

**请求参数**:
```typescript
{
  type: 'score' | 'winrate' | 'games';  // 排序维度
  period: 'week' | 'month' | 'all';     // 时间范围
  limit?: number;                        // 返回数量,默认100
}
```

**响应数据**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    leaderboard: [
      {
        rank: number;
        userId: number;
        nickname: string;
        avatar: string;
        score: number;
        win_rate: number;
        total_games: number;
      }
    ],
    myRank: {
      rank: number;
      score: number;
    }
  }
}
```

---

## 4. WebSocket消息协议

### 4.1 连接建立

**连接URL**: `wss://api.yourdomain.com/ws`

**认证**: 通过token参数或第一条消息认证

```typescript
// 连接URL
wss://api.yourdomain.com/ws?token={jwt_token}

// 或者第一条消息认证
{
  type: 'auth',
  data: {
    token: 'jwt_token'
  }
}
```

---

### 4.2 消息格式

**标准格式**:
```typescript
interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
  messageId?: string;  // 可选,用于追踪
}
```

---

### 4.3 消息类型

#### 4.3.1 房间相关消息

**玩家加入房间**:
```typescript
{
  type: 'player_joined',
  data: {
    roomId: number;
    player: {
      userId: number;
      nickname: string;
      avatar: string;
      seatIndex: number;
    }
  }
}
```

**玩家退出房间**:
```typescript
{
  type: 'player_left',
  data: {
    roomId: number;
    userId: number;
    seatIndex: number;
  }
}
```

**玩家准备状态变更**:
```typescript
{
  type: 'player_ready',
  data: {
    roomId: number;
    userId: number;
    status: 1 | 2;
    betAmount: number;
  }
}
```

#### 4.3.2 游戏流程消息

**游戏开始**:
```typescript
{
  type: 'game_start',
  data: {
    roomId: number;
    gameId: number;
    roundNumber: number;
    bankerId: number;
  }
}
```

**发牌通知**:
```typescript
{
  type: 'deal_cards',
  data: {
    roomId: number;
    gameId: number;
    // 仅发送给自己的牌
    cards: Card[];
  }
}
```

**亮牌通知**:
```typescript
{
  type: 'show_cards',
  data: {
    roomId: number;
    userId: number;
    cards: Card[];
  }
}
```

**结算通知**:
```typescript
{
  type: 'settlement',
  data: {
    roomId: number;
    gameId: number;
    results: [
      {
        userId: number;
        cards: Card[];
        cardType: string;
        scoreChange: number;
        isWin: boolean;
      }
    ]
  }
}
```

#### 4.3.3 系统消息

**心跳**:
```typescript
// 客户端 → 服务端
{
  type: 'ping'
}

// 服务端 → 客户端
{
  type: 'pong',
  timestamp: number
}
```

**错误通知**:
```typescript
{
  type: 'error',
  data: {
    code: number;
    message: string;
  }
}
```

---

## 5. 数据库索引优化建议

### 5.1 高频查询索引

```sql
-- 用户表
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_score_level ON users(score DESC, level DESC);

-- 房间表
CREATE INDEX idx_rooms_status ON rooms(status, created_at DESC);
CREATE INDEX idx_rooms_creator ON rooms(creator_id);

-- 房间成员表
CREATE INDEX idx_room_users_room ON room_users(room_id, seat_index);
CREATE INDEX idx_room_users_user ON room_users(user_id);

-- 游戏记录表
CREATE INDEX idx_game_records_user_time ON game_records(user_id, created_at DESC);
CREATE INDEX idx_game_records_game ON game_records(game_id);
```

### 5.2 分区建议

**game_records表按时间分区**:
```sql
ALTER TABLE game_records
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

## 6. 缓存策略

### 6.1 Redis缓存设计

**用户信息缓存**:
```
Key: user:{userId}
Value: JSON(userInfo)
TTL: 3600秒 (1小时)
```

**房间信息缓存**:
```
Key: room:{roomId}
Value: JSON(roomInfo)
TTL: 1800秒 (30分钟)
```

**排行榜缓存**:
```
Key: leaderboard:{type}:{period}
Value: ZSET (sorted set)
TTL: 300秒 (5分钟)
```

**在线用户集合**:
```
Key: online_users
Value: SET
TTL: 永久 (定期清理)
```

### 6.2 缓存更新策略

1. **Cache Aside Pattern**: 读取时先查缓存,未命中再查数据库
2. **Write Through**: 写入时同时更新缓存和数据库
3. **定时刷新**: 排行榜等数据定时(每5分钟)更新

---

**下一步**: 请参阅《项目需求文档-UI设计.md》了解界面设计规范
