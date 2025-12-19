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
export const baseUrl = 'https://cow.lyjiubei.cn'

const request = async (options: RequestOptions & defaultConfig): Promise<ResponseResult<any>> => {
  // 默认配置
  const defaultConfig: defaultConfig = {
    method: 'GET',
    header: {
      'content-type': 'application/json',
    },
  };
  // 合并默认配置和自定义配置
  const config = { ...defaultConfig, ...options };

  return new Promise((resolve, reject) => {
    wx.request({
      ...config,
      url: baseUrl + config.url,
      success(res) {
        resolve({
          code: res.statusCode,
          data: res.data,
          msg: res.errMsg,
        });
      },
      fail(error) {
        reject(error);
      },
    });
  });
};

export default request;