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

