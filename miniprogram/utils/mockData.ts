/**
 * 完整的Mock数据文件
 * 包含用户、房间、游戏等所有模拟数据
 */

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
  userType: 1 | 2; // 1: 庄家, 2: 玩家
  status: number; // 1: 待准备, 2: 已准备
  state: number; // 1: 正常, 2: 退出房间, 3: 离线
  score: number;
  bet?: number;
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
  players: MockPlayer[];
  dealerId: number;
  status: number; // 0: 准备中, 1: 发牌中, 2: 游戏中, 3: 结算中
  cards: MockCard[];
}

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

// Mock房间数据
const mockRooms: MockRoomInfo[] = [
  {
    roomId: 2001,
    roomNumber: "888888",
    roomType: 1,
    creatorId: 1001,
    status: 0,
    maxPlayers: 5,
    currentRound: 0,
    players: [
      {
        userId: 1001,
        name: "玩家一号",
        avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
        userType: 1,
        status: 2,
        state: 1,
        score: 1000,
        ready: true
      }
    ]
  },
  {
    roomId: 2002,
    roomNumber: "666666",
    roomType: 2,
    creatorId: 1002,
    status: 0,
    maxPlayers: 5,
    currentRound: 0,
    players: [
      {
        userId: 1002,
        name: "玩家二号",
        avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoj0hHXhgJNOTSOFsS4uZs8x1ConecaVOB8eIl115xmJZcT4oCicvia7wMEufibKtTLqiaJeanU2Lpg3w/132",
        userType: 1,
        status: 1,
        state: 1,
        score: 800,
        ready: false
      }
    ]
  }
];

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
        ready: true,
        pokers: [
          { suit: "Spade", number: 10 },
          { suit: "Heart", number: 7 },
          { suit: "Club", number: 3 },
          { suit: "Diamond", number: 12 },
          { suit: "Spade", number: 5 }
        ]
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
  login: {
    code: 200,
    message: "登录成功",
    data: {
      userInfo: mockUsers[0],
      token: "mock_token_1001"
    }
  },

  // 创建房间响应
  createRoom: {
    code: 200,
    message: "房间创建成功",
    data: {
      roomInfo: mockRooms[0],
      userInfo: mockUsers[0]
    }
  },

  // 加入房间响应
  joinRoom: {
    code: 200,
    message: "加入房间成功",
    data: {
      roomInfo: mockRooms[0],
      userInfo: mockUsers[1]
    }
  },

  // 获取房间信息响应
  getRoomInfo: {
    code: 200,
    message: "获取房间信息成功",
    data: {
      roomInfo: mockRooms[0],
      userInfoList: mockRooms[0].players
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
      userInfo: mockUsers[0]
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
    return mockResponses.login;
  },

  // 创建房间
  async createRoom(data: { userId: number; roomType: 1 | 2 }) {
    await simulateDelay();
    const newRoom: MockRoomInfo = {
      roomId: Date.now(),
      roomNumber: Math.floor(100000 + Math.random() * 900000).toString(),
      roomType: data.roomType,
      creatorId: data.userId,
      status: 0,
      maxPlayers: 5,
      currentRound: 0,
      players: [
        {
          userId: data.userId,
          name: mockUsers.find(u => u.id === data.userId)?.name || "玩家",
          avatar: mockUsers.find(u => u.id === data.userId)?.avatar || "",
          userType: 1,
          status: 2,
          state: 1,
          score: 1000,
          ready: true
        }
      ]
    };
    mockRooms.push(newRoom);

    return {
      code: 200,
      message: "房间创建成功",
      data: {
        roomInfo: newRoom,
        userInfo: mockUsers.find(u => u.id === data.userId)
      }
    };
  },

  // 加入房间
  async joinRoom(data: { userId: number; roomNumber: string }) {
    await simulateDelay();
    const room = mockRooms.find(r => r.roomNumber === data.roomNumber);

    if (!room) {
      return mockErrors.notFound;
    }

    if (room.players.length >= room.maxPlayers) {
      return mockErrors.roomFull;
    }

    if (room.status === 1) {
      return mockErrors.gameStarted;
    }

    const user = mockUsers.find(u => u.id === data.userId);
    if (!user) {
      return mockErrors.unauthorized;
    }

    const newPlayer: MockPlayer = {
      userId: data.userId,
      name: user.name,
      avatar: user.avatar,
      userType: 2,
      status: 1,
      state: 1,
      score: 1000,
      ready: false
    };

    room.players.push(newPlayer);

    return {
      code: 200,
      message: "加入房间成功",
      data: {
        roomInfo: room,
        userInfo: user
      }
    };
  },

  // 获取房间信息
  async getRoomInfo(data: { roomId: number }) {
    await simulateDelay();
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

  // 开始游戏
  async startGame(data: { roomId: number; userId: number }) {
    await simulateDelay();
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

    room.status = 1;
    const gameId = `game_${Date.now()}`;

    const newGame: MockGameData = {
      gameId,
      roomId: data.roomId,
      round: 1,
      dealerId: room.players.find(p => p.userType === 1)?.userId || room.players[0].userId,
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
        const player = game.players.find(p => p.userId === data.userId);
        if (player) {
          player.show = true;
        }
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
    const room = mockRooms.find(r => r.roomId === data.roomId);

    if (!room) {
      return mockErrors.notFound;
    }

    room.players = room.players.filter(p => p.userId !== data.userId);

    return {
      code: 200,
      message: "退出房间成功",
      data: {
        roomInfo: room.players.length === 0 ? null : room,
        userInfo: mockUsers.find(u => u.id === data.userId)
      }
    };
  }
};

export default mockApi;