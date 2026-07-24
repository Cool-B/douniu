// utils/request.ts - 微信小程序统一请求入口（无 async/await，避开 babel runtime）
import { API_BASE_URL } from "../config";

interface RequestOptions {
  url: string;
  data?: any;
  dataType?: "json" | undefined;
  responseType?: "text" | "arraybuffer" | undefined;
}

interface DefaultConfig {
  method?: "GET" | "OPTIONS" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT" | undefined;
  header?: { [key: string]: string };
}

export interface ResponseResult<T = any> {
  code: number;
  data: T;
  msg: string;
}

/**
 * 统一请求入口 - 纯真后端，不走 mock
 * 不用 async/await，避免 tsc+babel 生成 @babel/runtime/helpers 调用
 */
function request(options: RequestOptions & DefaultConfig): Promise<ResponseResult<any>> {
  const url = options.url;
  const data = options.data;
  const method = options.method || 'POST';
  const header = options.header;

  return new Promise<ResponseResult<any>>((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';

    wx.request({
      url: API_BASE_URL + url,
      method: method as any,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(header || {}),
      },
      data: data,
      success: function (res: any) {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 200) {
          resolve({
            code: body.code,
            data: body.data,
            msg: body.message || '操作成功',
          });
        } else {
          reject(new Error(body.message || ('请求失败 (HTTP ' + res.statusCode + ')')));
        }
      },
      fail: function (err: any) {
        console.error('[request] ' + url + ' 请求失败:', err.errMsg);
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

export const baseUrl = API_BASE_URL;
export default request;
