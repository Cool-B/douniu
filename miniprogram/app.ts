// app.ts - 应用入口
// 兜底 polyfill: 拦截 babel 给 async 方法注入的 helper 调用 (this._getData / this.getData / this.$emit 等)
// 关键: 挂在 Component.prototype 上是无效的! method 里的 this 不会去 prototype 找 _getData
// 正确做法: 拦截 Component/Page/Behavior 工厂函数, 对每个 method 包装一层,
//          进入 method 时把 _getData / getData / $emit / $on / $off 挂到 this 上
// 这样 babel 编译生成的 this._getData() 调用就能找到对应函数

(function () {
  // 辅助: 给 this 注入 babel 需要的 helper 方法
  function injectHelpers(self: any) {
    if (self && typeof self._getData !== 'function') {
      self._getData = function () { return self.data; };
    }
    if (self && typeof self.getData !== 'function') {
      self.getData = function () { return self.data; };
    }
    if (self && typeof self.$emit !== 'function') {
      self.$emit = function () { /* noop */ };
    }
    if (self && typeof self.$on !== 'function') {
      self.$on = function () { /* noop */ };
    }
    if (self && typeof self.$off !== 'function') {
      self.$off = function () { /* noop */ };
    }
  }

  // 包装单个 method 函数
  function wrapMethod(fn: any) {
    return function (this: any) {
      injectHelpers(this);
      return fn.apply(this, arguments);
    };
  }

  // ===== 拦截 Component 工厂 =====
  if (typeof Component === 'function') {
    var _origComponent: any = Component;
    Component = function (options: any) {
      if (options && options.methods) {
        for (var key in options.methods) {
          if (typeof options.methods[key] === 'function') {
            options.methods[key] = wrapMethod(options.methods[key]);
          }
        }
      }
      return _origComponent(options);
    } as any;
  }

  // ===== 拦截 Page 工厂 =====
  if (typeof Page === 'function') {
    var _origPage: any = Page;
    Page = function (options: any) {
      if (options) {
        // Page 没有 methods 字段, 所有非 data/lifetimes/observers 等都是 method
        var skipKeys: any = {
          data: 1,
          onLoad: 1, onShow: 1, onReady: 1, onHide: 1, onUnload: 1,
          onPullDownRefresh: 1, onReachBottom: 1, onShareAppMessage: 1,
          onShareTimeline: 1, onPageScroll: 1, onResize: 1, onTabItemTap: 1,
          lifetimes: 1, computed: 1, observers: 1
        };
        for (var key in options) {
          if (typeof options[key] === 'function' && !skipKeys[key]) {
            options[key] = wrapMethod(options[key]);
          }
        }
      }
      return _origPage(options);
    } as any;
  }

  // ===== 拦截 Behavior 工厂 (Component 复用) =====
  if (typeof Behavior === 'function') {
    var _origBehavior: any = Behavior;
    Behavior = function (options: any) {
      if (options && options.methods) {
        for (var key in options.methods) {
          if (typeof options.methods[key] === 'function') {
            options.methods[key] = wrapMethod(options.methods[key]);
          }
        }
      }
      return _origBehavior(options);
    } as any;
  }
})();

import { IAppOption } from "./typings/index";
import { getUserInfo, getRoomInfo } from "./utils/localStorage";

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
        // 未登录, 跳转到登录页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      } else if (roomInfo && roomInfo.roomId) {
        // 已在房间内, 跳转到游戏页面
        this.globalData.roomId = roomInfo.roomId;
        this.globalData.roomNumber = roomInfo.roomNumber;
        wx.reLaunch({
          url: '/pages/card_game/card_game'
        });
      } else {
        // 已登录但不在房间内, 停留在首页
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
