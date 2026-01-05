Component<any, any, any>({
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
    inputValue: '',
    inputFocused: false,
    showModal: false,
    animateOut: false
  },

  /**
   * 监听属性变化
   */
  observers: {
    'visible': function (newVal) {
      if (newVal) {
        // 打开弹窗
        this.setData({
          showModal: true,
          animateOut: false
        });
      } else {
        // 关闭弹窗 - 先播放动画
        this.setData({
          animateOut: true
        });
        // 300ms 后真正隐藏
        setTimeout(() => {
          this.setData({
            showModal: false
          });
        }, 300);
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 输入框输入事件
     */
    onInput(e: any) {
      let value = e.detail.value;
      // 过滤非数字字符（额外保护，虽然type="number"已经限制）
      value = value.replace(/[^\d]/g, '');
      // 限制最多6位
      if (value.length > 6) {
        value = value.slice('', 6);
      }
      this.setData({
        inputValue: value
      });
      this.triggerEvent('input', { value: value });
    },

    /**
     * 输入框聚焦
     */
    onFocus() {
      this.setData({
        inputFocused: true
      });
    },

    /**
     * 输入框失焦
     */
    onBlur() {
      this.setData({
        inputFocused: false
      });
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
      const value = this.data.inputValue.toString().trim();

      if (!value) {
        wx.showToast({
          title: '请输入房间号',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 验证房间号格式（只允许数字）
      const regex = /^\d+$/;
      if (!regex.test(value)) {
        wx.showToast({
          title: '房间号只能包含数字',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (value.length !== 6) {
        wx.showToast({
          title: '房间号必须为6位数字',
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

