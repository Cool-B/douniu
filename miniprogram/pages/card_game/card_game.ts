// import { IAppOption } from "../../../typings/index"
// import { baseUrl } from "../../utils/request"
import { assAssistant } from "../../api/index";
import { getUserInfo, roomInfo, setRoomInfo, userInfo, player, getRoomInfo, removeAll } from "../../utils/localStorage"
import { uniqueObjectArray } from "../../utils/util"
// import request from "../../utils/request"
interface data {
  roomInfo: roomInfo,
  // 当前玩家信息
  currentUserInfo: userInfo,
  session: string,
  pokers: poke[],
  range: number[],
  playerNumber: playerNumber[],
  selectedValue: number,
  isReady: boolean,
  currentUser: 'banker' | 'player',
  isAllShow: boolean,
  modalVisible: boolean,
  modalData: string,
}
interface playerNumber { has: boolean, number: number, id: number, maxCard?: { number: number, suit: string }, isBoth?: boolean, isBoom: boolean }

export interface poke {
  suit: string,
  number: number,
  url?: string
}
//     方块     梅花        红桃     黑桃 
const suits = ['Spade', 'Heart', 'Club', 'Diamond',]
Page<data, Record<string, any>>({
  data: {
    roomInfo: {
      roomId: 0,
      roomNumber: 0,
      isGaming: false,
      players: [],
      isStart: false,
      creatorId: 0
    },
    session: '',
    // 当前登录人的身份信息
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
    // 当前登录用户的身份  闲家  /   庄家
    currentUser: 'banker',
    modalVisible: false, // 弹窗是否显示
    modalData: '',// 要传递的数据
    playerNumber: [],
    pokers: [],
    range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    // 当前用户的下注大小
    selectedValue: 0,
    isReady: false,
    isAllShow: false
  },
  showLoading(title?: string, mask?: boolean) {
    wx.showLoading({
      title: title ? title + '...' : '加载中...',
      mask: mask === undefined ? true : mask, // 是否显示透明蒙层，防止触摸穿透，默认：false
    });
  },
  hideLoading() {
    console.log(1);

    wx.hideLoading()
    console.log(1);
  },
  onLoad() {
    // 显示全屏loading
    this.showLoading()
    const roomInfo = getRoomInfo();
    const currentUserInfo = getUserInfo() as userInfo
    console.log(roomInfo);
    if (roomInfo) {
      roomInfo.forEach(info => {
        const flag = info.players.some(item => item && item.userId === currentUserInfo.id)
        if (flag) {
          this.setData({
            roomInfo: info
          }, () => {
            console.log(roomInfo);

            wx.hideLoading();
          })
        }
      })
    }
    this.setData({
      currentUserInfo
    }, () => {
      wx.hideLoading();
      // 1.创建房间进来的时候，当前用户就是房主，并且只有当前用户
    })
    // websocket暂时注释
    // wx.connectSocket({
    //   url: 'ws://' + 'b89669be.natappfree.cc' + '/ws/asset', // 你的 WebSocket 服务器地址
    // });
    // // 监听 WebSocket 连接打开事件
    // wx.onSocketOpen((res) => {
    //   console.log('WebSocket 已连接:', res);
    // });
    // 监听 WebSocket 接收到服务器的消息事件
    // wx.onSocketMessage((res) => {
    //   wx.hideLoading()
    //   if (res.data) {
    //     if ((res.data as string).includes('type')) {
    //       const data = JSON.parse(res.data as string)
    //       // 存储用户信息
    //       if (data.type === 1) {
    //         this.updateUserInfoResList(data.userInfoResList)
    //         return
    //       }
    //       // 修改用户信息
    //       if (data.type === 2) {
    //         this.updateUserInfoResList(data.userInfoResList)
    //         return
    //       }
    //       // 开始游戏
    //       if (data.type === 3) {
    //         this.setData({
    //           isStart: true
    //         })
    //         return
    //       }
    //       // 洗牌
    //       if (data.type === 4) {
    //         console.log('洗牌');
    //         return
    //       }
    //       // 发牌
    //       if (data.type === 5) {
    //         // this.updateUserInfoResList(data.userInfoResList)
    //         this.data.players.map(item => {
    //           if (item.userId === data.userId) {
    //             item.pokers = data.pokers
    //             return item
    //           }
    //           item.pokers = ['../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png', '../../assets/poke/Poker/Background.png']
    //           return item
    //         })
    //         this.setData({
    //           isGaming: true,
    //           players: this.data.players
    //         })
    //         return
    //       }
    //     }
    //     this.setData({
    //       session: res.data as string
    //     })
    //     const params = {
    //       type: 1,
    //       uid: this.data.currentUserInfo.id,
    //       sessionId: this.data.session,
    //       roomId: this.data.roomId
    //     }
    //     this.sendMseeage(params)
    //   }
    // });

  },

  /**
   * 更新玩家列表信息
   */
  // updateUserInfoResList(userInfoResList: player[]) {
  //   userInfoResList.map((item: player,) => {
  //     if (item.userId === this.data.currentUserInfo.id) {
  //       this.data.roomInfo.players[7] = item
  //       this.setData({
  //         currentUser: item.userType === 1 ? 'banker' : 'player',
  //         isReady: item.status === 1 ? false : true
  //       })
  //     }
  //   })
  //   this.setData({
  //     roomInfo: this.data.roomInfo
  //   }, () => {
  //     setRoomInfo(this.data.roomInfo);
  //   })
  // },
  startGame() {
    // this.showLoading('正在准备中')
    this.shufflePoke()
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        isStart: true
      }
    })
    // const params = {
    //   type: 3,
    //   roomId: this.data.roomInfo.roomId,
    //   uid: this.data.currentUserInfo.id,
    // }
    // this.sendMseeage(params)
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
    const players = this.data.roomInfo.players.map((item, idx) => {
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
      roomInfo: {
        ...this.data.roomInfo,
        players,
      },
      isAllShow: !flag
    }, () => {
      setRoomInfo(this.data.roomInfo);
    })
  },
  // 所有玩家亮牌
  playersShowPoker() {
    this.setData({
      isGaming: false,
      isAllShow: false,
      players: this.data.roomInfo.players.map(item => {
        if (item.lookHand !== undefined) {
          item.lookHand = true
        }
        return item
      })
    })
  },
  // 结算本局数据
  settlementCurrent() {
    this.shufflePoke()
  },

  changeReady() {
    if (this.data.roomInfo.isGaming) return
    const { roomId, status, state } = this.data.roomInfo.players.find(item => item.userId === this.data.currentUserInfo.id) as player
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
    this.data.roomInfo.players = this.data.roomInfo.players.map(item => {
      if (item.pokers) {
        item.pokers = []
      }
      return item
    })
    this.setData({
      roomInfo: this.data.roomInfo
    }, () => {
      setRoomInfo(this.data.roomInfo);
    })
  },
  // 发牌
  dealCards() {
    this.showLoading('发牌中')
    // const params = {
    //   type: 5,
    //   roomId: this.data.roomInfo.roomId,
    //   uid: this.data.currentUserInfo.id,
    // }
    // this.sendMseeage(params)
    // const playerCount = this.data.roomInfo.players.filter(info => info.status === 2 || info.userType === 1)

    const pokers = this.data.pokers
    const rounds = 5
    for (let round = 0; round < rounds; round++) {
      this.data.roomInfo.players.map(player => {
        if ((player.status === 2 || player.userType === 1) && player.pokers.length !== 5) {
          player.pokers.push(pokers[0])
          pokers.splice(0, 1)
        }
        return player
      })
      this.setData({
        roomInfo: this.data.roomInfo,
        pokers
      })
    }
    this.hideLoading()
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
      return suits.indexOf(card1.suit) - suits.indexOf(card2.suit);
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
    // const params = {
    //   type: 4,
    //   roomId: this.data.roomInfo.roomId,
    //   uid: this.data.currentUserInfo.id,
    // }
    // this.sendMseeage(params)
    // this.clearPokes()
    // // if (this.data.isGaming) return
    // if (event) {
    //   wx.showToast({
    //     title: '洗牌中',
    //     icon: 'loading',
    //     duration: 2000, // 持续时间，单位毫秒
    //   });
    // }
    const pokers = this.shuffleArray()
    this.setData({ pokers })
    this.hideLoading()
  },
  shuffleArray<T>(array: T[]) {
    const cards = [];

    // 生成牌
    for (let number = 1; number <= 10; number++) {
      for (let suit of suits) {
        cards.push({
          id: `${number}${suit}`,
          number,
          suit,
          display: `${number}${suit}`,
          value: number,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black'
        });
      }
    }

    // 洗牌算法 (Fisher-Yates shuffle)
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
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
  /**/
  goToHome() {
    this.showLoading('正在退出')
    wx.redirectTo({
      url: '../index/index'
    });
    removeAll(this.data.roomInfo.roomId)
  },
  assAssistant(event: { currentTarget: { dataset: { item: any; index: any; }; }; }) {
    const { item, index } = event.currentTarget.dataset;
    console.log(item, index);

    assAssistant({ roomId: item.roomId, seatIndex: index }).then(res => {
      if (res.code === 200) {
        const { roomInfo } = res.data
        this.setData({
          roomInfo
        }, () => {
          setRoomInfo(roomInfo);
        })
      }
    })
  },
  isCanReady() {
    return this.data.selectedValue
  },
  get isAllPlayersReady() {
    return this.data.roomInfo.players.every((player: { ready: any; role: string }) => player.ready || player.role === 'banker')
  },
})