// index.ts
// 获取应用实例

import { IAppOption } from "../../typings/index";
import { createRoom, login, joinRoom } from "../../api/index";
import { getUserInfo, setUserInfo, userInfo, getRoomInfo, setRoomInfo, removeUserInfo } from "../../utils/localStorage";

const app = getApp<IAppOption>()

// 登录状态枚举
enum LoginStatus {
  LOADING = 0,      // 加载中
  LOGGED_IN = 1,    // 已登录
  NEED_LOGIN = 2,   // 需要手动登录
  AUTHORIZING = 3,  // 授权中
  AUTH_FAILED = 4   // 授权失败
}

// 一键登录相关常量
const QUICK_LOGIN_CONFIG = {
  // 微信授权成功消息
  SUCCESS_MESSAGES: ['getPhoneNumber:ok', 'getPhoneNumber:user confirm'],
  // 用户拒绝授权消息
  DENY_MESSAGE: 'getPhoneNumber:fail user deny',
  // 登录类型
  LOGIN_TYPE: {
    QUICK: 'quick',
    CUSTOM: 'custom'
  }
} as const;

// 组件实例接口
interface ComponentInstance {
  data: {
    motto: string;
    modalShow: boolean;
    inputValue: string;
    userInfo: {
      avatarUrl: string;
      nickName: string;
    };
    hasUserInfo: boolean;
    loginFlag: LoginStatus;
    showRulesModal: boolean;
    loading: boolean;
    errorMsg: string;
    currentYear: number;
    currentUser: any;
    tempAvatar: string;
    tempNickname: string;
    showQuickLogin: boolean;
    showCustomLogin: boolean;
    authorizingQuickLogin: boolean;
    inputFocused: boolean;
    timeTheme: string;
  };
  timeThemeTimer: any;
  setData: (data: any) => void;
  createSelectorQuery: () => any;
  silentLogin: () => void;
  updateTimeTheme: () => void;
  startTimeThemeTimer: () => void;
  checkRoomStatus: () => void;
  refreshUserInfo: () => void;
  showError: (message: string, duration?: number) => void;
  performLogin: (code: string, nickName: string, avatarUrl: string) => void;
  performQuickLogin: (encryptedData: string, iv: string, phoneCode: string) => Promise<void>;
}

