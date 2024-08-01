// index.ts

import { login } from "../../api/index";
import { getUserInfo, setUserInfo } from "../../utils/localStorage";

// 获取应用实例
// const app = getApp<IAppOption>()
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
  },
  methods: {
    onLoad() {
      if (getUserInfo()) {
        wx.navigateTo({
          url: '../index/index',
        })
      }
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      console.log(nickName, avatarUrl, defaultAvatarUrl,);

      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    bindViewTap() {
      wx.login({
        success: res => {
          console.log(res.code)
          if (res.code) {
            // 调用后端登录
            login({ code: res.code, name: this.data.userInfo.nickName, avatar: this.data.userInfo.avatarUrl }).then(reponse => {
              if (reponse.data) {
                setUserInfo(reponse.data.data)
                wx.navigateTo({
                  url: '../index/index',
                })
              }
            })
          }
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        },
      })
    },
  },
})
