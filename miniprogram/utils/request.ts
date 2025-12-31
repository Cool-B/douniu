import mockApi from "./mockData";

interface RequestOptions {
  url: string;
  data?: any;
  dataType?: "json" | undefined;
  responseType?: "text" | "arraybuffer" | undefined;
}

interface defaultConfig {
  method?: "GET" | "OPTIONS" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT" | undefined;
  header?: { [key: string]: string };
}

interface ResponseResult<T> {
  code: number;
  data: T;
  msg: string;
}
export const baseUrl = 'http://b89669be.natappfree.cc'

const request = async (options: RequestOptions & defaultConfig): Promise<ResponseResult<any>> => {
  const { url, data, method = 'POST' } = options;

  // 模拟网络延迟
  // await simulateDelay();

  try {
    // 根据URL路由到对应的Mock API
    switch (url) {
      case '/api/wx/user/login':
        const loginResult = await mockApi.login(data);
        return {
          code: loginResult.code,
          data: loginResult.data,
          msg: loginResult.message
        };

      case '/poker/createRoom':
        const createRoomResult = await mockApi.createRoom(data);
        return {
          code: createRoomResult.code,
          data: createRoomResult.data,
          msg: createRoomResult.message
        };

      case '/poker/joinRoom':
        const joinRoomResult = await mockApi.joinRoom(data);
        console.log(joinRoomResult);

        return {
          code: joinRoomResult.code,
          data: joinRoomResult.data,
          msg: joinRoomResult.message
        };

      case '/poker/getRoomInfo':
        const getRoomInfoResult = await mockApi.getRoomInfo(data);
        return {
          code: getRoomInfoResult.code,
          data: getRoomInfoResult.data,
          msg: getRoomInfoResult.message
        };
      case '/poker/addAssistantOrChangeSeat':
        const assAssistantResult = await mockApi.addAssistantOrChangeSeat(data);
        return {
          code: assAssistantResult.code,
          data: assAssistantResult.data,
          msg: assAssistantResult.message
        };

      case '/poker/startGame':
        const startGameResult = await mockApi.startGame(data);
        return {
          code: startGameResult.code,
          data: startGameResult.data,
          msg: startGameResult.message
        };

      case '/poker/gameAction':
        const gameActionResult = await mockApi.gameAction(data);
        return {
          code: gameActionResult.code,
          data: gameActionResult.data,
          msg: gameActionResult.message
        };

      case '/poker/exitRoom':
        const exitRoomResult = await mockApi.exitRoom(data);
        return {
          code: exitRoomResult.code,
          data: exitRoomResult.data,
          msg: exitRoomResult.message
        };
      case '/poker/kickPlayer':
        const kickPlayerResult = await mockApi.kickPlayer(data);
        return {
          code: kickPlayerResult.code,
          data: kickPlayerResult.data,
          msg: kickPlayerResult.message
        };

      case '/poker/playerReady':
        const playerReadyResult = await mockApi.playerReady(data);
        return {
          code: playerReadyResult.code,
          data: playerReadyResult.data,
          msg: playerReadyResult.message
        };
      // changeBet   /poker/changeBet

      case '/poker/changeBet':
        const playerBetResult = await mockApi.changeBet(data);
        return {
          code: playerBetResult.code,
          data: playerBetResult.data,
          msg: playerBetResult.message
        };
      default:
        // 默认返回成功响应
        return {
          code: 200,
          data: null,
          msg: '操作成功'
        };
    }
  } catch (error) {
    console.error('Mock API调用失败:', error);
    return {
      code: 500,
      data: null,
      msg: '服务器内部错误'
    };
  }
};

export default request;