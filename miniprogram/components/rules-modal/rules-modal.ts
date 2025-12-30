Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal: false,
    animateOut: false
  },

  /**
   * 监听属性变化
   */
  observers: {
    'visible': function(newVal) {
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
     * 关闭弹窗
     */
    onClose() {
      this.triggerEvent('close');
    },

    /**
     * 阻止触摸事件穿透
     */
    preventTouchMove() {
      return false;
    }
  }
})

