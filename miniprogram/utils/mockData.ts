/**
 * 完整的Mock数据文件
 * 包含用户、房间、游戏等所有模拟数据
 */

import { getRoomInfo, getUserInfo, player, roomInfo, setRoomInfo } from "./localStorage";

export interface MockUserInfo {
  id: number;
  name: string;
  avatar: string;
  openid: string;
  phone: string | null;
  sex: number | null;
  token: string;
  username: string;
}

export interface MockRoomInfo {
  roomId: number;
  roomNumber: string;
  roomType: 1 | 2; // 1: 普通房间, 2: 快速开始
  creatorId: number;
  status: number; // 0: 等待中, 1: 游戏中
  players: MockPlayer[];
  maxPlayers: number;
  currentRound: number;
  gameId?: string;
}

export interface MockPlayer {
  userId: number;
  name: string;
  avatar: string;
  userType: 1 | 2 | 3 | 4; // 1: 庄家, 2: 玩家  3 机器人  4   空
  status: number; // 1: 待准备, 2: 已准备
  state: number; // 1: 正常, 2: 退出房间, 3: 离线
  score: number;
  bet: number;
  ready?: boolean;
  pokers?: MockCard[];
  lookHand?: boolean;
  show?: boolean;
}

export interface MockCard {
  suit: string; // Spade, Heart, Club, Diamond
  number: number; // 1-13
  url?: string;
}

export interface MockGameData {
  gameId: string;
  roomId: number;
  round: number;
  players: player[];
  dealerId: number;
  status: number; // 0: 准备中, 1: 发牌中, 2: 游戏中, 3: 结算中
  cards: MockCard[];
}

// 机器人头像池 - 使用不同的微信默认头像和真实头像
const BOT_AVATARS = [
  "https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoj0hHXhgJNOTSOFsS4uZs8x1ConecaVOB8eIl115xmJZcT4oCicvia7wMEufibKtTLqiaJeanU2Lpg3w/132",
  "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
  "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
];

// Mock用户数据
const mockUsers: MockUserInfo[] = [
  {
    id: 1001,
    name: "玩家一号",
    avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
    openid: "mock_openid_1001",
    phone: null,
    sex: 1,
    token: "mock_token_1001",
    username: "player1"
  },
  {
    id: 1002,
    name: "玩家二号",
    avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoj0hHXhgJNOTSOFsS4uZs8x1ConecaVOB8eIl115xmJZcT4oCicvia7wMEufibKtTLqiaJeanU2Lpg3w/132",
    openid: "mock_openid_1002",
    phone: null,
    sex: 2,
    token: "mock_token_1002",
    username: "player2"
  },
  {
    id: 1003,
    name: "玩家三号",
    avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJm2vJjY3G1V8Q9Y9X8JzKvY1Yb4J4J4J4J4J4J4J4J4J4/132",
    openid: "mock_openid_1003",
    phone: null,
    sex: 1,
    token: "mock_token_1003",
    username: "player3"
  }
];

const defaultPlayer: player = {
  userId: 0,
  name: '空',
  avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
  userType: 4,
  status: 1,
  state: 1,
  score: 0,
  roomId: 0,
  bet: 1,
  pokers: [],
  pokeData: {
    isBoom: false,
    isDoubleTen: false,
    hasNiu: false,
    maxNumber: 0,
    suit: '',
    pointNumber: 0
  }
};
// Mock游戏数据
const mockGames: MockGameData[] = [
  {
    gameId: "game_3001",
    roomId: 2001,
    round: 1,
    dealerId: 1001,
    status: 1,
    players: [
      {
        userId: 1001,
        name: "玩家一号",
        avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
        userType: 1,
        status: 2,
        state: 1,
        score: 1000,
        roomId: 2001,
        bet: 1,
        pokers: [
          { suit: "Spade", number: 10 },
          { suit: "Heart", number: 7 },
          { suit: "Club", number: 3 },
          { suit: "Diamond", number: 12 },
          { suit: "Spade", number: 5 }
        ],
        pokeData: {
          isBoom: false,
          isDoubleTen: false,
          hasNiu: false,
          maxNumber: 0,
          suit: '',
          pointNumber: 0
        }
      }
    ],
    cards: generateDeck()
  }
];

// 生成一副扑克牌
function generateDeck(): MockCard[] {
  const suits = ['Spade', 'Heart', 'Club', 'Diamond'];
  const deck: MockCard[] = [];

  for (const suit of suits) {
    for (let number = 1; number <= 13; number++) {
      deck.push({ suit, number });
    }
  }

  return shuffleArray(deck);
}

