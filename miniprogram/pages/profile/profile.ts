import { getUserInfo, setUserInfo } from '../../utils/localStorage';

Page<any, any>({
  data: {
    userInfo: {
      name: '',
      avatar: ''
    },
    tempNickname: '',
    showNicknameModal: false,
    hasChanges: false
  },

  onLoad() {
    const userInfo = getUserInfo();
    if (userInfo) {
      this.setData({
        userInfo: {
          name: userInfo.name || '',
          avatar: userInfo.avatar || ''
        },
        tempNickname: userInfo.name || ''
      });
    }
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          'userInfo.avatar': tempFilePath,
          hasChanges: true
        });
      },
      fail: (err) => {
        console.error('选择头像失败：', err);
        wx.showToast({
          title: '选择头像失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 显示昵称输入弹窗
  showNicknameInput() {
    this.setData({
      showNicknameModal: true,
      tempNickname: this.data.userInfo.name
    });
  },

  // 隐藏昵称输入弹窗
  hideNicknameInput() {
    this.setData({
      showNicknameModal: false
    });
  },

  // 昵称输入
  onNicknameInput(e: any) {
    this.setData({
      tempNickname: e.detail.value
    });
  },

  // 确认修改昵称
  confirmNickname() {
    const nickname = this.data.tempNickname.trim();
    
    if (!nickname) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      wx.showToast({
        title: '昵称长度为2-20个字符',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({
      'userInfo.name': nickname,
      showNicknameModal: false,
      hasChanges: true
    });

    wx.showToast({
      title: '昵称已修改',
      icon: 'success',
      duration: 1500
    });
  },

  // 保存个人资料
  saveProfile() {
    if (!this.data.hasChanges) {
      wx.showToast({
        title: '没有修改内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const { name, avatar } = this.data.userInfo;

    if (!name || !avatar) {
      wx.showToast({
        title: '请完善头像和昵称',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 获取完整用户信息
    const currentUserInfo = getUserInfo();
    const updatedUserInfo = {
      ...currentUserInfo,
      name,
      avatar
    };

    // 保存到本地存储
    setUserInfo(updatedUserInfo);

    this.setData({
      hasChanges: false
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    });

    // 延迟返回上一页（pageLifetimes.show 会自动刷新数据）
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 1500);
  },

  // 阻止穿透
  preventTouchMove() {
    return false;
  }
});
