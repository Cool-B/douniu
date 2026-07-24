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
 * 统一请求入口 — 纯真后端，不走 mock
 */
const request = async (options: RequestOptions & DefaultConfig): Promise<ResponseResult<any>> => {
  const { url, data, method = 'POST', header } = options;

  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';

    wx.request({
      url: API_BASE_URL + url,
      method: method as any,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...header,
      },
      data,
      success: (res: any) => {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 200) {
          resolve({
            code: body.code,
            data: body.data,
            msg: body.message || '操作成功',
          });
        } else {
          reject(new Error(body.message || `请求失败 (HTTP ${res.statusCode})`));
        }
      },
      fail: (err: any) => {
        console.error(`[request] ${url} 请求失败:`, err.errMsg);
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
};

export const baseUrl = API_BASE_URL;
export default request;