// 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Mock响应数据
const mockResponses = {
  // 登录响应
  login: (data: { code: string; name?: string; avatar?: string; encryptedData?: string; iv?: string; phoneCode?: string; loginType?: string }) => {
    let userInfo;

    if (data.loginType === 'quick') {
      // 一键登录：模拟从微信获取的用户信息
      // 模拟解密手机号（实际应由后端完成）
      const mockPhoneNumber = '138****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      // 模拟从微信获取的用户信息
      userInfo = {
        ...mockUsers[0],
        token: "mock_token_quick_" + Date.now(),
        username: "微信用户" + mockPhoneNumber.slice(-4),
        avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/mock_avatar_" + Date.now() + ".png",
        phone: mockPhoneNumber,
        userId: "wx_user_" + Date.now()
      };
    } else {
      // 自定义登录
      userInfo = {
        ...mockUsers[0],
        ...data,
        token: "mock_token_1001",
        username: data.name
      };
    }

    return {
      code: 200,
      message: "登录成功",
      data: userInfo
    }
  },

  // 创建房间响应
  createRoom: {
    code: 200,
    message: "房间创建成功",
    data: {
      roomInfo: (getRoomInfo() || [])[0],
      userInfo: mockUsers[0]
    }
  },

  // 加入房间响应
  joinRoom: {
    code: 200,
    message: "加入房间成功",
    data: {
      roomInfo: (getRoomInfo() || [])[0],
      userInfo: mockUsers[1]
    }
  },

  // 获取房间信息响应
  getRoomInfo: {
    code: 200,
    message: "获取房间信息成功",
    data: {
      roomInfo: (getRoomInfo() || [])[0],
      userInfoList: (getRoomInfo() || [])[0] && (getRoomInfo() || [])[0].players
    }
  },

  // 开始游戏响应
  startGame: {
    code: 200,
    message: "游戏开始成功",
    data: {
      gameInfo: mockGames[0],
      userInfoList: mockGames[0].players
    }
  },

  // 游戏操作响应
  gameAction: {
    code: 200,
    message: "操作成功",
    data: {
      gameInfo: mockGames[0],
      actionResult: "success"
    }
  },

  // 退出房间响应
  exitRoom: {
    code: 200,
    message: "退出房间成功",
    data: {
      roomInfo: null,
    }
  }
};

// Mock错误响应
const mockErrors = {
  notFound: {
    code: 404,
    message: "资源不存在",
    data: null
  },

  unauthorized: {
    code: 401,
    message: "未授权访问",
    data: null
  },

  roomFull: {
    code: 400,
    message: "房间已满",
    data: null
  },

  gameStarted: {
    code: 400,
    message: "游戏已开始",
    data: null
  }
};

