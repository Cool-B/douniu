Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '房间号'
    },
    showQuickStart: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputValue: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 输入框输入事件
     */
    onInput(e: any) {
      this.setData({
        inputValue: e.detail.value
      });
      this.triggerEvent('input', { value: e.detail.value });
    },

    /**
     * 关闭弹窗
     */
    onClose() {
      this.setData({
        inputValue: ''
      });
      this.triggerEvent('close');
    },

    /**
     * 取消按钮
     */
    onCancel() {
      this.setData({
        inputValue: ''
      });
      this.triggerEvent('cancel');
    },

    /**
     * 确定按钮
     */
    onConfirm() {
      const value = this.data.inputValue.trim();
      
      if (!value) {
        wx.showToast({
          title: '请输入房间号',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (value.length < 4 || value.length > 8) {
        wx.showToast({
          title: '房间号长度为4-8位',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 验证房间号格式（只允许字母和数字）
      const regex = /^[a-zA-Z0-9]+$/;
      if (!regex.test(value)) {
        wx.showToast({
          title: '房间号只能包含字母和数字',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      this.triggerEvent('confirm', { value: value });
      this.setData({
        inputValue: ''
      });
    },

    /**
     * 快速创建房间
     */
    onQuickStart() {
      // 生成随机房间号（6位字母数字组合）
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let roomId = '';
      for (let i = 0; i < 6; i++) {
        roomId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      this.triggerEvent('quickstart', { value: roomId });
      this.setData({
        inputValue: ''
      });
    },

    /**
     * 阻止触摸事件穿透
     */
    preventTouchMove() {
      return false;
    }
  }
})

