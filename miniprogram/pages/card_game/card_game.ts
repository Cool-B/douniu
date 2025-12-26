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
interface playerNumber { has: boolean, number: number, id: number, maxNumber?: { number: number, suit: string }, isBoth?: boolean, isBoom: boolean }

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
      creatorId: 0,
      isStartDeal: false,
      isDealComplete: false
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
    isAllShow: false,
  },
  showLoading(title?: string, mask?: boolean) {
    wx.showLoading({
      title: title ? title + '...' : '加载中...',
      mask: mask === undefined ? true : mask, // 是否显示透明蒙层，防止触摸穿透，默认：false
    });
  },
  hideLoading() {
    wx.hideLoading()
  },
  onLoad() {
    // 显示全屏loading
    this.showLoading()
    const roomInfo = getRoomInfo();
    const currentUserInfo = getUserInfo() as userInfo
    if (roomInfo) {
      roomInfo.forEach(info => {
        const flag = info.players.some(item => item && item.userId === currentUserInfo.id)
        if (flag) {
          this.setData({
            roomInfo: info
          }, () => {
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
  // 新增机器人玩家
  assAssistant(event: { currentTarget: { dataset: { item: any; index: any; }; }; }) {
    const { item, index } = event.currentTarget.dataset;
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
  // 开始游戏
  startGame() {
    // this.showLoading('正在准备中')
    this.shufflePoke()
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        isStart: true,
      }
    })
    // const params = {
    //   type: 3,
    //   roomId: this.data.roomInfo.roomId,
    //   uid: this.data.currentUserInfo.id,
    // }
    // this.sendMseeage(params)
  },
  // 先生成扑克牌，再洗牌
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
  // 
  shuffleArray() {
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
  // 发牌 - 延迟发牌效果   暂时设置为1ms
  dealCards() {
    this.showLoading('发牌中')
    const roomInfo = this.data.roomInfo
    this.setData({
      roomInfo: {
        ...roomInfo,
        isStartDeal: true,
      }
    })
    const pokers = [...this.data.pokers]
    const players = roomInfo.players.filter(player =>
      (player.status === 2 || player.userType === 1) && player.pokers.length !== 5
    )
    if (players.length === 0) {
      this.hideLoading()
      return
    }
    let currentPlayerIndex = 0
    // 发牌动画函数
    const dealNextCard = () => {
      const currentPlayer = players[currentPlayerIndex]
      if (currentPlayer.pokers.length < 5 && pokers.length > 0) {
        // 延迟显示卡片
        setTimeout(() => {
          currentPlayer.pokers.push(pokers[0])
          pokers.splice(0, 1)
          this.setData({
            roomInfo: roomInfo,
            pokers,
          })
          // 移动到下一个玩家
          currentPlayerIndex = (currentPlayerIndex + 1) % players.length
          // 继续发下一张牌
          setTimeout(dealNextCard, 300)
        }, 1)
      } else {
        this.setData({
          roomInfo: {
            ...roomInfo,
            isStartDeal: false,
            isDealComplete: true,
          }
        }, () => {
          this.hideLoading()
          this.gettlementCurrent()
        })
      }
    }
    // 开始发牌
    setTimeout(() => {
      dealNextCard()
    }, 1)
  },
  // 结算本局数据  数据回显
  settlementCurrent() {
    this.shufflePoke()
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
  // 修改准备状态
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
  // 修改下注
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
  /**
   * 获取结算数据
   * @param cards 
   */
  gettlementCurrent() {
    const players = this.data.roomInfo.players
    players.map((player: player) => {
      const { pokers, status, userId, userType, pokeData } = player
      if (pokers.length && (status === 2 || userType === 1) && userId) {
        const isBoom = this.isBoom(pokers)
        pokeData.isBoom = isBoom
        const { hasNiu, isDoubleTen, pointNumber, maxNumber, suit } = this.getMaxPoint(pokers)
        pokeData.hasNiu = hasNiu
        pokeData.isDoubleTen = isDoubleTen
        pokeData.pointNumber = pointNumber
        pokeData.maxNumber = maxNumber
        pokeData.suit = suit
      }
      return player
    })
    this.setData({
      roomInfo: this.data.roomInfo
    })
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
  // 检查任意三张牌的点数之和是否为 10 的倍数，并返回相关数据
  getMaxPoint(cards: { number: number; suit: string }[]): {
    hasNiu: boolean;
    isDoubleTen: boolean;
    pointNumber: number;   //hasNiu,pointNumber,maxNumber,suit
    maxNumber: number;  // 只返回数字
    suit: string;
  } {
    if (!cards || cards.length < 3) {
      return {
        hasNiu: false,
        isDoubleTen: true,
        pointNumber: 0,
        maxNumber: cards[0].number,
        suit: cards?.[0]?.suit
      };
    }
    // 花色权重
    const suitWeights: Record<string, number> = {
      'Spade': 4,
      'Heart': 3,
      'Club': 2,
      'Diamond': 1
    };
    // 辅助函数：比较两张牌的大小
    const compareCards = (a: { number: number, suit: string }, b: { number: number, suit: string }) => {
      if (a.number !== b.number) return b.number - a.number;
      return suitWeights[b.suit] - suitWeights[a.suit];
    };
    // 先排序，方便后续处理
    const sortedCards = [...cards].sort(compareCards);
    let bestResult: {
      pointNumber: number;
      maxCardNumber: number;
      suit: string;
    } | null = null;
    // 查找所有三张牌和为10的组合
    for (let i = 0; i < sortedCards.length - 2; i++) {
      for (let j = i + 1; j < sortedCards.length - 1; j++) {
        for (let k = j + 1; k < sortedCards.length; k++) {
          const sum = sortedCards[i].number + sortedCards[j].number + sortedCards[k].number;
          if (sum % 10 === 0) {
            // 找到三张牌和为10，计算剩余两张牌
            const remainingCards = sortedCards.filter(
              (_, index) => index !== i && index !== j && index !== k
            );
            // 计算剩余两张牌和的个位数
            const pointNumber = (remainingCards[0].number + remainingCards[1].number) % 10;
            // 找出剩余两张牌中最大的(已排序，第一张就是最大的)
            const maxCardNumber = remainingCards[0].number;
            const suit = remainingCards[0].suit;
            // 选择最优结果：优先比较remainingSum，再比较maxCardNumber
            if (!bestResult ||
              pointNumber > bestResult.pointNumber ||
              (pointNumber === bestResult.pointNumber &&
                maxCardNumber > bestResult.maxCardNumber)) {
              bestResult = {
                pointNumber,
                maxCardNumber,
                suit
              };
            }
          }
        }
      }
    }
    if (bestResult) {
      return {
        hasNiu: true,
        isDoubleTen: bestResult.pointNumber === 10 && bestResult.pointNumber === 10,
        pointNumber: bestResult.pointNumber,
        maxNumber: bestResult.maxCardNumber,
        suit: bestResult.suit
      };
    }
    // 没有找到三张牌和为10的组合，返回五张牌中最大的
    return {
      hasNiu: false,
      isDoubleTen: false,
      pointNumber: 0,
      maxNumber: sortedCards[0].number,
      suit: sortedCards[0].suit
    };
  },
  // 退出房间
  goToHome() {
    this.showLoading('正在退出')
    wx.redirectTo({
      url: '../index/index'
    });
    removeAll(this.data.roomInfo.roomId)
  },
  isCanReady() {
    return this.data.selectedValue
  },
  get isAllPlayersReady() {
    return this.data.roomInfo.players.every((player: { ready: any; role: string }) => player.ready || player.role === 'banker')
  },
})