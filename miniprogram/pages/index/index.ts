// index.ts
// 获取应用实例

import { IAppOption } from "../../typings/index";
import { createRoom, login, joinRoom } from "../../api/index";
import { getUserInfo, setUserInfo, userInfo, getRoomInfo, setRoomInfo } from "../../utils/localStorage";

const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: '欢迎来到斗牛扑克',
    modalShow: false,
    inputValue: '',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    loginFlag: 0,//1是登录2是没登录
    showRulesModal: false,
    loading: false,
    errorMsg: '',
    currentYear: new Date().getFullYear(), // 动态获取当前年份

    // 动画数据由animation-component组件处理
  },
  methods: {
    onLoad() {
      // 检查房间状态，如果在房间内则自动跳转
      const roomInfo = getRoomInfo();
      if (roomInfo && roomInfo.roomId) {
        app.globalData.roomId = roomInfo.roomId;
        app.globalData.roomNumber = roomInfo.roomNumber;
        wx.reLaunch({
          url: '../card_game/card_game'
        });
        return;
      }

      // 监听 WebSocket 连接关闭事件
      wx.onSocketClose(function (res) {
        console.log('WebSocket 已关闭:', res);
      });

      const userInfo = getUserInfo();
      this.setData({
        loginFlag: userInfo === '' ? 2 : 1,
        currentUser: userInfo === '' ? null : userInfo
      })
    },



    // 选择头像
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      console.log(avatarUrl, nickName);

      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
        errorMsg: ''
      })
    },

    // 输入名称
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      console.log(avatarUrl, nickName);
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
        errorMsg: ''
      })
    },

    // 登录
    bindViewTap() {
      const { nickName, avatarUrl } = this.data.userInfo
      if (!nickName) {
        this.showError('请输入昵称', 2000);
        return;
      }
      if (!avatarUrl || avatarUrl === defaultAvatarUrl) {
        this.showError('请选择头像', 2000);
        return;
      }

      this.setData({ loading: true, errorMsg: '' });

      wx.login({
        success: res => {
          if (res.code) {
            login({
              code: res.code,
              name: this.data.userInfo.nickName,
              avatar: this.data.userInfo.avatarUrl
            }).then(response => {
              console.log(response);

              if (response.code === 200 && response.data) {
                setUserInfo(response.data.data)
                this.setData({
                  loginFlag: 1,
                  currentUser: response.data.data
                })
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1500
                })
              } else {
                this.showError(response.msg || '登录失败，请检查网络连接', 3000);
              }
            }).catch(() => {
              this.showError('网络连接异常，请检查网络后重试', 3000);
            }).finally(() => {
              this.setData({ loading: false });
            })
          } else {
            this.showError('微信登录失败，请重试', 2000);
            this.setData({ loading: false });
          }
        },
        fail: () => {
          this.showError('微信登录失败，请检查微信权限设置', 3000);
          this.setData({ loading: false });
        }
      })
    },

    // 选择游戏模式
    selectMode() {
      wx.showToast({
        title: '更多精彩敬请期待',
        icon: 'none',
        duration: 2000,
      });
    },

    // 快速开始 - 创建房间
    quickStart() {
      if (!this.data.currentUser) {
        this.showError('请先登录后再创建房间', 2000);
        return;
      }
      this.setData({ loading: true, errorMsg: '' });

      createRoom({ userId: this.data.currentUser.id, roomType: 2 }).then(response => {
        if (response.code === 200 && response.data) {
          const roomData = response.data;
          app.globalData.roomId = roomData.roomInfo.roomId;
          app.globalData.roomNumber = roomData.roomInfo.roomNumber;
          // 保存房间信息到本地存储
          setRoomInfo({
            roomId: roomData.roomId,
            roomNumber: roomData.roomNumber
          });

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
          this.showError(response.msg || '创建房间失败，请稍后重试', 3000);
        }
      }).catch((err) => {
        console.log(err);

        this.showError('网络连接异常，请检查网络后重试', 3000);
      }).finally(() => {
        this.setData({ loading: false });
      })
    },

    // 显示游戏规则弹窗
    showRules() {
      this.setData({
        showRulesModal: true
      });
    },

    // 关闭游戏规则弹窗
    onCloseRules() {
      this.setData({
        showRulesModal: false
      });
    },

    // 联系我们
    contactUs() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none',
        duration: 2000,
      });
    },

    // 显示加入房间弹窗
    showModal() {
      this.setData({
        modalShow: true,
        errorMsg: ''
      });
    },

    // 关闭弹窗
    onCloseModal() {
      this.setData({
        modalShow: false
      });
    },

    // 确认加入房间
    onConfirm() {
      if (!this.data.currentUser) {
        this.showError('请先登录后再加入房间', 2000);
        return;
      }

      if (this.data.inputValue.trim() === '') {
        this.showError('请输入房间号', 2000);
        return;
      }

      // 验证房间号格式（6位数字）
      const roomNumber = this.data.inputValue.trim();
      if (!/^\d{6}$/.test(roomNumber)) {
        this.showError('房间号应为6位数字，请重新输入', 3000);
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

          // 保存房间信息到本地存储
          setRoomInfo({
            roomId: roomData.roomId,
            roomNumber: roomData.roomNumber
          });

          wx.showToast({
            title: '加入房间成功',
            icon: 'success',
            duration: 1000
          });

          setTimeout(() => {
            wx.redirectTo({
              url: '../card_game/card_game'
            });
          }, 1000);
        } else {
          this.showError(response.msg || '房间不存在或已满员，请检查房间号', 3000);
        }
      }).catch(() => {
        this.showError('网络连接异常，请检查网络后重试', 3000);
      }).finally(() => {
        this.setData({ loading: false });
      })
    },

    onCancel() {
      this.setData({
        modalShow: false
      });
    },

    dialogInputChange(e: { detail: { value: any; }; }) {
      this.setData({
        inputValue: e.detail.value,
        errorMsg: ''
      });
    },

    getUserProfile() {
      wx.getUserProfile({
        desc: '展示用户信息',
        success: () => {
          // 保留接口，实际使用新的登录流程
        }
      })
    },

    // 统一的错误提示方法
    showError(message: string, duration: number = 3000) {
      this.setData({ errorMsg: message });

      // 自动隐藏错误信息
      setTimeout(() => {
        this.setData({ errorMsg: '' });
      }, duration);
    },

    // 清除错误信息
    clearError() {
      this.setData({ errorMsg: '' });
    }
  },
})
