// import { login } from "./api/index"

import { IAppOption } from "./typings/index";
import { getUserInfo, getRoomInfo } from "./utils/localStorage";

// app.ts
App<IAppOption>({
  globalData: {
    roomId: 0,
    roomNumber: 0,
  },
  onLaunch() {
    try {
      // 检查用户登录状态
      const userInfo = getUserInfo();
      const roomInfo = getRoomInfo();
      
      if (!userInfo) {
        // 未登录，跳转到登录页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      } else if (roomInfo && roomInfo.roomId) {
        // 已在房间内，跳转到游戏页面
        this.globalData.roomId = roomInfo.roomId;
        this.globalData.roomNumber = roomInfo.roomNumber;
        wx.reLaunch({
          url: '/pages/card_game/card_game'
        });
      } else {
        // 已登录但不在房间内，停留在首页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    } catch (error) {
      console.error('应用启动失败:', error);
      // 启动失败时跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },
})