// 模拟网络延迟
function simulateDelay(min: number = 200, max: number = 800): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Mock API函数
export const mockApi = {
  // 用户登录
  async login(data: { code: string; name: string; avatar: string }) {
    await simulateDelay();
    return mockResponses.login(data);
  },

  // 创建房间
  async createRoom(data: { userId: number; roomType: 1 | 2 }) {
    await simulateDelay();
    const userInfo: any = getUserInfo();
    // 动态生成8条机器人玩家数据
    const players: player[] = []
    const newRoom: roomInfo = {
      roomId: Date.now(),
      roomNumber: Math.floor(100000 + Math.random() * 900000),
      creatorId: data.userId,
      isGaming: false,
      isStart: false,
      players: players,
      isStartDeal: false,
      isDealComplete: false
    };
    for (let i = 0; i < 9; i++) {
      const botUser = mockUsers[0] || {};
      players.push({
        ...defaultPlayer,
        roomId: newRoom.roomId,
        userId: i === 7 ? userInfo.id : 0,
        name: i === 7 ? userInfo.name : '空',
        avatar: i === 7 ? userInfo.avatar : botUser.avatar,
        userType: i === 7 ? 1 : 4,
      });
    }
    return {
      code: 200,
      message: "房间创建成功",
      data: {
        roomInfo: newRoom,
      }
    };
  },

  // 加入房间
  async joinRoom(data: { userId: number; roomNumber: string }) {
    await simulateDelay();
    // Mock房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomNumber === Number(data.roomNumber));
    if (!room) {
      return mockErrors.notFound;
    }
    const userInfo: any = getUserInfo();
    const newPlayer: player = {
      ...defaultPlayer,
      userId: data.userId,
      name: userInfo.name,
      avatar: userInfo.avatar,
      userType: 2,
      roomId: room.roomId,
    };
    let flag = false
    room.players = room.players.map(item => {
      if (item.userType === 4 && !flag) {
        flag = true
        return {
          ...item,
          ...newPlayer
        }
      }
      return item
    })
    return {
      code: 200,
      message: "加入房间成功",
      data: {
        roomInfo: room,
      }
    };
  },

  // 获取房间信息
  async getRoomInfo(data: { roomId: number }) {
    await simulateDelay();
    // Mock房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);
    if (!room) {
      return mockErrors.notFound;
    }
    return {
      code: 200,
      message: "获取房间信息成功",
      data: {
        roomInfo: room,
        userInfoList: room.players
      }
    };
  },
  // 添加机器人或换座位
  async addAssistantOrChangeSeat(data: {
    roomId: number,
    userId: number,
    seatIndex: number,
    isBanker: boolean
  }) {
    await simulateDelay();

    // ========== 参数验证 ==========
    if (!data.roomId || !data.userId || data.seatIndex === undefined || data.seatIndex === null) {
      return {
        code: 400,
        message: "参数不完整",
        data: null
      };
    }

    // 获取房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);

    if (!room) {
      return {
        code: 404,
        message: "房间不存在",
        data: null
      };
    }

    // 验证座位索引
    if (data.seatIndex < 0 || data.seatIndex >= room.players.length) {
      return {
        code: 400,
        message: "座位索引无效",
        data: null
      };
    }

    // 查找操作玩家
    const operatorIndex = room.players.findIndex(p => p.userId === data.userId);

    if (operatorIndex === -1) {
      return {
        code: 404,
        message: "操作玩家不在房间中",
        data: null
      };
    }

    const operator = room.players[operatorIndex];
    const targetSeat = room.players[data.seatIndex];

    // ========== 通用验证 ==========
    // 1. 游戏已开始不能操作
    if (room.isGaming || room.isStart) {
      return {
        code: 400,
        message: "游戏已开始，无法操作",
        data: null
      };
    }

    // 2. 目标座位不能是空位类型以外的玩家
    if (targetSeat.userType !== 4) {
      return {
        code: 400,
        message: "目标座位已被占用",
        data: null
      };
    }

    // 3. 不能操作第7位（庄家位）
    if (data.seatIndex === 7) {
      return {
        code: 400,
        message: "不能操作庄家位置",
        data: null
      };
    }

    // ========== 分支逻辑：庄家添加机器人 VS 玩家换座位 ==========
    if (data.isBanker) {
      // ========== 庄家添加机器人 ==========

      // 验证操作者是否是庄家
      if (operator.userType !== 1) {
        return {
          code: 403,
          message: "只有庄家才能添加机器人",
          data: null
        };
      }

      // 生成机器人玩家
      const botName = 'Bot_' + Math.random().toString(36).substring(2, 8);
      const botUserId = room.roomId + Date.now() + Math.floor(Math.random() * 1000);

      // 随机选择一个机器人头像
      const randomBotAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

      room.players[data.seatIndex] = {
        ...targetSeat,
        userId: botUserId,
        name: botName,
        avatar: randomBotAvatar, // 使用随机机器人头像
        userType: 3, // 3 = 机器人
        status: 2, // 机器人默认已准备
        bet: 1,
        score: 0,
        state: 1,
        roomId: room.roomId
      };

      // 保存到本地存储
      setRoomInfo(room);
      return {
        code: 200,
        message: "添加机器人成功",
        data: {
          roomInfo: room,
          userInfoList: room.players
        }
      };

    } else {
      // ========== 玩家换座位 ==========

      // 验证操作者是否是普通玩家
      if (operator.userType !== 2) {
        return {
          code: 403,
          message: "只有普通玩家才能换座位",
          data: null
        };
      }

      // 验证玩家是否已准备（已准备状态不能换座位）
      if (operator.status === 2) {
        return {
          code: 400,
          message: "已准备状态不能换座位，请先取消准备",
          data: null
        };
      }

      // 验证是否换到同一个位置
      if (operatorIndex === data.seatIndex) {
        return {
          code: 400,
          message: "您已经在这个位置了",
          data: null
        };
      }

      // 执行座位交换：将玩家移到目标座位，原座位变为空位
      const oldSeatIndex = operatorIndex;

      // 将玩家移到目标座位
      room.players[data.seatIndex] = {
        ...operator
      };

      // 原座位变为空位
      room.players[oldSeatIndex] = {
        ...defaultPlayer,
        roomId: room.roomId,
        userType: 4
      };

      // 保存到本地存储
      setRoomInfo(room);
      return {
        code: 200,
        message: "换座成功",
        data: {
          roomInfo: room,
          userInfoList: room.players
        }
      };
    }
  },
  // 开始游戏
  async startGame(data: { roomId: number; userId: number }) {
    await simulateDelay();
    // Mock房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);

    if (!room) {
      return mockErrors.notFound;
    }

    if (room.players.length < 2) {
      return {
        code: 400,
        message: "至少需要2名玩家才能开始游戏",
        data: null
      };
    }

    const gameId = `game_${Date.now()}`;
    const player = room.players.find(p => p.userType === 1)
    const newGame: MockGameData = {
      gameId,
      roomId: data.roomId,
      round: 1,
      dealerId: player && player.userId || room.players[0].userId,
      status: 1,
      players: room.players.map(player => ({
        ...player,
        pokers: []
      })),
      cards: generateDeck()
    };

    mockGames.push(newGame);

    return {
      code: 200,
      message: "游戏开始成功",
      data: {
        gameInfo: newGame,
        userInfoList: newGame.players
      }
    };
  },

  // 游戏操作
  async gameAction(data: { gameId: string; userId: number; action: string; round?: number }) {
    await simulateDelay();
    const game = mockGames.find(g => g.gameId === data.gameId);

    if (!game) {
      return mockErrors.notFound;
    }

    // 模拟不同的游戏操作
    switch (data.action) {
      case "dealCards":
        // 发牌逻辑
        game.players.forEach(player => {
          if (game.cards.length >= 5) {
            player.pokers = game.cards.splice(0, 5);
          }
        });
        game.status = 2;
        break;

      case "shuffle":
        // 洗牌逻辑
        game.cards = generateDeck();
        break;

      case "showCards":
        // 亮牌逻辑
        // const player = game.players.find(p => p.userId === data.userId);
        // if (player) {
        //   player.show = true;
        // }
        break;

      case "settlement":
        // 结算逻辑
        game.status = 3;
        break;
    }

    return {
      code: 200,
      message: "操作成功",
      data: {
        gameInfo: game,
        actionResult: "success"
      }
    };
  },

  // 退出房间
  async exitRoom(data: { roomId: number; userId: number }) {
    await simulateDelay();
    // Mock房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);
    if (!room) {
      return mockErrors.notFound;
    }
    // 判断退出的玩家是否是房主
    const exitingPlayer = room.players.find(p => p.userId === data.userId);
    const isBanker = exitingPlayer && exitingPlayer.userType === 1;

    // 将退出的玩家位置重置为空位
    room.players = room.players.map(p => {
      if (p.userId !== data.userId) {
        return p
      }
      return {
        ...defaultPlayer,
        roomId: room.roomId,
        userType: isBanker ? 1 : 4
      }
    });
    // 如果是房主退出，需要处理房主转让或解散房间
    if (isBanker) {
      // 判断是否还有其他玩家（包括机器人）
      const hasPlayer = room.players.some(p => p.userType !== 4);
      if (!hasPlayer) {
        // 没有其他玩家，解散房间
        const roomIndex = mockRooms.findIndex(r => r.roomId === data.roomId);
        if (roomIndex !== -1) {
          mockRooms.splice(roomIndex, 1);
          // 保存更新后的房间列表
          wx.setStorageSync('roomInfo', JSON.stringify(mockRooms));
        }
        return {
          code: 200,
          message: "退出房间成功，房间已解散",
          data: {
            roomInfo: null,
          }
        };
      }
      // 有其他玩家，转让房主身份
      // 找到第一个非空位玩家
      const newBanker = room.players.find(p => p.userType !== 4);
      if (newBanker) {
        const newBankerIndex = room.players.findIndex(p => p.userId === newBanker.userId);
        const bankerIndex = 7; // 房主固定在第7位
        if (newBankerIndex !== bankerIndex && newBankerIndex !== -1) {
          // 交换位置：将新房主移到第7位
          const tempPlayer = { ...room.players[bankerIndex], userType: 4 };
          room.players[bankerIndex] = {
            ...newBanker,
            userType: 1  // 设置为庄家
          };
          room.players[newBankerIndex] = tempPlayer;
        } else if (newBankerIndex === bankerIndex) {
          // 新房主已经在第7位，只需更新userType
          room.players[bankerIndex].userType = 1;
        }
      }
    }
    // 保存更新后的房间信息
    setRoomInfo(room);
    return {
      code: 200,
      message: "退出房间成功",
      data: {
        roomInfo: room,
      }
    };
  },
  // 踢出房间
  async kickPlayer(data: {
    roomId: number,
    userId: number,
    player: player,
  }) {
    await simulateDelay();
    // Mock房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);
    if (!room) {
      return mockErrors.notFound;
    }
    // room.players.map(p => p.score += data.player.score)
    room.players = room.players.map(p => {
      if (p.userId !== data.player.userId) {
        return p
      }
      return defaultPlayer
    });
    return {
      code: 200,
      message: "踢出房间成功",
      data: {
        roomInfo: room.players.length === 0 ? null : room,
      }
    };
  },
  // 玩家准备/取消准备
  async playerReady(data: {
    roomId: number;
    userId: number;
    status: 1 | 2;  // 1取消准备 2确认准备
  }) {
    await simulateDelay();
    // 获取房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);
    if (!room) {
      return mockErrors.notFound;
    }
    // 查找玩家
    const playerIndex = room.players.findIndex(p => p.userId === data.userId);

    if (playerIndex === -1) {
      return {
        code: 404,
        message: "玩家不在房间中",
        data: null
      };
    }

    const player = room.players[playerIndex];

    // 检查是否是庄家（庄家不需要准备）
    if (player.userType === 1) {
      return {
        code: 400,
        message: "庄家不需要准备",
        data: null
      };
    }
    // 检查游戏是否已开始
    if (room.isGaming) {
      return {
        code: 400,
        message: "游戏已开始，无法改变准备状态",
        data: null
      };
    }
    // 更新玩家状态
    room.players[playerIndex] = {
      ...player,
      status: data.status,
    };
    // 保存到本地存储
    setRoomInfo(room);
    return {
      code: 200,
      message: data.status === 2 ? "准备成功" : "取消准备成功",
      data: {
        roomInfo: room
      }
    };
  },
  // 下注
  async changeBet(data: {
    roomId: number;
    userId: number;
    bet: number;  // 下注倍数 1-10
  }) {
    await simulateDelay();

    // ========== 参数验证 ==========
    if (!data.roomId || !data.userId || data.bet === undefined || data.bet === null) {
      return {
        code: 400,
        message: "参数不完整",
        data: null
      };
    }

    // 获取房间数据
    const mockRooms: roomInfo[] = getRoomInfo() || [];
    const room = mockRooms.find(r => r.roomId === data.roomId);

    if (!room) {
      return {
        code: 404,
        message: "房间不存在",
        data: null
      };
    }

    // 查找玩家
    const playerIndex = room.players.findIndex(p => p.userId === data.userId);

    if (playerIndex === -1) {
      return {
        code: 404,
        message: "玩家不在房间中",
        data: null
      };
    }

    const player = room.players[playerIndex];

    // ========== 业务规则验证 ==========
    // 1. 庄家不能下注
    if (player.userType === 1) {
      return {
        code: 400,
        message: "庄家不能下注",
        data: null
      };
    }

    // 2. 已准备状态不能更改下注
    if (player.status === 2) {
      return {
        code: 400,
        message: "已准备状态不能更改下注",
        data: null
      };
    }

    // 3. 游戏已开始不能更改下注
    if (room.isGaming || room.isStart) {
      return {
        code: 400,
        message: "游戏已开始，无法更改下注",
        data: null
      };
    }

    // 4. 下注倍数必须是1-10之间的整数
    if (!Number.isInteger(data.bet) || data.bet < 1 || data.bet > 10) {
      return {
        code: 400,
        message: "下注倍数必须是1-10之间的整数",
        data: null
      };
    }

    // 5. 检查下注是否有变化
    if (player.bet === data.bet) {
      return {
        code: 200,
        message: "下注倍数未改变",
        data: {
          roomInfo: room
        }
      };
    }

    // ========== 更新下注信息 ==========
    const oldBet = player.bet;
    room.players[playerIndex] = {
      ...player,
      bet: data.bet
    };

    // 保存到本地存储
    setRoomInfo(room);
    return {
      code: 200,
      message: `下注已改为${data.bet}倍`,
      data: {
        roomInfo: room
      }
    };
  }
};

export default mockApi;