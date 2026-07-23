import { API_BASE_URL } from "../config";

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

// CloudBase CloudRun 后端地址（已在 config.ts 中配置）
export const baseUrl = API_BASE_URL;

const request = async (options: RequestOptions & defaultConfig): Promise<ResponseResult<any>> => {
  const { url, data, method = 'POST' } = options;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      data,
      method,
      header: { 'Content-Type': 'application/json' },
      success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
        const body = res.data as any;
        // 后端 code=0 表示成功, 前端用 code=200 表示成功
        // 后端 message 字段映射到前端 msg 字段
        resolve({
          code: body.code === 0 ? 200 : (body.code || 500),
          data: body.data,
          msg: body.message || body.msg || '操作成功',
        });
      },
      fail: (err) => {
        console.error('API 请求失败:', url, err);
        reject(err);
      },
    });
  });
};

export default request;
