import { poke } from "../pages/card_game/card_game";

export interface userInfo {
  avatar: string
  id: number
  name: string
  openid: string
  phone: null
  sex: null
  token: string
  username: string
}

export interface roomInfo {
  roomId: number,
  roomNumber: number,
  creatorId: number
  // 当前所有的玩家信息
  players: player[],
  // 这个房间是否正在游戏中
  isGaming: boolean,
  // 是否开始本局游戏
  isStart: boolean,
  // 是否开始发牌
  isStartDeal: boolean,
  // 是否完成发牌
  isDealComplete: boolean
}
export interface player {
  name: string
  avatar: string
  bet?: number,
  lookHand?: boolean
  showOther?: boolean
  pokers: poke[],
  // 积分
  score: number,
  // 1.正常2.退出房间/被踢出房间3.离线   
  state: number,
  // 1.待准备2.已准备
  status: number,
  userId: number,
  roomId: number,
  userType: number,
  pokeData: PokeData
}
export interface PokeData {
  // 是否是炸弹
  isBoom: boolean,
  // 是否有牛
  hasNiu: boolean,
  // 是否是牛双十
  isDoubleTen: boolean,
  // 点数   不管有牛没有牛  最大的点数
  pointNumber: number,
  // 点数里面最大的牌面
  maxNumber: number,
  // 最大牌面花色
  suit: 'Spade' | 'Heart' | 'Club' | 'Diamond' | ''
}
export function setUserInfo(userInfo: userInfo) {
  wx.setStorageSync('setUserInfo', JSON.stringify(userInfo));
}
export function getUserInfo(): userInfo | '' {
  try {
    const userInfoStr = wx.getStorageSync('setUserInfo');
    if (!userInfoStr) return '';
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('解析用户信息失败:', error);
    // 清除损坏的数据
    wx.removeStorageSync('setUserInfo');
    return '';
  }
}
export function removeUserInfo() {
  wx.removeStorageSync('setUserInfo');
}

export function setRoomInfo(roomInfo: roomInfo) {
  const localRoomInfo = getRoomInfo()
  const roomIndex = localRoomInfo.findIndex(room => room.roomId === roomInfo.roomId);
  if (roomIndex !== -1) {
    // 存在则替换（使用扩展运算符保持响应性）
    localRoomInfo.splice(roomIndex, 1, { ...roomInfo });
  } else {
    // 不存在则添加
    localRoomInfo.push({ ...roomInfo });
  }
  wx.setStorageSync('roomInfo', JSON.stringify(localRoomInfo));
}
export function getRoomInfo(): roomInfo[] {
  if (!wx.getStorageSync('roomInfo')) return []
  return JSON.parse(wx.getStorageSync('roomInfo'));
}
export function removeRoomInfo() {
  wx.removeStorageSync('roomInfo');
}

export function removeAll(roomId?: number) {
  if (roomId) {
    const localRoomInfo = getRoomInfo()
    const roomIndex = localRoomInfo.findIndex(room => room.roomId === roomId);
    if (roomIndex !== -1) {
      localRoomInfo.splice(roomIndex, 1,);
    }
    return wx.setStorageSync('roomInfo', JSON.stringify(localRoomInfo));
  }
  wx.clearStorageSync();
}