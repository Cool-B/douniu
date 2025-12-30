// index.ts
// 获取应用实例

import { IAppOption } from "../../typings/index";
import { createRoom, login, joinRoom } from "../../api/index";
import { getUserInfo, setUserInfo, userInfo, getRoomInfo, setRoomInfo, removeUserInfo } from "../../utils/localStorage";

const app = getApp<IAppOption>()

Component({
  data: {
    motto: '欢迎来到斗牛扑克',
    modalShow: false,
    inputValue: '',
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
    hasUserInfo: false,
    loginFlag: 0, // 0=加载中 1=已登录 2=需要手动登录
    showRulesModal: false,
    loading: false,
    errorMsg: '',
    currentYear: new Date().getFullYear(),
    currentUser: null as any,
    // 临时存储用户选择的头像和昵称
    tempAvatar: '',
    tempNickname: '',
  },

  lifetimes: {
    attached() {
      this.onLoad();
    }
  },

  pageLifetimes: {
    show() {
      // 页面显示时刷新用户信息
      this.refreshUserInfo();
    }
  },

  methods: {
    onLoad() {
      // 尝试静默登录
      this.silentLogin();
    },

    // 静默登录 - 只检查本地缓存
    silentLogin() {
      // 检查本地是否有用户信息
      const localUserInfo = getUserInfo();
      if (localUserInfo) {
        this.setData({
          loginFlag: 1,
          currentUser: localUserInfo,
          hasUserInfo: true
        });

        // 检查是否在房间内
        this.checkRoomStatus();
        return;
      }

      // 没有本地信息,显示登录页面
      console.log('❌ 无本地用户信息,需要手动登录');
      this.setData({
        loginFlag: 2,
        loading: false
      });
    },

    // 检查房间状态
    checkRoomStatus() {
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
    },
    // 完成登录
    handleManualLogin() {
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
    performLogin(code: string, nickName: string, avatarUrl: string) {
      login({
        code: code,
        name: nickName,
        avatar: avatarUrl
      }).then(response => {
        if (response.code === 200 && response.data) {
          // 保存用户信息到本地
          setUserInfo(response.data);
          this.setData({
            loginFlag: 1,
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

    // 显示用户菜单
    showUserMenu() {
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
    handleLogout() {
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            removeUserInfo();
            this.setData({
              loginFlag: 2,
              currentUser: null,
              hasUserInfo: false,
              tempAvatar: '',
              tempNickname: ''
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
    refreshUserInfo() {
      const userInfo = getUserInfo();
      if (userInfo) {
        this.setData({
          currentUser: userInfo
        });
        console.log('✅ 用户信息已刷新:', userInfo);
      }
    },

    // 快速开始 - 创建房间
    quickStart() {
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
    showModal() {
      if (!this.data.currentUser) {
        this.showError('请先登录', 2000);
        return;
      }
      this.setData({ modalShow: true, errorMsg: '' });
    },

    // 关闭弹窗
    onCloseModal() {
      this.setData({ modalShow: false });
    },

    // 确认加入房间
    onConfirm() {
      if (this.data.inputValue.trim() === '') {
        this.showError('请输入房间号', 2000);
        return;
      }

      const roomNumber = this.data.inputValue.trim();
      if (!/^\d{6}$/.test(roomNumber)) {
        this.showError('房间号应为6位数字', 3000);
        return;
      }

      this.setData({ loading: true, errorMsg: '' });

      joinRoom({
        userId: this.data.currentUser.id,
        roomNumber: roomNumber
      }).then(response => {
        if (response.code === 200 && response.data) {
          const roomData = response.data.data;
          app.globalData.roomId = roomData.roomId;
          app.globalData.roomNumber = roomData.roomNumber;

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
        } else {
          this.setData({ loading: false });
          this.showError(response.msg || '房间不存在', 3000);
        }
      }).catch(() => {
        this.setData({ loading: false });
        this.showError('网络异常,请重试', 3000);
      });
    },

    onCancel() {
      this.setData({ modalShow: false });
    },

    dialogInputChange(e: { detail: { value: any } }) {
      this.setData({ inputValue: e.detail.value, errorMsg: '' });
    },

    // 显示游戏规则
    showRules() {
      this.setData({ showRulesModal: true });
    },

    // 关闭游戏规则
    onCloseRules() {
      this.setData({ showRulesModal: false });
    },

    // 选择游戏模式
    selectMode() {
      wx.showToast({
        title: '更多模式敬请期待',
        icon: 'none',
        duration: 2000
      });
    },

    // 统一的错误提示
    showError(message: string, duration: number = 3000) {
      this.setData({ errorMsg: message });
      setTimeout(() => {
        this.setData({ errorMsg: '' });
      }, duration);
    },

    // 清除错误信息
    clearError() {
      this.setData({ errorMsg: '' });
    }
  }
})
