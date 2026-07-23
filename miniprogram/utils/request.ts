import { API_BASE_URL, USE_MOCK } from '../config';
import mockApi from './mockData';

interface RequestOptions {
  url: string;
  data?: any;
  dataType?: 'json' | undefined;
  responseType?: 'text' | 'arraybuffer' | undefined;
  method?: 'GET' | 'OPTIONS' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | undefined;
  header?: { [key: string]: string };
}

export interface ResponseResult<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 兼容旧引用
export const baseUrl = API_BASE_URL;

/**
 * 网络请求封装
 * - USE_MOCK=true: 走本地 Mock (开发演示, 无后端可用)
 * - USE_MOCK=false: 走真实后端 HTTP
 */
const request = (options: RequestOptions): Promise<ResponseResult<any>> => {
  const { url, data, method = 'POST', header = {} } = options;

  // ===== Mock 模式 =====
  if (USE_MOCK) {
    return mockRoute(url, data);
  }

  // ===== 真实 HTTP 请求 =====
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE_URL + url,
      method: method as any,
      data,
      header: { 'Content-Type': 'application/json', ...header },
      timeout: 10000,
      success: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          resolve(res.data as ResponseResult);
        } else if (res.statusCode === 404) {
          resolve({ code: 404, msg: '资源不存在', data: null });
        } else {
          resolve({
            code: res.statusCode || 500,
            msg: `网络异常 (${res.statusCode})`,
            data: null,
          });
        }
      },
      fail: (err) => {
        console.error('[request fail]', url, err);
        reject(err);
      },
    });
  });
};

/** Mock 路由 (与 request.ts 旧逻辑保持一致) */
async function mockRoute(url: string, data: any): Promise<ResponseResult<any>> {
  let result: any;
  switch (url) {
    case '/api/wx/user/login':
      result = await mockApi.login(data);
      break;
    case '/poker/createRoom':
      result = await mockApi.createRoom(data);
      break;
    case '/poker/joinRoom':
      result = await mockApi.joinRoom(data);
      break;
    case '/poker/getRoomInfo':
      result = await mockApi.getRoomInfo(data);
      break;
    case '/poker/startGame':
      result = await mockApi.startGame(data);
      break;
    case '/poker/gameAction':
      result = await mockApi.gameAction(data);
      break;
    case '/poker/exitRoom':
      result = await mockApi.exitRoom(data);
      break;
    default:
      return { code: 200, msg: 'ok', data: null };
  }
  return {
    code: result.code,
    data: result.data,
    msg: result.message,
  };
}

export default request;
