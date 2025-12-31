// import { IAppOption } from "../../../typings/index"
// import { baseUrl } from "../../utils/request"
import { addAssistantOrChangeSeat, changeBet, exitRoom, kickPlayer, playerReady } from "../../api/index";
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
  currentPlayerStatus: number,  // 当前玩家的准备状态（1=未准备，2=已准备）
  isAllShow: boolean,
  modalVisible: boolean,
  modalData: string,
  canStartGame: boolean,
  currentPlayerBet: number
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
      isDealComplete: false,
    },
    session: '',
    currentPlayerBet: 1,
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
    currentPlayerStatus: 1,  // 当前玩家的准备状态，默认1=未准备
    isAllShow: false,
    canStartGame: false,
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
          const currentPlayer = info.players.find(item => item && item.userId === currentUserInfo.id)
          if (!currentPlayer) return
          const currentUser = currentPlayer.userType === 1 ? 'banker' : 'player'
          const currentPlayerStatus = currentPlayer.status || 1  // 获取当前玩家的准备状态
          this.setData({
            roomInfo: info,
            canStartGame: this.checkCanStartGame(info),
            currentUser,
            currentPlayerStatus,  // 设置当前玩家状态
            currentPlayerBet: currentPlayer.bet
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
  // 新增机器人玩家或换座位
  addAssistantOrChangeSeat(event: { currentTarget: { dataset: { index: any; }; }; }) {
    const { index } = event.currentTarget.dataset;
    const roomId = this.data.roomInfo.roomId;
    const userId = this.data.currentUserInfo.id;
    const currentUser = this.data.currentUser;

    if (!roomId) {
      wx.showToast({
        title: '房间信息错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 根据当前用户身份显示不同的加载提示
    this.showLoading(currentUser === 'banker' ? '正在添加机器人' : '正在换位置');

    addAssistantOrChangeSeat({
      roomId,
      userId,
      seatIndex: index,
      isBanker: currentUser === 'banker'
    }).then(res => {
      this.hideLoading();
      if (res.code === 200) {
        const { roomInfo } = res.data;

        // 确保机器人默认为已准备状态
        roomInfo.players.forEach((player: player) => {
          if (player.userType === 3) { // 3是机器人
            player.status = 2; // 2是已准备
          }
        });

        // 更新当前玩家状态（换座位后可能需要更新）
        const currentPlayer = roomInfo.players.find(
          (p: player) => p.userId === this.data.currentUserInfo.id
        );
        const currentPlayerStatus = currentPlayer && currentPlayer.status || 1;

        this.setData({
          roomInfo,
          currentPlayerStatus,
          canStartGame: this.checkCanStartGame(roomInfo)
        }, () => {
          setRoomInfo(roomInfo);
          wx.showToast({
            title: res.msg || (currentUser === 'banker' ? '添加成功' : '换座成功'),
            icon: 'success',
            duration: 1500
          });
        });
      } else {
        wx.showToast({
          title: res.msg || '操作失败',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(err => {
      this.hideLoading();
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 2000
      });
    });
  },
  // 踢出玩家（仅庄家可用）
  kickPlayer(event: { currentTarget: { dataset: { index: number } } }) {
    const index = event.currentTarget.dataset.index;
    const player = this.data.roomInfo.players[index];

    // 验证是否是庄家
    if (this.data.currentUser !== 'banker') {
      wx.showToast({
        title: '只有庄家可以踢出玩家',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 不能踢出庄家自己
    if (player.userType === 1) {
      wx.showToast({
        title: '不能踢出庄家',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 游戏中不能踢人
    if (this.data.roomInfo.isStart) {
      wx.showToast({
        title: '游戏进行中不能踢出玩家',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showModal({
      title: '提示',
      content: `确定要踢出玩家 ${player.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performKick(player);
        }
      }
    });
  },

  // 执行踢出操作
  performKick(player: player) {
    this.showLoading('正在踢出玩家');
    kickPlayer({
      roomId: this.data.roomInfo.roomId,
      userId: this.data.currentUserInfo.id,
      player
    }).then(res => {
      this.hideLoading();
      if (res.code === 200) {
        // 如果后端返回了新的房间信息，使用它
        if (res.data && res.data.roomInfo) {
          this.setData({
            roomInfo: res.data.roomInfo,
            canStartGame: this.checkCanStartGame(res.data.roomInfo)
          }, () => {
            setRoomInfo(res.data.roomInfo);
            wx.showToast({
              title: '踢出成功',
              icon: 'success',
              duration: 1500
            });
          });
        } else {
          // 否则在本地移除玩家
          const updatedPlayers = this.data.roomInfo.players.map((p) => {
            if (p.userId === player.userId) {
              // 将玩家位置重置为空位（userType: 4）
              return {
                ...p,
                userId: 0,
                name: '',
                avatar: '',
                status: 1,
                userType: 4,
                pokers: [],
                bet: 1,
                score: 0
              };
            }
            return p;
          });

          const updatedRoomInfo = {
            ...this.data.roomInfo,
            players: updatedPlayers
          };

          this.setData({
            roomInfo: updatedRoomInfo,
            canStartGame: this.checkCanStartGame(updatedRoomInfo)
          }, () => {
            setRoomInfo(updatedRoomInfo);
            wx.showToast({
              title: '踢出成功',
              icon: 'success',
              duration: 1500
            });
          });
        }
      } else {
        wx.showToast({
          title: res.msg || '踢出失败',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(err => {
      this.hideLoading();
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 2000
      });
    });
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
    // 验证是否是庄家
    if (this.data.currentUser !== 'banker') {
      wx.showToast({
        title: '只有庄家可以结算',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 验证游戏是否已发牌完成
    if (!this.data.roomInfo.isDealComplete) {
      wx.showToast({
        title: '请先发牌',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    this.showLoading('正在结算');
    // 获取所有参与游戏的玩家（已准备的闲家和庄家）
    const gamePlayers = this.data.roomInfo.players.filter(
      (player: player) => player.userId && (player.status === 2 || player.userType === 1)
    );

    // 找到庄家
    const banker = gamePlayers.find((player: player) => player.userType === 1);
    if (!banker) {
      this.hideLoading();
      wx.showToast({
        title: '未找到庄家',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const maxBoomPlayer = this.data.roomInfo.players.filter(player => player.pokeData.isBoom).sort((playerX, playerY) => playerY.pokeData.maxNumber - playerX.pokeData.maxNumber)[0]
    if (maxBoomPlayer) {
      if (maxBoomPlayer.userType === 1) {
        this.data.roomInfo.players.map(item => {
          if (maxBoomPlayer.userId !== item.userId) {
            maxBoomPlayer.score += maxBoomPlayer.score + item.bet * 6
            item.score -= item.score + item.bet
          }
        })
      } else {
        maxBoomPlayer.score += maxBoomPlayer.score + maxBoomPlayer.bet * 6 * (gamePlayers.length - 1)
      }
      return
    }
    // 找到所有闲家（包括机器人）
    const normalPlayers = gamePlayers.filter((player: player) => player.userType === 2 || player.userType === 3);
    // 初始化所有玩家的结算结果
    this.data.roomInfo.players.forEach((player: player) => {
      player.settlementResult = undefined;
    });
    let bankerTotalChange = 0;
    // ========== 第一步：炸弹结算 ==========
    // 收集所有有炸弹的玩家
    // ========== 第二步：正常比大小 ==========
    // 没有炸弹，庄家与每个闲家逐一比大小
    normalPlayers.forEach((player: player) => {
      const compareResult = this.compareTwoPlayers(banker, player);
      const baseAmount = player.bet || 1;
      let multiplier = 1;
      console.log(compareResult);

      if (compareResult > 0) {
        // 庄家赢，根据庄家牌型计算倍率
        const result = this.getMultiplierAndReason(banker.pokeData);
        multiplier = result.multiplier;
        const amount = baseAmount * multiplier;
        banker.score += amount;
        player.score -= amount;
        bankerTotalChange += amount;
        player.settlementResult = {
          change: -amount,
        };
      } else {
        // 闲家赢，根据闲家牌型计算倍率
        const result = this.getMultiplierAndReason(player.pokeData);
        multiplier = result.multiplier;
        const amount = baseAmount * multiplier;
        banker.score -= amount;
        player.score += amount;
        bankerTotalChange -= amount;

        player.settlementResult = {
          change: amount,
        };
      }
    });

    // 设置庄家的结算结果
    banker.settlementResult = {
      change: bankerTotalChange,
    };

    // 完成结算
    this.finishSettlement();
  },

  /**
   * 根据牌型数据获取倍率和原因
   * @param pokeData 牌型数据
   * @param isBanker 是否是庄家
   */
  getMultiplierAndReason(pokeData: any,): { multiplier: number; } {
    // 牛双十：5倍
    if (pokeData.isDoubleTen) {
      return { multiplier: 5, };
    }
    if (pokeData.hasNiu && pokeData.pointNumber === 10) {
      return { multiplier: pokeData.pointNumber - 6 || 1, };
    }
    // 无牛：1倍
    return { multiplier: 1, };
  },

  /**
   * 完成结算，更新UI并设置定时器清除结算结果
   */
  finishSettlement() {
    this.setData({
      roomInfo: this.data.roomInfo
    }, () => {
      setRoomInfo(this.data.roomInfo);
      this.hideLoading();
      // 2秒后清除结算结果显示
      setTimeout(() => {
        this.clearSettlementResults();
      }, 3000);
    });
  },

  /**
   * 清除结算结果显示
   */
  clearSettlementResults() {
    this.data.roomInfo.players.forEach((player: player) => {
      player.settlementResult = undefined;
    });

    this.setData({
      roomInfo: this.data.roomInfo
    }, () => {
      // 再等1秒后重置游戏
      setTimeout(() => {
        this.resetGame();
      }, 3000);
    });
  },

  /**
   * 比较两个玩家的牌型大小
   * @param player1 玩家1
   * @param player2 玩家2
   * @returns >0 表示player1赢，<0 表示player2赢，0表示平局（实际不会出现）
   */
  compareTwoPlayers(player1: player, player2: player): number {
    const p1Data = player1.pokeData;
    const p2Data = player2.pokeData;
    // 2. 比较是否有牛
    if (p1Data.hasNiu && !p2Data.hasNiu) return 1;
    if (!p1Data.hasNiu && p2Data.hasNiu) return -1;
    // 3. 都有牛，比较点数
    if (p1Data.hasNiu && p2Data.hasNiu) {
      if (p1Data.pointNumber !== p2Data.pointNumber) {
        return p1Data.pointNumber - p2Data.pointNumber;
      }
      // 点数相同，比较最大牌
      if (p1Data.maxNumber !== p2Data.maxNumber) {
        return p1Data.maxNumber - p2Data.maxNumber;
      }
      // 牌面相同，比较花色
      return this.compareSuit(p1Data.suit, p2Data.suit);
    }
    // 4. 都没有牛，比较最大牌
    if (p1Data.maxNumber !== p2Data.maxNumber) {
      return p1Data.maxNumber - p2Data.maxNumber;
    }
    // 牌面相同，比较花色
    return this.compareSuit(p1Data.suit, p2Data.suit);
  },

  /**
   * 比较花色大小
   * 黑桃(Spade) > 红桃(Heart) > 梅花(Club) > 方块(Diamond)
   */
  compareSuit(suit1: string, suit2: string): number {
    const suitOrder: Record<string, number> = {
      'Spade': 4,
      'Heart': 3,
      'Club': 2,
      'Diamond': 1
    };
    return suitOrder[suit1] - suitOrder[suit2];
  },

  /**
   * 重置游戏状态
   */
  resetGame() {
    // 清空所有玩家的牌
    this.data.roomInfo.players.forEach((player: player) => {
      player.pokers = [];
      player.lookHand = undefined;
      // 庄家和机器人默认准备，真人闲家重置为未准备
      if (player.userType === 1 || player.userType === 3) {
        player.status = 2; // 庄家和机器人默认准备
      } else {
        player.status = 1; // 真人闲家未准备
      }
      player.bet = 1;
      player.settlementResult = undefined;
      player.pokeData = {
        isBoom: false,
        hasNiu: false,
        isDoubleTen: false,
        pointNumber: 0,
        maxNumber: 0,
        suit: ''
      };
    });
    // 重置游戏状态
    this.setData({
      roomInfo: {
        ...this.data.roomInfo,
        isStart: false,
        isStartDeal: false,
        isDealComplete: false
      },
      pokers: [],
      selectedValue: 0,
      isReady: false,
      canStartGame: this.checkCanStartGame({
        ...this.data.roomInfo,
        isStart: false,
        isStartDeal: false,
        isDealComplete: false
      })
    }, () => {
      setRoomInfo(this.data.roomInfo);
      wx.showToast({
        title: '准备下一局',
        icon: 'success',
        duration: 3000
      });
    });
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
  async changeReady() {
    // 检查游戏是否已开始
    if (this.data.roomInfo.isGaming) {
      wx.showToast({
        title: '游戏已开始',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 获取当前玩家信息
    const currentPlayer = this.data.roomInfo.players.find(
      p => p.userId === this.data.currentUserInfo.id
    );
    if (!currentPlayer) {
      wx.showToast({
        title: '玩家信息错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 获取当前状态并切换
    const currentStatus = currentPlayer.status;
    const newStatus = currentStatus === 1 ? 2 : 1;
    // 显示加载提示
    wx.showLoading({
      title: newStatus === 2 ? '准备中...' : '取消中...',
      mask: true
    });
    try {
      // 调用API改变状态
      const response = await playerReady({
        roomId: this.data.roomInfo.roomId,
        userId: this.data.currentUserInfo.id,
        status: newStatus as 1 | 2
      });
      wx.hideLoading();
      if (response.code === 200 && response.data) {
        // 更新本地房间信息
        const updatedRoomInfo = response.data.roomInfo;
        // 保存到本地存储
        setRoomInfo(updatedRoomInfo);
        // 更新页面数据
        console.log(updatedRoomInfo);

        this.setData({
          roomInfo: updatedRoomInfo,
          currentPlayerStatus: newStatus  // 同步更新当前玩家的准备状态
        });
        // 显示成功提示
        wx.showToast({
          title: newStatus === 2 ? '已准备' : '已取消准备',
          icon: 'success',
          duration: 1500
        });
        // TODO: 通过WebSocket通知其他玩家状态变化
        // this.sendMessage({
        //   type: 'playerReady',
        //   roomId: this.data.roomInfo.roomId,
        //   userId: this.data.currentUserInfo.id,
        //   status: newStatus,
        //   betAmount: betAmount
        // });
      } else {
        wx.showToast({
          title: '操作失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('changeReady error:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },
  // 修改下注（选择器变化后立即确认）
  async onBetChange(e: { detail: { value: number } }) {
    const newBetAmount = this.data.range[e.detail.value];
    // 检查游戏是否已开始
    if (this.data.roomInfo.isGaming) {
      wx.showToast({
        title: '游戏已开始',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 获取当前玩家信息
    const currentPlayer = this.data.roomInfo.players.find(
      p => p.userId === this.data.currentUserInfo.id
    );
    if (!currentPlayer) {
      wx.showToast({
        title: '玩家信息错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 检查是否是庄家
    if (currentPlayer.userType === 1) {
      wx.showToast({
        title: '庄家不能下注',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 检查是否已准备（已准备状态不允许更改下注）
    if (currentPlayer.status === 2) {
      wx.showToast({
        title: '已准备状态不能更改下注',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 检查是否有变化
    if (newBetAmount === currentPlayer.bet) {
      wx.showToast({
        title: '下注倍数未改变',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 显示加载提示
    wx.showLoading({
      title: '修改中...',
      mask: true
    });
    try {
      // 调用API改变下注
      const response = await changeBet({
        roomId: this.data.roomInfo.roomId,
        userId: this.data.currentUserInfo.id,
        bet: newBetAmount
      });
      wx.hideLoading();

      if (response.code === 200 && response.data) {
        // 更新本地房间信息
        const updatedRoomInfo = response.data.roomInfo;

        // 保存到本地存储
        setRoomInfo(updatedRoomInfo);

        // 更新页面数据
        this.setData({
          roomInfo: updatedRoomInfo,
          currentPlayerBet: newBetAmount,  // 同步更新当前玩家的下注倍数
          selectedValue: newBetAmount  // 同步选择器
        });

        // 显示成功提示
        wx.showToast({
          title: `下注已改为${newBetAmount}倍`,
          icon: 'success',
          duration: 1500
        });

      } else {
        wx.showToast({
          title: '操作失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('onBetChange error:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    }
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
        console.log(pokeData);

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
  compareCards(card1: poke, card2: poke): number {
    if (card1.number !== card2.number) {
      return card1.number - card2.number;
    } else {
      return suits.indexOf(card1.suit) - suits.indexOf(card2.suit);
    }
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
        suit: cards[0].suit
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
  async goToHome() {
    this.showLoading('正在退出')
    await exitRoom({ roomId: this.data.roomInfo.roomId, userId: this.data.currentUserInfo.id }).then(res => {
      const { roomInfo } = res.data
      if (res.code === 200) {
        // API已经处理了房主转让和房间解散的逻辑
        // roomInfo为null表示房间已解散
        if (!roomInfo) {
          // 房间已解散，清除本地存储
          removeAll(this.data.roomInfo.roomId)
        }
      }
    })
    wx.redirectTo({
      url: '../index/index'
    });
  },
  isCanReady() {
    return this.data.selectedValue
  },
  get isAllPlayersReady() {
    return this.data.roomInfo.players.every((player: { ready: any; role: string }) => player.ready || player.role === 'banker')
  },
  // 计算已准备的玩家数量（包括庄家）
  getReadyPlayerCount() {
    return this.data.roomInfo.players.filter(
      (player: player) => player.status === 2 || player.userType === 1
    ).length;
  },
  // 检查是否可以开始游戏（至少2个已准备的玩家）
  checkCanStartGame(roomInfo?: roomInfo) {
    const room = roomInfo || this.data.roomInfo;
    const readyCount = room.players.filter(
      (player: player) => player.status === 2 || player.userType === 1
    ).length;
    return readyCount >= 2;
  },

  // 更新房间信息并同步当前玩家状态
  updateRoomInfo(roomInfo: roomInfo) {
    const currentPlayer = roomInfo.players.find(
      p => p.userId === this.data.currentUserInfo.id
    );
    const currentPlayerStatus = currentPlayer && currentPlayer.status || 1;

    this.setData({
      roomInfo: roomInfo,
      currentPlayerStatus: currentPlayerStatus
    });
  }
})