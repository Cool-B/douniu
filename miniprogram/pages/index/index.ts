// pages/index/index.ts - 登录首页（无 async/await，避开 babel runtime）
import { IAppOption } from "../../typings/index";
import { createRoom, login, joinRoom } from "../../api/index";
import { getUserInfo, setUserInfo, getRoomInfo, setRoomInfo, removeUserInfo } from "../../utils/localStorage";

const app = getApp<IAppOption>()

// 登录状态枚举
enum LoginStatus {
  LOADING = 0,
  LOGGED_IN = 1,
  NEED_LOGIN = 2,
  AUTHORIZING = 3,
  AUTH_FAILED = 4
}

// 一键登录相关常量
const QUICK_LOGIN_CONFIG = {
  SUCCESS_MESSAGES: ['getPhoneNumber:ok', 'getPhoneNumber:user confirm'],
  DENY_MESSAGE: 'getPhoneNumber:fail user deny',
  LOGIN_TYPE: {
    QUICK: 'quick',
    CUSTOM: 'custom'
  }
} as const;

Component<any, any, any>({
  timeThemeTimer: null as number | null,
  data: {
    motto: '欢迎来到斗牛扑克',
    modalShow: false,
    inputValue: '',
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
    hasUserInfo: false,
    loginFlag: LoginStatus.LOADING,
    showRulesModal: false,
    loading: false,
    errorMsg: '',
    currentYear: new Date().getFullYear(),
    currentUser: null as any,
    tempAvatar: '',
    tempNickname: '',
    showQuickLogin: true,
    showCustomLogin: false,
    authorizingQuickLogin: false,
    inputFocused: false,
    timeTheme: 'morning',
  },

  lifetimes: {
    attached() {
      this.onLoad();
      this.updateTimeTheme();
      this.startTimeThemeTimer();
    },
    detached() {
      if (this.timeThemeTimer) {
        clearInterval(this.timeThemeTimer);
      }
    }
  },

  pageLifetimes: {
    show() {
      this.refreshUserInfo();
      this.updateTimeTheme();
    }
  },

  methods: {
    onLoad() {
      this.silentLogin();
    },

    // ========== 时间主题控制 ==========
    updateTimeTheme() {
      const hour = new Date().getHours();
      let theme = 'morning';
      if (hour >= 6 && hour < 12) {
        theme = 'morning';
      } else if (hour >= 12 && hour < 18) {
        theme = 'afternoon';
      } else if (hour >= 18 && hour < 20) {
        theme = 'evening';
      } else {
        theme = 'night';
      }
      this.setData({ timeTheme: theme });
    },

    startTimeThemeTimer() {
      this.timeThemeTimer = setInterval(() => {
        this.updateTimeTheme();
      }, 60000);
    },

    // 静默登录
    silentLogin() {
      const localUserInfo = getUserInfo();
      if (localUserInfo) {
        this.setData({
          loginFlag: LoginStatus.LOGGED_IN,
          currentUser: localUserInfo,
          hasUserInfo: true
        });
        this.checkRoomStatus();
        return;
      }
      this.setData({
        loginFlag: LoginStatus.NEED_LOGIN,
        loading: false
      });
    },

    // 检查房间状态
    checkRoomStatus() {
      const roomInfo = getRoomInfo();
      if (roomInfo && roomInfo.length > 0 && this.data.currentUser) {
        roomInfo.forEach(info => {
          const flag = info.players.some((item: any) => item && item.userId === this.data.currentUser.id);
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

    // 选择头像
    onChooseAvatar(e: any) {
      this.setData({
        tempAvatar: e.detail.avatarUrl,
        errorMsg: ''
      });
    },

    // 输入昵称
    onNicknameInput(e: any) {
      const nickname = e.detail.value || '';
      this.setData({
        tempNickname: nickname,
        errorMsg: ''
      });
      if (nickname) {
        wx.showToast({
          title: '已获取昵称',
          icon: 'success',
          duration: 1500
        });
      }
    },

    onNicknameFocus() {
      this.setData({ inputFocused: true });
    },

    onNicknameBlur() {
      this.setData({ inputFocused: false });
    },

    // 完成登录（手动）
    handleManualLogin() {
      const nickname = this.data.tempNickname.trim();
      if (!nickname) {
        this.showError('请输入昵称', 2000);
        return;
      }
      if (nickname.length < 2 || nickname.length > 10) {
        this.showError('昵称长度应在2-10个字符之间', 3000);
        return;
      }
      const avatar = this.data.tempAvatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
      this.setData({ loading: true, errorMsg: '' });

      const self = this;
      wx.login({
        success: function (loginRes: any) {
          if (loginRes.code) {
            self.performLogin(loginRes.code, nickname, avatar);
          } else {
            self.setData({ loading: false });
            self.showError('微信授权失败,请重试', 2000);
          }
        },
        fail: function () {
          self.setData({ loading: false });
          self.showError('网络异常,请检查网络', 3000);
        }
      });
    },

    // 执行登录
    performLogin(code: string, nickName: string, avatarUrl: string) {
      const self = this;
      login({
        code: code,
        name: nickName,
        avatar: avatarUrl
      }).then(function (response: any) {
        if (response.code === 200 && response.data) {
          const userInfo = response.data.userInfo;
          const token = response.data.token;
          setUserInfo(userInfo);
          if (token) wx.setStorageSync('token', token);
          self.setData({
            loginFlag: LoginStatus.LOGGED_IN,
            currentUser: userInfo,
            hasUserInfo: true,
            loading: false
          });
          wx.showToast({
            title: '登录成功!',
            icon: 'success',
            duration: 1500
          });
          setTimeout(function () {
            self.checkRoomStatus();
          }, 1500);
        } else {
          self.setData({ loading: false });
          self.showError(response.msg || '登录失败,请重试', 3000);
        }
      }).catch(function () {
        self.setData({ loading: false });
        self.showError('网络连接异常,请检查网络', 3000);
      });
    },

    // ==================== 一键登录 ====================

    // 微信手机号授权回调
    onGetPhoneNumber(e: any) {
      const { encryptedData, iv, errMsg, code } = e.detail;
      if (QUICK_LOGIN_CONFIG.SUCCESS_MESSAGES.includes(errMsg)) {
        this.performQuickLogin(encryptedData, iv, code);
      } else if (errMsg === QUICK_LOGIN_CONFIG.DENY_MESSAGE) {
        this.handleAuthorizationDenied();
      } else {
        this.handleAuthorizationFailed();
      }
    },

    // 执行快速登录
    performQuickLogin(encryptedData: string, iv: string, phoneCode: string) {
      this.setData({
        authorizingQuickLogin: true,
        loading: true,
        loginFlag: LoginStatus.AUTHORIZING,
        errorMsg: ''
      });
      const self = this;
      wx.login({
        success: function (loginRes: any) {
          if (!loginRes.code) {
            self.setData({
              loading: false,
              authorizingQuickLogin: false,
              loginFlag: LoginStatus.AUTH_FAILED
            });
            self.showError('获取微信登录code失败', 3000);
            return;
          }
          login({
            code: loginRes.code,
            encryptedData: encryptedData,
            iv: iv,
            phoneCode: phoneCode,
            loginType: QUICK_LOGIN_CONFIG.LOGIN_TYPE.QUICK
          }).then(function (response: any) {
            if (response.code === 200 && response.data) {
              const userInfo = response.data.userInfo;
              const token = response.data.token;
              setUserInfo(userInfo);
              if (token) wx.setStorageSync('token', token);
              self.setData({
                loginFlag: LoginStatus.LOGGED_IN,
                currentUser: userInfo,
                hasUserInfo: true,
                loading: false,
                authorizingQuickLogin: false
              });
              wx.showToast({
                title: '登录成功!',
                icon: 'success',
                duration: 1500
              });
              setTimeout(function () {
                self.checkRoomStatus();
              }, 1500);
            } else {
              self.setData({
                loading: false,
                authorizingQuickLogin: false,
                loginFlag: LoginStatus.AUTH_FAILED
              });
              self.showError(response.msg || '登录失败，请重试', 3000);
              setTimeout(function () {
                self.handleAuthorizationFailed();
              }, 1000);
            }
          }).catch(function (error: any) {
            self.setData({
              loading: false,
              authorizingQuickLogin: false,
              loginFlag: LoginStatus.AUTH_FAILED
            });
            self.showError(error.message || '登录失败，请重试', 3000);
            setTimeout(function () {
              self.handleAuthorizationFailed();
            }, 1000);
          });
        },
        fail: function () {
          self.setData({
            loading: false,
            authorizingQuickLogin: false,
            loginFlag: LoginStatus.AUTH_FAILED
          });
          self.showError('微信登录失败', 3000);
        }
      });
    },

    handleAuthorizationDenied() {
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

    handleAuthorizationFailed() {
      this.setData({
        showQuickLogin: false,
        showCustomLogin: true,
        authorizingQuickLogin: false,
        loginFlag: LoginStatus.AUTH_FAILED
      });
      this.showError('授权失败，请使用自定义方式登录', 3000);
    },

    switchToCustomLogin() {
      this.setData({
        showQuickLogin: false,
        showCustomLogin: true,
        loginFlag: LoginStatus.NEED_LOGIN
      });
    },

    switchToQuickLogin() {
      this.setData({
        showQuickLogin: true,
        showCustomLogin: false,
        loginFlag: LoginStatus.NEED_LOGIN,
        errorMsg: ''
      });
    },

    // ==================== 原有方法 ====================

    showUserMenu() {
      const self = this;
      wx.showActionSheet({
        itemList: ['个人资料', '退出登录'],
        success: function (res: any) {
          if (res.tapIndex === 0) {
            wx.navigateTo({ url: '/pages/profile/profile' });
          } else if (res.tapIndex === 1) {
            self.handleLogout();
          }
        }
      });
    },

    handleLogout() {
      const self = this;
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: function (res: any) {
          if (res.confirm) {
            removeUserInfo();
            self.setData({
              loginFlag: LoginStatus.NEED_LOGIN,
              currentUser: null,
              hasUserInfo: false,
              tempAvatar: '',
              tempNickname: '',
              showQuickLogin: true,
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

    refreshUserInfo() {
      const userInfo = getUserInfo();
      if (userInfo) {
        this.setData({ currentUser: userInfo });
      }
    },

    // 快速开始 - 创建房间
    quickStart() {
      if (!this.data.currentUser) {
        this.showError('请先登录', 2000);
        return;
      }
      this.setData({ loading: true, errorMsg: '' });
      const self = this;
      createRoom({
        userId: this.data.currentUser.id,
        roomType: 2
      }).then(function (response: any) {
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
          setTimeout(function () {
            wx.redirectTo({ url: '../card_game/card_game' });
          }, 1000);
        } else {
          self.setData({ loading: false });
          self.showError(response.msg || '创建房间失败', 3000);
        }
      }).catch(function () {
        self.setData({ loading: false });
        self.showError('网络异常,请重试', 3000);
      });
    },

    // 显示加入房间弹窗
    showModal() {
      if (!this.data.currentUser) {
        this.showError('请先登录', 2000);
        return;
      }
      this.setData({ modalShow: true, errorMsg: '' });
    },

    onCloseModal() {
      this.setData({ modalShow: false });
    },

    onConfirm(e: any) {
      const roomNumber = e.detail.value.trim() || '';
      if (roomNumber === '') {
        this.showError('请输入房间号', 2000);
        return;
      }
      if (!/^\d{6}$/.test(roomNumber)) {
        this.showError('房间号应为6位数字', 3000);
        return;
      }
      this.setData({ loading: true, errorMsg: '', modalShow: false });
      const self = this;
      joinRoom({
        userId: this.data.currentUser.id,
        roomNumber: roomNumber
      }).then(function (response: any) {
        const roomInfo = response.data && response.data.roomInfo;
        if (response.code === 200 && roomInfo) {
          app.globalData.roomId = roomInfo.roomId;
          app.globalData.roomNumber = roomInfo.roomNumber;
          wx.showToast({
            title: '加入成功',
            icon: 'success',
            duration: 1000
          });
          setTimeout(function () {
            wx.redirectTo({ url: '../card_game/card_game' });
          }, 1000);
          setRoomInfo(roomInfo);
        } else {
          self.setData({ loading: false });
          self.showError(response.msg || '房间不存在', 3000);
        }
      }).catch(function () {
        self.setData({ loading: false });
        self.showError('网络异常,请重试', 3000);
      });
    },

    onCancel() {
      this.setData({ modalShow: false });
    },

    dialogInputChange(e: { detail: { value: any } }) {
      this.setData({ inputValue: e.detail.value, errorMsg: '' });
    },

    showRules() {
      this.setData({ showRulesModal: true });
    },

    onCloseRules() {
      this.setData({ showRulesModal: false });
    },

    selectMode() {
      wx.showToast({
        title: '更多模式敬请期待',
        icon: 'none',
        duration: 2000
      });
    },

    showError(message: string, duration: number = 3000) {
      this.setData({ errorMsg: message });
      const self = this;
      setTimeout(function () {
        self.setData({ errorMsg: '' });
      }, duration);
    },

    clearError() {
      this.setData({ errorMsg: '' });
    }
  }
})
