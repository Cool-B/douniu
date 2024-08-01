import { IAppOption, userInfoRes } from "../../../typings/index"
import { getUserInfo, userInfo } from "../../utils/localStorage"
import { uniqueObjectArray } from "../../utils/util"
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
  pokes?: poke[],
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
  show?: boolean
  pokes?: poke[],
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
  number: number
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
    pokes: [],
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
    const { roomId, roomNumber, userInfoResList } = app.globalData
    console.log(userInfoResList);

    this.setData({
      roomId,
      roomNumber,
      userInfoResList,
      currentUserInfo: getUserInfo() as userInfo
    }, () => {
      this.updateUserInfoResList()
    })
    wx.connectSocket({
      url: 'ws://xpymak.natappfree.cc/ws/asset', // 你的 WebSocket 服务器地址
    });
    // 监听 WebSocket 连接打开事件
    wx.onSocketOpen(function (res) {
      console.log('WebSocket 已连接:', res);
    });
    // 监听 WebSocket 接收到服务器的消息事件
    wx.onSocketMessage((res) => {
      wx.hideLoading()
      if (res.data) {
        if ((res.data as string).includes('type')) {
          const data = JSON.parse(res.data as string)
          // 存储用户信息
          if (data.type === 1) {
            console.log('我储存了用户信息');
          }
          // 修改用户信息
          if (data.type === 2) {
            console.log('我更改了用户信息');
          }
          // 开始游戏
          if (data.type === 3) {
            this.setData({
              isStart: true
            })
          }
          // 洗牌
          if (data.type === 4) {
            console.log('洗牌');
          }
          // 发牌
          if (data.type === 5) {
            console.log('发牌');
          }
          return
        }
        this.setData({
          session: res.data as string
        })
        const params = {
          type: 1,
          uid: this.data.currentUserInfo.id,
          sessionId: this.data.session
        }
        this.sendMseeage(params)
      }
    });
    // // 监听 WebSocket 错误事件
    // wx.onSocketError(function (res) {
    //   console.error('WebSocket 错误:', res);
    // });
    // // 监听 WebSocket 连接关闭事件
    // wx.onSocketClose(function (res) {
    //   console.log('WebSocket 已关闭:', res);
    // });
    this.initPlayers()
  },
  /**
   * 更新玩家列表信息
   */
  updateUserInfoResList() {
    this.data.userInfoResList.map((item, index) => {
      this.data.players.splice(index, 1, item)
      if (item.userId === this.data.currentUserInfo.id) {
        this.setData({
          currentUser: item.userType === 1 ? 'banker' : 'player'
        })
      }
      if (item.state === 2 && item.userType === 2) {

      }
      // if (item.userType === 1) {
      //   flag = true
      //   console.log(1111);
      //   this.data.players.splice(7, 1, item)

      // }
      // if (item.userType === 2) {
      //   if (flag) {
      //     this.data.players.splice(index - 1, 1, item)
      //   } else {
      //     this.data.players.splice(index, 1, item)
      //   }

      // }
    })
    this.setData({
      players: this.data.players
    })
  },
  sendMseeage<T>(params: T) {
    wx.sendSocketMessage({
      data: JSON.stringify(params), // 要发送的数据
      success: (res) => {
        console.log('消息发送成功:', res);
      },
      fail: (res) => {
        console.error('消息发送失败:', res);
      }
    });
  },
  initPlayers() {
    const players = [
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 0, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
      { avatar: defaultAvatarUrl, name: '空位置', score: 0, state: 1, status: 2, userId: 0, roomId: 0, userType: 2, },
    ]
    const pokes = this.getPokes()
    this.setData({ players, pokes })
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
        item.show = true
      }
      if (!item.show && item.show !== undefined) {
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
        if (item.show !== undefined) {
          item.show = true
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
  // 获取所有的扑克牌
  getPokes() {
    // if (this.data.isGaming) return
    let pokes: poke[] = []
    for (let index = 0; index < suit.length; index++) {
      for (let idx = 0; idx < 10; idx++) {
        pokes.push({
          suit: suit[index],
          number: idx + 1
        })
      }
    }
    return pokes
  },
  // 倒计时
  startCountdown: function () {
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
    this.setData({
      isReady: !this.data.isReady
    })
  },
  onPickerChange: function (e: { detail: { value: number } }) {
    this.setData({
      selectedValue: this.data.range[e.detail.value],
    });
  },
  async clearPokes() {
    this.data.players = this.data.players.map(item => {
      if (item.pokes) {
        item.pokes = []
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
    // this.clearPokes()
    // // if (this.data.isGaming) return
    // const realPlayers = this.data.players.filter(item => item.state === 2)
    // realPlayers.map((item, index) => {
    //   item.show = false
    //   for (let idx = 0; idx < 5; idx++) {
    //     if (this.data.pokes) {
    //       item.pokes && item.pokes.push(this.data.pokes[index + idx * realPlayers.length])
    //     }
    //   }
    //   if (item.pokes) {
    //     this.sortCards(item.pokes)
    //   }
    // })
    // let playerNumber: playerNumber[] = []
    // this.setData({ playerNumber: [] })
    // this.data.players.map(item => {
    //   if (item.pokes) {
    //     // console.log(this.isBoom(item.pokes));
    //     const flag = this.isSumMultipleOfTen(item.pokes, 2)
    //     let point: { number: number, suit: string } | number
    //     let maxCard: { number: number, suit: string }
    //     point = this.getPointNumber(flag, item.pokes)
    //     if (flag) {
    //       maxCard = this.getMaxCard(item.pokes)
    //       playerNumber.push({
    //         // 有牛，获取到最大值（牛几） 然后再获取到组成几点的最大的那张牌
    //         has: flag, number: point as number, id: item.userId, maxCard: maxCard as { number: number, suit: string, }, isBoth: this.isBothTen(item.pokes), isBoom: this.isBoom(item.pokes)
    //       })
    //     } else {
    //       playerNumber.push({
    //         // 没牛，获取到最大的那张牌
    //         has: flag, number: (point as { number: number, suit: string }).number, id: item.userId, maxCard: point as { number: number, suit: string }, isBoom: this.isBoom(item.pokes)
    //       })
    //     }
    //   }
    // })
    // this.setData({ players: this.data.players, playerNumber, isGaming: true })
    // this.startCountdown()
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
    // const pokes = this.shuffleArray(this.data.pokes)
    // this.setData({ pokes })
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