// index.ts
// 获取应用实例

import { IAppOption } from "../../../typings/index";
import { createRoom, login, joinRoom } from "../../api/index";
import { getUserInfo, setUserInfo, userInfo } from "../../utils/localStorage";

const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: 'Hello World',
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
  },
  methods: {
    onLoad() {
      // 监听 WebSocket 连接关闭事件
      wx.onSocketClose(function (res) {
        console.log('WebSocket 已关闭:', res);
      });
      this.setData({
        loginFlag: getUserInfo() === '' ? 2 : 1
      })
      this.getUserProfile()
    },
    // 选择头像
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    // 输入名称
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    //登录
    bindViewTap() {
      const { nickName, avatarUrl } = this.data.userInfo
      if (!nickName || !avatarUrl) return
      wx.showLoading({
        title: '加载中', // 必填，显示的文本内容
        mask: true, // 可选，是否显示透明蒙层，防止触摸穿透，默认为false
      })
      wx.login({
        success: res => {
          if (res.code) {
            // 调用后端登录
            login({ code: res.code, name: this.data.userInfo.nickName, avatar: this.data.userInfo.avatarUrl }).then(reponse => {
              if (reponse.data) {
                setUserInfo(reponse.data.data)
                this.setData({
                  loginFlag: 1
                })
              }
            }).finally(() => {
              wx.hideLoading()
            })
          }
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        },
      })
    },
    // 事件处理函数
    selectMode() {
      wx.sendSocketMessage({
        data: 'Hello, 刘勇攀!', // 要发送的数据
        success: function (res) {
          console.log('消息发送成功:', res);
        },
        fail: function (res) {
          console.error('消息发送失败:', res);
        }
      });
      wx.showToast({
        title: '更多精彩敬请期待',
        icon: 'none',
        duration: 2000, // 持续时间，单位毫秒
      });
    },
    // 创建房间并加入房间
    quickStart() {
      wx.showLoading({
        title: '正在创建房间', // 必填，显示的文本内容
        mask: true, // 可选，是否显示透明蒙层，防止触摸穿透，默认为false
      })
      const { id } = getUserInfo() as userInfo
      createRoom({ userId: id, roomType: 2 }).then(res => {
        wx.hideLoading()
        if (res.data.data) {
          // 设置全局变量的 sharedData

          app.globalData = {
            roomId: res.data.data.id,
            roomNumber: res.data.data.roomNumber,
          };
          wx.redirectTo({
            url: '../card_game/card_game', // 跳转到游戏页面
          });
        }
      })
    },
    /**
 * 显示游戏规则弹窗
 */
    showRules() {
      this.setData({
        showRulesModal: true
      });
    },
    /**
     * 关闭游戏规则弹窗
     */
    onCloseRules() {
      this.setData({
        showRulesModal: false
      });
    },
    // showRules() {
    //   wx.showModal({
    //     title: '基础玩法',
    //     content: '1. 游戏每人使用5张扑克牌，任意三张组成十或十的倍数，剩下两张相加的点数取个位数。\n2. 玩家与庄家比牌，点数大的玩家获胜。',
    //     showCancel: false, // 是否显示取消按钮，默认为true
    //     confirmText: '确定', // 自定义确认按钮的文字，默认为'确定'
    //     success(res) {
    //       if (res.confirm) {
    //         console.log('用户点击了确定')
    //       } else if (res.cancel) {
    //         console.log('用户点击了取消')
    //       }
    //     }
    //   })
    // },
    contactUs() {
      wx.navigateTo({
        url: '../contact/contact', // 跳转到联系我们页面
      });
    },
    // 开始游戏
    startGame() {

      // wx.navigateTo({
      //   url: '../game/game', // 跳转到游戏页面
      // });
    },
    showModal() {
      this.setData({
        modalShow: true
      });
    },

    onCloseModal() {
      this.setData({
        modalShow: false
      });
    },
    onConfirm() {
      if (this.data.inputValue.trim() === '') {
        return
      }
      wx.showLoading({
        title: '正在加入房间', // 必填，显示的文本内容
        mask: true, // 可选，是否显示透明蒙层，防止触摸穿透，默认为false
      })
      const { id } = getUserInfo() as userInfo
      joinRoom({ userId: id, roomNumber: this.data.inputValue.trim() }).then(res => {
        if (res.data.data) {
          // 设置全局变量的 sharedData
          app.globalData = {
            roomId: res.data.data.roomId,
            roomNumber: Number(this.data.inputValue),
          };
          wx.redirectTo({
            url: '../card_game/card_game', // 跳转到游戏页面
          });
          return
        }
        wx.hideLoading()
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000, // 持续时间，单位毫秒
        });
      })
    },
    onCancel() {
      this.setData({
        modalShow: false
      });
    },
    dialogInputChange(e: { detail: { value: any; }; }) {
      this.setData({
        inputValue: e.detail.value
      });
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: () => {
          // console.log(res);
          // this.setData({
          //   userInfo: res.userInfo,
          // })
        }
      })
    },
  },
})
