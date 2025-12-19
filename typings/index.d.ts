/// <reference path="./types/index.d.ts" />
export interface userInfoRes {
  avatar: string
  name: string
  roomId: number
  score: number
  state: number
  status: number
  userId: number
  userType: number
}
interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    roomId: number,
    roomNumber: number,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}