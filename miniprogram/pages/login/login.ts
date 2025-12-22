// index.ts

import { login } from "../../api/index";
import { getUserInfo, setUserInfo } from "../../utils/localStorage";

// 获取应用实例
// const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: '欢迎来到斗牛扑克游戏',
    modalShow: false,
    inputValue: '',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    loading: false,
    errorMsg: ''
  },
  methods: {
    onLoad() {
      if (getUserInfo()) {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
        errorMsg: ''
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
        errorMsg: ''
      })
    },
    bindViewTap() {
      if (!this.data.userInfo.nickName) {
        this.setData({
          errorMsg: '请输入昵称'
        })
        return;
      }
      
      if (!this.data.userInfo.avatarUrl || this.data.userInfo.avatarUrl === defaultAvatarUrl) {
        this.setData({
          errorMsg: '请选择头像'
        })
        return;
      }
      
      this.setData({
        loading: true,
        errorMsg: ''
      });
      
      wx.login({
        success: res => {
          if (res.code) {
            // 调用后端登录
            login({ 
              code: res.code, 
              name: this.data.userInfo.nickName, 
              avatar: this.data.userInfo.avatarUrl 
            }).then(response => {
              if (response.code === 200 && response.data) {
                setUserInfo(response.data.data)
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1500
                })
                setTimeout(() => {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }, 1500)
              } else {
                this.setData({
                  errorMsg: response.msg || '登录失败，请重试'
                })
              }
            }).catch(error => {
              this.setData({
                errorMsg: '网络错误，请检查网络连接'
              })
            }).finally(() => {
              this.setData({
                loading: false
              })
            })
          } else {
            this.setData({
              loading: false,
              errorMsg: '微信登录失败，请重试'
            })
          }
        },
        fail: () => {
          this.setData({
            loading: false,
            errorMsg: '微信登录失败，请重试'
          })
        }
      })
    },
  },
})
