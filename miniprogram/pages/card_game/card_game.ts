import { IAppOption, userInfoRes } from "../../../typings/index"
import { getUserInfo, userInfo } from "../../utils/localStorage"
import { uniqueObjectArray } from "../../utils/util"
import request from "../../utils/request"
import { socketService, WSMessageType, WSMessage } from "../../utils/socketService"
import { USE_MOCK } from "../../config"
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

interface data {
  roomId: number,
  roomNumber: number,
  userInfoResList: userInfoRes[],
  currentUserInfo: userInfo,
  players: player[],
  session: string,
  isStart: boolean,
  dealing: boolean,
  pokers?: poke[],
  range: number[],
  playerNumber: playerNumber[],
  selectedValue: number,
  isReady: boolean,
  isGaming: boolean,
  currentUser: 'banker' | 'player',
  countdown: string,
  isAllShow: boolean,
  modalVisible: boolean,
  modalData: string,
  settlementInfo: any,
}

interface playerNumber { has: boolean, number: number, id: number, maxCard?: { number: number, suit: string }, isBoth?: boolean, isBoom: boolean }
interface player {
  name: string
  bet?: number,
  lookHand?: boolean
  showOther?: boolean
  pokers?: string[],       // 牌面图片路径 (未亮牌时为背面)
  pokes?: poke[],          // 实际牌型数据 (亮牌后)
  show?: boolean,
  score: number,
  state: number,
  status: number,
  userId: number,
  roomId: number,
  userType: number,
  avatar?: string,
  handResult?: any,
}
interface poke {
  suit: string,
  number: number,
  url?: string
}

const cardBackUrl = '../../assets/poke/Poker/Background.png'
const suit = ['Spade', 'Heart', 'Club', 'Diamond']

