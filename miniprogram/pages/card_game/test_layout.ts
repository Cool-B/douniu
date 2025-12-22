// 测试页面逻辑
Page({
  data: {
    players: [
      {
        userId: '1',
        name: '庄家玩家',
        userType: 1,
        avatar: '../../assets/poke/banker.png',
        bet: 100,
        score: 500,
        ready: true,
        show: true,
        pokes: [1, 2, 3],
        suit: 'Heart',
        number: '1'
      },
      {
        userId: '2',
        name: '普通玩家',
        userType: 2,
        avatar: '../../assets/cow.png',
        bet: 50,
        score: 300,
        ready: false,
        show: false,
        pokers: [1, 2, 3]
      },
      {
        userId: null,
        name: '',
        userType: 0,
        avatar: '',
        bet: 0,
        score: 0,
        ready: false,
        show: false,
        pokes: []
      }
    ],
    roomNumber: '123456',
    activePlayers: 2,
    isGaming: false,
    isStart: false,
    currentUser: 'banker',
    isReady: false,
    selectedValue: '50',
    range: ['10', '20', '50', '100'],
    countdown: '10',
    gameStatus: '',
    loading: false
  },

  onLoad() {
    console.log('测试页面加载')
  },

  onReady() {
    console.log('测试页面准备完成')
  },

  onShow() {
    console.log('测试页面显示')
  },

  // 模拟游戏控制方法
  startGame() {
    console.log('开始游戏')
    this.setData({
      isStart: true,
      gameStatus: '游戏开始！'
    })
  },

  dealCards() {
    console.log('发牌')
    this.setData({
      isGaming: true,
      gameStatus: '正在发牌...'
    })
  },

  shufflePoke() {
    console.log('洗牌')
    this.setData({
      gameStatus: '正在洗牌...'
    })
  },

  settlementCurrent() {
    console.log('结算')
    this.setData({
      gameStatus: '正在结算...'
    })
  },

  showCards() {
    console.log('亮牌')
    this.setData({
      gameStatus: '正在亮牌...'
    })
  },

  changeReady() {
    console.log('切换准备状态')
    this.setData({
      isReady: !this.data.isReady
    })
  },

  onPickerChange(e: any) {
    console.log('选择下注值', e.detail.value)
    this.setData({
      selectedValue: this.data.range[e.detail.value]
    })
  },

  checkPokes(e: any) {
    console.log('查看手牌', e.currentTarget.dataset.index)
  }
})