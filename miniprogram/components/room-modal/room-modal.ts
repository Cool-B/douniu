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

      // 与首页统一: 6位数字 (后端生成的房间号格式)
      if (!/^\d{6}$/.test(value)) {
        wx.showToast({
          title: '房间号为6位数字',
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
      this.triggerEvent('quickstart');
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

