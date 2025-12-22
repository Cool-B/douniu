// 类型定义文件
export interface IAppOption {
  globalData: {
    roomId: number;
    roomNumber: number;
  };
  onLaunch(): void;
}

export interface userInfoRes {
  data: {
    data: {
      id: number;
      name: string;
      avatar: string;
      openid: string;
      token: string;
      username: string;
      phone: string | null;
      sex: string | null;
    };
  };
}

export interface roomInfoRes {
  data: {
    data: {
      roomId: number;
      roomNumber: string;
      players: Array<{
        userId: number;
        name: string;
        avatar: string;
      }>;
    };
  };
}