Component<any, any, any>({
  // 定时器ID
  timeThemeTimer: null as number | null,
  data: {
    motto: '欢迎来到斗牛扑克',
    modalShow: false,
    inputValue: '', // 已废弃：现在直接从room-modal组件的confirm事件获取房间号
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
    hasUserInfo: false,
    loginFlag: LoginStatus.LOADING, // 使用枚举: 0=加载中 1=已登录 2=需要手动登录 3=授权中 4=授权失败
    showRulesModal: false,
    loading: false,
    errorMsg: '',
    currentYear: new Date().getFullYear(),
    currentUser: null as any,
    // 临时存储用户选择的头像和昵称
    tempAvatar: '',
    tempNickname: '',
    // 一键登录相关状态
    showQuickLogin: true, // 是否显示一键登录按钮
    showCustomLogin: false, // 是否显示自定义登录表单
    authorizingQuickLogin: false, // 一键登录授权中
    // 输入框聚焦状态
    inputFocused: false, // 昵称输入框是否聚焦
    // 时间主题
    timeTheme: 'morning', // 时间主题: morning/afternoon/evening/night
  },

  lifetimes: {
    attached(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.onLoad();
      this.updateTimeTheme(); // 初始化时间主题
      this.startTimeThemeTimer(); // 启动定时器
    },
    detached(this: ComponentInstance) {
      // 组件销毁时清除定时器
      if (this.timeThemeTimer) {
        clearInterval(this.timeThemeTimer);
      }
    }
  },

  pageLifetimes: {
    show(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      // 页面显示时刷新用户信息
      this.refreshUserInfo();
      // 更新时间主题
      this.updateTimeTheme();
    }
  },

  methods: {
    onLoad(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      // 尝试静默登录
      this.silentLogin();
    },

    // ========== 时间主题控制 ==========
    /**
     * 根据当前时间更新主题
     */
    updateTimeTheme(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      const hour = new Date().getHours();
      let theme = 'morning';
      if (hour >= 6 && hour < 12) {
        theme = 'morning'; // 早晨 6-11点
      } else if (hour >= 12 && hour < 18) {
        theme = 'afternoon'; // 下午 12-17点
      } else if (hour >= 18 && hour < 20) {
        theme = 'evening'; // 傍晚 18-19点
      } else {
        theme = 'night'; // 夜晚 20-5点
      }
      // 更新data
      this.setData({ timeTheme: theme });
      // 更新page元素的data-theme属性（用于CSS选择器）
      const query = wx.createSelectorQuery();
      query.select('page').node();
      query.exec();
    },

    /**
     * 启动定时器，每分钟检查一次时间主题
     */
    startTimeThemeTimer(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      // 每60秒检查一次时间
      this.timeThemeTimer = setInterval(() => {
        this.updateTimeTheme();
      }, 60000);
    },

    // 静默登录 - 只检查本地缓存
    silentLogin(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      // 检查本地是否有用户信息
      const localUserInfo = getUserInfo();
      if (localUserInfo) {
        this.setData({
          loginFlag: LoginStatus.LOGGED_IN,
          currentUser: localUserInfo,
          hasUserInfo: true
        });

        // 检查是否在房间内
        this.checkRoomStatus();
        return;
      }

      // 没有本地信息,显示登录页面
      this.setData({
        loginFlag: LoginStatus.NEED_LOGIN,
        loading: false
      });
    },

    // 检查房间状态
    checkRoomStatus(this: ComponentInstance) {
      const roomInfo = getRoomInfo();
      if (roomInfo && roomInfo.length > 0 && this.data.currentUser) {
        roomInfo.forEach(info => {
          const flag = info.players.some(item => item && item.userId === this.data.currentUser.id);
          if (flag) {
            app.globalData.roomId = info.roomId;
            app.globalData.roomNumber = info.roomNumber;
            wx.showToast({
              title: '继续上次游戏',
              icon: 'none',
              duration: 1500
            });
            setTimeout(() => {
              wx.reLaunch({
                url: '../card_game/card_game'
              });
            }, 1500);
          }
        });
      }
    },
    // 选择头像（微信新规范）
    onChooseAvatar(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, e: any) {
      this.setData({
        tempAvatar: e.detail.avatarUrl,
        errorMsg: ''
      });
    },
    // 输入昵称
    // 输入昵称 - 支持type="nickname"自动获取微信昵称
    onNicknameInput(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, e: any) {
      const nickname = e.detail.value || '';
      this.setData({
        tempNickname: nickname,
        errorMsg: ''
      });

      // 如果获取到了昵称,显示提示
      if (nickname) {
        wx.showToast({
          title: '已获取昵称',
          icon: 'success',
          duration: 1500
        });
      }
    },

    // 昵称输入框聚焦
    onNicknameFocus(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({
        inputFocused: true
      });
    },

    // 昵称输入框失焦
    onNicknameBlur(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({
        inputFocused: false
      });
    },

    // 完成登录
    handleManualLogin(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      // 验证昵称
      const nickname = this.data.tempNickname.trim();
      if (!nickname) {
        this.showError('请输入昵称', 2000);
        return;
      }
      if (nickname.length < 2 || nickname.length > 10) {
        this.showError('昵称长度应在2-10个字符之间', 3000);
        return;
      }
      // 验证头像（如果用户没选择，使用默认头像）
      const avatar = this.data.tempAvatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
      this.setData({ loading: true, errorMsg: '' });

      // 获取微信登录code
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 执行登录
            this.performLogin(loginRes.code, nickname, avatar);
          } else {
            this.setData({ loading: false });
            this.showError('微信授权失败,请重试', 2000);
          }
        },
        fail: (error) => {
          this.setData({ loading: false });
          this.showError('网络异常,请检查网络', 3000);
        }
      });
    },

    // 执行登录
    performLogin(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, code: string, nickName: string, avatarUrl: string) {
      login({
        code: code,
        name: nickName,
        avatar: avatarUrl
      }).then(response => {
        if (response.code === 200 && response.data) {
          // 保存用户信息到本地
          setUserInfo(response.data);
          this.setData({
            loginFlag: LoginStatus.LOGGED_IN,
            currentUser: response.data,
            hasUserInfo: true,
            loading: false
          });

          wx.showToast({
            title: '登录成功!',
            icon: 'success',
            duration: 1500
          });
          // 检查房间状态
          setTimeout(() => {
            this.checkRoomStatus();
          }, 1500);
        } else {
          this.setData({ loading: false });
          this.showError(response.msg || '登录失败,请重试', 3000);
        }
      }).catch((error) => {
        this.setData({ loading: false });
        this.showError('网络连接异常,请检查网络', 3000);
      });
    },

    // ==================== 一键登录功能 ====================

    // 微信手机号授权回调（一键登录）
    onGetPhoneNumber(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, e: any) {
      const { encryptedData, iv, errMsg, code } = e.detail;

      // 检查授权是否成功
      if (QUICK_LOGIN_CONFIG.SUCCESS_MESSAGES.includes(errMsg)) {
        this.performQuickLogin(encryptedData, iv, code);
      } else if (errMsg === QUICK_LOGIN_CONFIG.DENY_MESSAGE) {
        this.handleAuthorizationDenied();
      } else {
        this.handleAuthorizationFailed();
      }
    },

    // 执行快速登录
    async performQuickLogin(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, encryptedData: string, iv: string, phoneCode: string) {
      this.setData({
        authorizingQuickLogin: true,
        loading: true,
        loginFlag: LoginStatus.AUTHORIZING,
        errorMsg: ''
      });
      try {
        // 获取微信登录code
        const loginRes = await wx.login();
        if (!loginRes.code) {
          throw new Error('获取微信登录code失败');
        }
        // 调用登录API（Mock数据会模拟解密手机号的过程）
        const response = await login({
          code: loginRes.code,
          encryptedData: encryptedData,
          iv: iv,
          phoneCode: phoneCode,
          loginType: QUICK_LOGIN_CONFIG.LOGIN_TYPE.QUICK
        });

        if (response.code === 200 && response.data) {
          // 登录成功，保存用户信息
          setUserInfo(response.data);

          this.setData({
            loginFlag: LoginStatus.LOGGED_IN,
            currentUser: response.data,
            hasUserInfo: true,
            loading: false,
            authorizingQuickLogin: false
          });

          wx.showToast({
            title: '登录成功!',
            icon: 'success',
            duration: 1500
          });

          // 检查房间状态
          setTimeout(() => {
            this.checkRoomStatus();
          }, 1500);
        } else {
          throw new Error(response.msg || '登录失败');
        }
      } catch (error: any) {
        console.error('[Quick Login] 快速登录失败:', error);
        this.setData({
          loading: false,
          authorizingQuickLogin: false,
          loginFlag: LoginStatus.AUTH_FAILED
        });
        this.showError(error.message || '登录失败，请重试', 3000);
        // 授权失败后自动切换到自定义登录
        setTimeout(() => {
          this.handleAuthorizationFailed();
        }, 1000);
      }
    },

    // 处理用户拒绝授权
    handleAuthorizationDenied(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({
        showQuickLogin: false,
        showCustomLogin: true,
        authorizingQuickLogin: false,
        loginFlag: LoginStatus.NEED_LOGIN
      });

      wx.showToast({
        title: '您可以使用自定义方式登录',
        icon: 'none',
        duration: 2000
      });
    },

    // 处理授权失败
    handleAuthorizationFailed(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      console.error('[Quick Login] 授权失败，显示自定义登录');

      this.setData({
        showQuickLogin: false,
        showCustomLogin: true,
        authorizingQuickLogin: false,
        loginFlag: LoginStatus.AUTH_FAILED
      });

      this.showError('授权失败，请使用自定义方式登录', 3000);
    },

    // 切换到自定义登录
    switchToCustomLogin(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({
        showQuickLogin: false,
        showCustomLogin: true,
        loginFlag: LoginStatus.NEED_LOGIN
      });
    },
    // 切换回一键登录
    switchToQuickLogin(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({
        showQuickLogin: true,
        showCustomLogin: false,
        loginFlag: LoginStatus.NEED_LOGIN,
        errorMsg: '' // 清除错误消息
      });
    },

    // ==================== 原有方法 ====================

    // 显示用户菜单
    showUserMenu(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      wx.showActionSheet({
        itemList: ['个人资料', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 个人资料
            wx.navigateTo({
              url: '/pages/profile/profile'
            });
          } else if (res.tapIndex === 1) {
            // 退出登录
            this.handleLogout();
          }
        }
      });
    },

    // 退出登录
    handleLogout(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            removeUserInfo();
            this.setData({
              loginFlag: LoginStatus.NEED_LOGIN,
              currentUser: null,
              hasUserInfo: false,
              tempAvatar: '',
              tempNickname: '',
              showQuickLogin: true,  // 重置为显示一键登录
              showCustomLogin: false,
              errorMsg: ''
            });
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500
            });
          }
        }
      });
    },

    // 刷新用户信息（从个人资料页返回时调用）
    refreshUserInfo(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      const userInfo = getUserInfo();
      if (userInfo) {
        this.setData({
          currentUser: userInfo
        });
      }
    },

    // 快速开始 - 创建房间
    quickStart(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      if (!this.data.currentUser) {
        this.showError('请先登录', 2000);
        return;
      }
      this.setData({ loading: true, errorMsg: '' });
      createRoom({
        userId: this.data.currentUser.id,
        roomType: 2
      }).then(response => {
        if (response.code === 200 && response.data) {
          const roomInfo = response.data.roomInfo;
          app.globalData.roomId = roomInfo.roomId;
          app.globalData.roomNumber = roomInfo.roomNumber;
          setRoomInfo(roomInfo);
          wx.showToast({
            title: '房间创建成功',
            icon: 'success',
            duration: 1000
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '../card_game/card_game'
            });
          }, 1000);
        } else {
          this.setData({ loading: false });
          this.showError(response.msg || '创建房间失败', 3000);
        }
      }).catch(() => {
        this.setData({ loading: false });
        this.showError('网络异常,请重试', 3000);
      });
    },

    // 显示加入房间弹窗
    showModal(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      if (!this.data.currentUser) {
        this.showError('请先登录', 2000);
        return;
      }
      this.setData({ modalShow: true, errorMsg: '' });
    },

    // 关闭弹窗
    onCloseModal(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({ modalShow: false });
    },

    // 确认加入房间
    onConfirm(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, e: any) {
      // 从组件的confirm事件中获取房间号
      const roomNumber = e.detail.value.trim() || '';

      if (roomNumber === '') {
        this.showError('请输入房间号', 2000);
        return;
      }

      // room-modal组件已经验证了格式（4-8位字母数字）
      // 这里再验证是否符合6位数字的业务规则
      if (!/^\d{6}$/.test(roomNumber)) {
        this.showError('房间号应为6位数字', 3000);
        return;
      }
      this.setData({ loading: true, errorMsg: '', modalShow: false });
      joinRoom({
        userId: this.data.currentUser.id,
        roomNumber: roomNumber
      }).then(response => {
        const { roomInfo } = response.data
        if (response.code === 200 && roomInfo) {
          app.globalData.roomId = roomInfo.roomId;
          app.globalData.roomNumber = roomInfo.roomNumber;
          wx.showToast({
            title: '加入成功',
            icon: 'success',
            duration: 1000
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '../card_game/card_game'
            });
          }, 1000);
          setRoomInfo(roomInfo)
        } else {
          this.setData({ loading: false });
          this.showError(response.msg || '房间不存在', 3000);
        }
      }).catch(() => {
        this.setData({ loading: false });
        this.showError('网络异常,请重试', 3000);
      });
    },

    onCancel(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({ modalShow: false });
    },

    // 已废弃：现在直接从room-modal组件的confirm事件参数中获取房间号
    // 保留此方法以防将来需要实时监听输入变化
    dialogInputChange(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, e: { detail: { value: any } }) {
      this.setData({ inputValue: e.detail.value, errorMsg: '' });
    },

    // 显示游戏规则
    showRules(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({ showRulesModal: true });
    },

    // 关闭游戏规则
    onCloseRules(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({ showRulesModal: false });
    },

    // 选择游戏模式
    selectMode(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      wx.showToast({
        title: '更多模式敬请期待',
        icon: 'none',
        duration: 2000
      });
    },

    // 统一的错误提示
    showError(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance, message: string, duration: number = 3000) {
      this.setData({ errorMsg: message });
      setTimeout(() => {
        this.setData({ errorMsg: '' });
      }, duration);
    },

    // 清除错误信息
    clearError(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      this.setData({ errorMsg: '' });
    }
  }
})