Page<data, Record<string, any>>({
  data: {
    roomId: 0,
    roomNumber: 0,
    userInfoResList: [],
    session: '',
    currentUserInfo: {
      avatar: '', id: 0, name: '', openid: '', phone: null, sex: null, token: '', username: '',
    },
    isStart: false,
    players: [],
    dealing: false,
    currentUser: 'banker',
    modalVisible: false,
    modalData: '',
    playerNumber: [],
    pokers: [],
    range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    selectedValue: 0,
    isReady: false,
    isGaming: false,
    countdown: '02:00',
    isAllShow: false,
    settlementInfo: null,
  },

  showLoading(title?: string, mask?: boolean) {
    wx.showLoading({
      title: title ? title + '...' : '加载中...',
      mask: mask === undefined ? true : mask,
    });
  },

  onLoad() {
    const { roomId, roomNumber } = app.globalData
    const userInfo = getUserInfo() as userInfo
    this.setData({
      roomId,
      roomNumber,
      currentUserInfo: userInfo,
    })

    this.initPlayers()

    if (USE_MOCK) {
      // Mock 模式: 用 HTTP 模拟
      this.mockGetRoomInfo()
      return
    }

    // 真实模式: 走 WebSocket
    this.setupWebSocket()
    this.fetchRoomInfo()
  },

  onUnload() {
    // 页面卸载, 清理监听
    socketService.off(WSMessageType.PlayerChange)
    socketService.off(WSMessageType.GameStart)
    socketService.off(WSMessageType.DealCards)
    socketService.off(WSMessageType.ShowHand)
    socketService.off(WSMessageType.Settlement)
    socketService.off(WSMessageType.Shuffle)
  },

  // ============ WebSocket 实时通信 ============
  setupWebSocket() {
    const { roomId } = this.data
    const userInfo = this.data.currentUserInfo

    // 连接
    socketService.connect(userInfo.id, roomId)

    // 监听玩家列表变化 (准备/加入/退出)
    socketService.on(WSMessageType.PlayerChange, (msg: WSMessage) => {
      this.updateUserInfoResList(msg.userInfoResList)
    })

    // 加入房间通知
    socketService.on(WSMessageType.JoinRoom, (msg: WSMessage) => {
      this.updateUserInfoResList(msg.userInfoResList)
    })

    // 游戏开始
    socketService.on(WSMessageType.GameStart, (msg: WSMessage) => {
      console.log('[WS] 游戏开始, gameId:', msg.gameId)
      this.setData({ isStart: true })
    })

    // 发牌 (只接收自己的牌)
    socketService.on(WSMessageType.DealCards, (msg: WSMessage) => {
      console.log('[WS] 收到牌:', msg.pokers)
      this.applyDealtCards(msg.userId, msg.pokers)
      this.setData({ isGaming: true })
      this.startCountdown()
    })

    // 洗牌
    socketService.on(WSMessageType.Shuffle, () => {
      console.log('[WS] 洗牌')
      this.clearPokes()
    })

    // 亮牌
    socketService.on(WSMessageType.ShowHand, (msg: WSMessage) => {
      console.log('[WS] 亮牌', msg.userId, msg.handResult)
      this.applyShowHand(msg.userId, msg.players)
    })

    // 结算
    socketService.on(WSMessageType.Settlement, (msg: WSMessage) => {
      console.log('[WS] 结算', msg.result)
      this.setData({ settlementInfo: msg.result })
      this.applySettlement(msg.result)
    })
  },

  // ============ HTTP API (辅助) ============
  async fetchRoomInfo() {
    try {
      const result = await request({
        url: '/poker/getRoomInfo',
        data: { roomId: this.data.roomId },
      })
      if (result.code === 200 && result.data) {
        this.updateUserInfoResList(result.data.roomInfo.players)
      }
    } catch (e) {
      console.error('获取房间信息失败:', e)
    } finally {
      wx.hideLoading()
    }
  },

  // ============ 游戏流程 ============
  updateUserInfoResList(userInfoResList: player[]) {
    if (!Array.isArray(userInfoResList)) return
    const me = this.data.currentUserInfo.id
    userInfoResList.forEach((item) => {
      this.data.players[7] = {
        ...item,
        avatar: (item as any).avatar || defaultAvatarUrl,
        pokers: item.show && item.pokes
          ? item.pokes.map(p => `../../assets/poke/${p.suit}/${p.number}.png`)
          : item.pokers && item.pokers.length === 5
            ? item.pokers
            : [cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl],
      }
      if (item.userId === me) {
        this.setData({
          currentUser: item.userType === 1 ? 'banker' : 'player',
          isReady: item.status === 2,
        })
      }
    })
    this.setData({ players: this.data.players })
  },

  // 应用发牌结果: 只有自己的牌会明牌, 其他人是背面
  applyDealtCards(myUserId: number, myCards: poke[]) {
    const me = this.data.currentUserInfo.id
    const isMine = myUserId === me
    const newPlayers = this.data.players.map(p => {
      if (p.userId === 0) return p
      const next = { ...p }
      if (p.userId === myUserId) {
        // 自己的牌: 亮牌
        next.pokes = myCards
        next.pokers = myCards.map(c => `../../assets/poke/${c.suit}/${c.number}.png`)
        next.show = true
      } else {
        // 别人的牌: 背面
        next.pokes = []
        next.pokers = [cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl]
        next.show = false
      }
      return next
    })
    this.setData({ players: newPlayers })
  },

  // 应用亮牌
  applyShowHand(userId: number, players: any[]) {
    const me = this.data.currentUserInfo.id
    const newPlayers = this.data.players.map(p => {
      const info = players.find(x => x.userId === p.userId)
      if (!info) return p
      const next = { ...p }
      next.show = info.show
      if (info.show) {
        next.handResult = info.handResult
        next.pokes = info.pokers
        next.pokers = info.pokers.map((c: poke) => `../../assets/poke/${c.suit}/${c.number}.png`)
      }
      return next
    })
    this.setData({
      players: newPlayers,
      isAllShow: newPlayers.every(p => p.userId === 0 || p.show),
    })
  },

  // 应用结算
  applySettlement(result: any) {
    if (!result) return
    clearInterval((this as any).countdownInterval)
    const newPlayers = this.data.players.map(p => {
      // 庄家
      if (p.userId === result.banker?.userId) {
        return { ...p, score: result.banker.newScore, handResult: { rankName: result.banker.hand } }
      }
      // 闲家
      const info = result.players?.find((x: any) => x.userId === p.userId)
      if (info) {
        return { ...p, score: info.newScore, handResult: { rankName: info.hand } }
      }
      return p
    })
    this.setData({ players: newPlayers })
  },

  // ============ 玩家操作 ============
  initPlayers() {
    const players = [
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 0, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 1, show: false, pokes: [] },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, show: false, pokes: [] },
    ]
    this.setData({ players })
  },

  // 开始游戏 (庄家)
  startGame() {
    if (USE_MOCK) {
      this.setData({ isStart: true })
      setTimeout(() => this.mockDealCards(), 1000)
      return
    }
    socketService.sendGameMessage({
      type: WSMessageType.GameStart,
      roomId: this.data.roomId,
    })
  },

  // 发牌 (庄家触发 - 后端自动发)
  dealCards() {
    if (USE_MOCK) {
      this.mockDealCards()
      return
    }
    // 后端在收到 startGame 时已自动发牌, 这里其实是开始游戏
    this.startGame()
  },

  // 洗牌
  shufflePoke() {
    this.showLoading('洗牌中')
    if (USE_MOCK) {
      setTimeout(() => {
        this.clearPokes()
        wx.hideLoading()
      }, 1000)
      return
    }
    socketService.sendGameMessage({
      type: WSMessageType.Shuffle,
      roomId: this.data.roomId,
      gameId: this.data.session, // session 暂存 gameId
    })
  },

  // 亮牌
  showCards() {
    if (USE_MOCK) {
      // Mock 模式: 自己判定
      const me = this.data.players[7]
      if (me && me.pokes) {
        // 直接设 show=true, 触发全显示
        this.playersShowPoker()
      }
      return
    }
    socketService.sendGameMessage({
      type: WSMessageType.ShowHand,
      gameId: this.data.session,
      roomId: this.data.roomId,
    })
  },

  // 结算
  settlementCurrent() {
    clearInterval((this as any).countdownInterval)
    this.shufflePoke()
    this.setData({ isGaming: false, isAllShow: false })
  },

  // 看牌
  checkPokes(e: { currentTarget: { dataset: { index: number } } }) {
    const index = e.currentTarget.dataset.index
    let flag = false
    const players = this.data.players.map((item, idx) => {
      if (index === idx) item.lookHand = true
      if (!item.lookHand && item.lookHand !== undefined) flag = true
      return item
    })
    this.setData({ players, isAllShow: !flag })
  },

  // 全部亮牌
  playersShowPoker() {
    this.setData({
      isGaming: false,
      isAllShow: false,
      players: this.data.players.map(item => {
        if (item.lookHand !== undefined) item.lookHand = true
        return item
      })
    })
  },

  startCountdown() {
    let endTime = Date.now() + 2 * 60 * 1000
    clearInterval((this as any).countdownInterval)
    ;(this as any).countdownInterval = setInterval(() => {
      let remainingTime = endTime - Date.now()
      if (remainingTime <= 0) {
        this.setData({ countdown: '00:00' })
        clearInterval((this as any).countdownInterval)
        this.playersShowPoker()
        return
      }
      let minutes = Math.floor(remainingTime / (60 * 1000))
      let seconds = Math.floor((remainingTime % (60 * 1000)) / 1000) + 1
      this.setData({ countdown: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` })
    }, 1000)
  },

  // 准备/取消准备
  changeReady() {
    if (this.data.isGaming) return
    const me = this.data.players.find(p => p.userId === this.data.currentUserInfo.id)
    if (!me) return
    const newStatus = me.status === 1 ? 2 : 1

    if (USE_MOCK) {
      me.status = newStatus
      this.setData({ isReady: newStatus === 2, players: this.data.players })
      return
    }

    socketService.sendGameMessage({
      type: WSMessageType.PlayerChange,
      roomId: this.data.roomId,
      status: newStatus,
      bet: this.data.selectedValue || 1,
    })
  },

  onPickerChange(e: { detail: { value: number } }) {
    this.setData({ selectedValue: this.data.range[e.detail.value] })
  },

  async clearPokes() {
    const players = this.data.players.map(item => {
      if (item.pokers) {
        return { ...item, pokers: [], pokes: [], show: false }
      }
      return item
    })
    this.setData({ players })
  },

  // ============ Mock 模式 (无后端) ============
  async mockGetRoomInfo() {
    try {
      const result = await request({
        url: '/poker/getRoomInfo',
        data: { roomId: this.data.roomId },
      })
      if (result.code === 200) {
        this.updateUserInfoResList(result.data.roomInfo.players)
      }
    } catch (error) {
      console.error('获取房间信息失败:', error)
    } finally {
      wx.hideLoading()
    }
  },

  mockDealCards() {
    const players = this.data.players.map(player => ({
      ...player,
      pokers: player.userId === this.data.currentUserInfo.id
        ? ['../../assets/poke/Spade/1.png', '../../assets/poke/Heart/10.png', '../../assets/poke/Club/5.png', '../../assets/poke/Diamond/8.png', '../../assets/poke/Spade/3.png']
        : [cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl],
    }))
    this.setData({ isGaming: true, players })
    this.startCountdown()
  },

  showModal() { this.setData({ modalVisible: true, modalData: '这是传递给弹窗的数据' }) },
  cancelModal() { this.setData({ modalVisible: false }) },
  confirmModal() { this.setData({ modalVisible: false }) },

  // ===== 牌型判定工具 (本地, 用于前端显示) =====
  isBoom(cards: poke[]) { return uniqueObjectArray<poke>(cards, 'number').length === 2 },
  isBothTen(cards: poke[]) {
    const values = cards.map(c => c.number)
    if (values.filter(v => v === 10).length !== 2) return false
    return values.reduce((a, b) => a + b, 0) % 10 === 0
  },
  compareCards(a: poke, b: poke): number {
    if (a.number !== b.number) return a.number - b.number
    return suit.indexOf(a.suit) - suit.indexOf(b.suit)
  },
  sortCards(cards: poke[]): poke[] { return cards.sort((a, b) => this.compareCards(b, a)) },
})
