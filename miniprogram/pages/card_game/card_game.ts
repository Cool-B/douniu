import { IAppOption, userInfoRes } from "../../../typings/index"
import { baseUrl } from "../../utils/request"
import { getUserInfo, userInfo } from "../../utils/localStorage"
import { uniqueObjectArray } from "../../utils/util"
import request from "../../utils/request"
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
interface data {
  roomId: number,
  roomNumber: number,
  userInfoResList: userInfoRes[],
  currentUserInfo: userInfo,
  players: player[],
  session: string,
  // 是否开始本局游戏
  isStart: boolean,


  wb: [],
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

}
interface playerNumber { has: boolean, number: number, id: number, maxCard?: { number: number, suit: string }, isBoth?: boolean, isBoom: boolean }
interface player {
  name: string
  bet?: number,
  lookHand?: boolean
  showOther?: boolean
  pokers?: string[],
  // 积分
  score: number,
  // 1.正常2.退出房间/被踢出房间3.离线   
  state: number,
  // 1.待准备2.已准备
  status: number,
  userId: number,
  roomId: number,
  userType: number,
}
interface poke {
  suit: string,
  number: number,
  url?: string
}
//     方块     梅花        红桃     黑桃 
const suit = ['Spade', 'Heart', 'Club', 'Diamond',]
Page<data, Record<string, any>>({
  data: {
    roomId: 0,
    roomNumber: 0,
    userInfoResList: [],
    session: '',
    currentUserInfo: {
      avatar: '',
      id: 0,
      name: '',
      openid: '',
      phone: null,
      sex: null,
      token: '',
      username: '',
    },
    isStart: false,
    players: [],
    dealing: false,
    currentUser: 'banker',
    modalVisible: false, // 弹窗是否显示
    modalData: '',// 要传递的数据
    wb: [],
    playerNumber: [],
    pokers: [],
    range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    selectedValue: 0,
    isReady: false,
    isGaming: false,
    countdown: '02:00', // 初始倒计时时间为2分钟
    isAllShow: false
  },
  showLoading(title?: string, mask?: boolean) {
    wx.showLoading({
      title: title ? title + '...' : '加载中...',
      mask: mask === undefined ? true : mask, // 是否显示透明蒙层，防止触摸穿透，默认：false
    });
  },
  onLoad() {
    // 显示全屏loading
    this.showLoading()
    const { roomId, roomNumber } = app.globalData
    this.setData({
      roomId,
      roomNumber,
      currentUserInfo: getUserInfo() as userInfo
    }, () => {
      console.log(this.data.currentUserInfo);
      // this.updateUserInfoResList()
    })
    wx.connectSocket({
      url: 'ws://' + 'b89669be.natappfree.cc' + '/ws/asset', // 你的 WebSocket 服务器地址
    });
    // 监听 WebSocket 连接打开事件
    wx.onSocketOpen((res) => {
      console.log('WebSocket 已连接:', res);
    });
    // 监听 WebSocket 接收到服务器的消息事件
    wx.onSocketMessage((res) => {
      wx.hideLoading()
      console.log(1111111);
      
      if (res.data) {
        if ((res.data as string).includes('type')) {
          const data = JSON.parse(res.data as string)
          // 存储用户信息
          if (data.type === 1) {
            this.updateUserInfoResList(data.userInfoResList)
            return
          }
          // 修改用户信息
          if (data.type === 2) {
            this.updateUserInfoResList(data.userInfoResList)
            return
          }
          // 开始游戏
          if (data.type === 3) {
            this.setData({
              isStart: true
            })
            return
          }
          // 洗牌
          if (data.type === 4) {
            console.log('洗牌');
            return
          }
          // 发牌
          if (data.type === 5) {
            // this.updateUserInfoResList(data.userInfoResList)
            this.data.players.map(item => {
              if (item.userId === data.userId) {
                item.pokers = data.pokers
                return item
              }
              item.pokers = ['../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png']
              return item
            })
            this.setData({
              isGaming: true,
              players: this.data.players
            })
            this.startCountdown()
            return
          }
        }
        this.setData({
          session: res.data as string
        })
        const params = {
          type: 1,
          uid: this.data.currentUserInfo.id,
          sessionId: this.data.session,
          roomId: this.data.roomId
        }
        this.sendMseeage(params)
      }
    });
    this.initPlayers()

    // 模拟获取房间信息
    this.mockGetRoomInfo()
  },
  // Mock获取房间信息
  async mockGetRoomInfo() {
    try {
      const result = await request({
        url: '/poker/getRoomInfo',
        data: { roomId: this.data.roomId }
      });
      if (result.code === 200) {
        this.updateUserInfoResList(result.data.roomInfo.players);
      } else {
      }
    } catch (error) {
      console.error('获取房间信息失败:', error);
    } finally {
      // 确保在所有情况下都隐藏loading
      wx.hideLoading();
    }
  },
  /**
   * 更新玩家列表信息
   */
  updateUserInfoResList(userInfoResList: player[]) {
    userInfoResList.map((item: player, ) => {
      this.data.players[7] = item
      if (item.userId === this.data.currentUserInfo.id) {
        this.setData({
          currentUser: item.userType === 1 ? 'banker' : 'player',
          isReady: item.status === 1 ? false : true
        })
      }
    })
    this.setData({
      players: this.data.players
    })
  },
  // 模拟发送游戏操作消息
  async sendMseeage<T>(params: T) {
    this.showLoading()

    try {
      // 根据参数类型模拟不同的游戏操作
      const paramData = params as any;

      switch (paramData.type) {
        case 1: // 加入房间
          const joinResult = await request({
            url: '/poker/joinRoom',
            data: { userId: paramData.uid, roomNumber: this.data.roomNumber }
          });
          if (joinResult.code === 200) {
            this.updateUserInfoResList(joinResult.data.roomInfo.players);
          }
          break;

        case 2: // 准备/取消准备
          const player = this.data.players.find(p => p.userId === paramData.uid);
          if (player) {
            player.status = paramData.status;
            this.setData({ players: this.data.players });
          }
          break;

        case 3: // 开始游戏
          const startResult = await request({
            url: '/poker/startGame',
            data: { roomId: paramData.roomId, userId: paramData.uid }
          });
          if (startResult.code === 200) {
            this.setData({ isStart: true });
            this.mockDealCards();
          }
          break;

        case 4: // 洗牌
          const shuffleResult = await request({
            url: '/poker/gameAction',
            data: { gameId: 'mock_game_id', userId: paramData.uid, action: 'shuffle' }
          });
          if (shuffleResult.code === 200) {
            console.log('洗牌成功');
            this.clearPokes();
          }
          break;

        case 5: // 发牌
          const dealResult = await request({
            url: '/poker/gameAction',
            data: { gameId: 'mock_game_id', userId: paramData.uid, action: 'dealCards' }
          });
          if (dealResult.code === 200) {
            this.mockDealCards();
          }
          break;
      }

      console.log('操作执行成功');
    } catch (error) {
      console.error('操作执行失败:', error);
    }
  },

  // 模拟发牌
  mockDealCards() {
    const cardBackUrl = '../../assets/poke/Poker/Background.png';
    const players = this.data.players.map(player => ({
      ...player,
      pokers: player.userId === this.data.currentUserInfo.id ?
        ['../../assets/poke/Spade/1.png', '../../assets/poke/Heart/10.png', '../../assets/poke/Club/5.png', '../../assets/poke/Diamond/8.png', '../../assets/poke/Spade/3.png'] :
        [cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl, cardBackUrl]
    }));

    this.setData({
      isGaming: true,
      players: players
    });
    this.startCountdown();
  },
  initPlayers() {
    const players = [
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
      { avatar: defaultAvatarUrl, name: '', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 0, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 1, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, pokers: [], userType: 2, },
    ]
    this.setData({ players })
  },
  startGame() {
    this.showLoading('正在准备中')
    const params = {
      type: 3,
      roomId: this.data.roomId,
      uid: this.data.currentUserInfo.id,
    }
    this.sendMseeage(params)
  },
  showModal() {
    this.setData({
      modalVisible: true,
      modalData: '这是传递给弹窗的数据'
    });
  },
  cancelModal() {
    this.setData({
      modalVisible: false
    });
  },
  confirmModal() {
    console.log('用户点击了确认按钮');
    this.setData({
      modalVisible: false
    });
  },
  // 看牌
  checkPokes(e: { currentTarget: { dataset: { index: number } } }) {
    const index = e.currentTarget.dataset.index
    let flag: boolean = false
    const players = this.data.players.map((item, idx) => {
      if (index === idx) {
        item.lookHand = true
      }
      if (!item.lookHand && item.lookHand !== undefined) {
        flag = true
        return item
      }
      return item
    })
    this.setData({
      players,
      isAllShow: !flag
    })
  },
  // 所有玩家亮牌
  playersShowPoker() {
    this.setData({
      isGaming: false,
      isAllShow: false,
      players: this.data.players.map(item => {
        if (item.lookHand !== undefined) {
          item.lookHand = true
        }
        return item
      })
    })
  },
  // 结算本局数据
  settlementCurrent() {
    clearInterval(this.countdownInterval)
    this.shufflePoke()
    this.setData({
      isGaming: false,
      isAllShow: false
    })
  },
  // 倒计时
  startCountdown() {
    let endTime = Date.now() + 2 * 60 * 1000; // 设置倒计时结束时间为当前时间后2分钟
    this.countdownInterval = setInterval(() => {
      let remainingTime = endTime - Date.now();

      if (remainingTime <= 0) {
        this.setData({ countdown: '00:00' }); // 倒计时结束
        clearInterval(this.countdownInterval);
        this.playersShowPoker()
        return;
      }

      let minutes = Math.floor(remainingTime / (60 * 1000));
      let seconds = Math.floor((remainingTime % (60 * 1000)) / 1000) + 1;
      this.setData({ countdown: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` });
    }, 1000);
  },
  changeReady() {
    if (this.data.isGaming) return
    const { roomId, status, state } = this.data.players.find(item => item.userId === this.data.currentUserInfo.id) as player
    this.sendMseeage({
      type: 2,
      roomId,
      bet: this.data.selectedValue,
      status: status === 1 ? 2 : 1,
      state,
      uid: this.data.currentUserInfo.id
    })
  },
  onPickerChange(e: { detail: { value: number } }) {
    this.setData({
      selectedValue: this.data.range[e.detail.value],
    });
  },
  async clearPokes() {
    this.data.players = this.data.players.map(item => {
      if (item.pokers) {
        item.pokers = []
      }
      return item
    })
    this.setData({
      players: this.data.players
    })
  },
  // 发牌
  dealCards() {
    this.showLoading('发牌中')
    const params = {
      type: 5,
      roomId: this.data.roomId,
      uid: this.data.currentUserInfo.id,
    }
    this.sendMseeage(params)
  },
  // 是不是炸弹
  isBoom(cards: poke[]) {
    const poke = uniqueObjectArray<poke>(cards, 'number')
    return poke.length === 2
  },
  // 是不是牛双十
  isBothTen(cards: poke[]) {
    const values = cards.map(card => card.number);
    const tensCount = values.filter(value => value === 10).length;
    if (tensCount !== 2) {
      return false;
    }
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum % 10 === 0;
  },
  compareCards(card1: poke, card2: poke): number {
    if (card1.number !== card2.number) {
      return card1.number - card2.number;
    } else {
      return suit.indexOf(card1.suit) - suit.indexOf(card2.suit);
    }
  },
  // 排序
  sortCards(cards: poke[]): poke[] {
    return cards.sort((a, b) => this.compareCards(b, a));
  },
  getMaxCard(cards: poke[]): poke | null {
    for (let i = 0; i < cards.length; i++) {
      const currentCard = cards[i];
      const remainingPokes = cards.slice(0, i).concat(cards.slice(i + 1));
      for (let j = 0; j < remainingPokes.length - 2; j++) {
        for (let k = j + 1; k < remainingPokes.length - 1; k++) {
          for (let l = k + 1; l < remainingPokes.length; l++) {
            const selectedPokes = [remainingPokes[j], remainingPokes[k], remainingPokes[l]];
            const sum = selectedPokes.reduce((acc, curr) => acc + curr.number, 0);
            if (sum % 10 === 0) {
              return currentCard;
            }
          }
        }
      }
    }
    return null

  },
  // 获取牛的点数   或者最大的那张牌
  getPointNumber(flag: boolean, cards: { number: number; suit: string }[]): number | { number: number, suit: string } {
    if (flag) {
      let totalPoints = 0;
      for (const card of cards) {
        totalPoints += card.number;
      }
      if (totalPoints >= 10) {
        totalPoints %= 10;
      }
      return totalPoints;
    }
    return cards[0];
  },
  // 检查任意三张牌的点数之和是否为 10 的倍数
  isSumMultipleOfTen(cards: { number: number; suit: string }[], num: number): boolean {
    for (let i = 0; i < cards.length - num; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          const sum = cards[i].number + cards[j].number + cards[k].number;
          if (sum % 10 === 0) {
            return true;
          }
        }
      }
    }
    return false;
  },

  // 排序
  // sortCards(cards: poke[]): poke[] {
  //   return cards.sort((a, b) => {
  //     const valueDifference = a.number - b.number;
  //     if (valueDifference !== 0) {
  //       return valueDifference;
  //     }

  //     const suitDifference = suit.indexOf(a.suit) - suit.indexOf(b.suit);
  //     return suitDifference;
  //   });
  // },
  // 洗牌
  shufflePoke() {
    this.showLoading('洗牌中')
    const params = {
      type: 4,
      roomId: this.data.roomId,
      uid: this.data.currentUserInfo.id,
    }
    this.sendMseeage(params)
    // this.clearPokes()
    // // if (this.data.isGaming) return
    // if (event) {
    //   wx.showToast({
    //     title: '洗牌中',
    //     icon: 'loading',
    //     duration: 2000, // 持续时间，单位毫秒
    //   });
    // }
    // const pokers = this.shuffleArray(this.data.pokers)
    // this.setData({ pokers })
  },
  shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
  // toggleReady(e: { currentTarget: { dataset: { index: number } } }) {
  //   if (this.data.isGaming) return
  //   const index = e.currentTarget.dataset.index
  //   const players = this.data.players.map((player: player, i: number) => {
  //     console.log(i, e);
  //     if (i === index) {

  //       return { ...player, ready: !player.ready }
  //     }
  //     return player
  //   })
  //   this.setData({ players })
  // },
  isCanReady() {
    return this.data.selectedValue
  },
  get isAllPlayersReady() {
    return this.data.players.every((player: { ready: any; role: string }) => player.ready || player.role === 'banker')
  },
})