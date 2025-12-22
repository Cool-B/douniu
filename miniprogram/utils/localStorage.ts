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
  roomId: number
  roomNumber: number
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
  wx.setStorageSync('roomInfo', JSON.stringify(roomInfo));
}
export function getRoomInfo(): roomInfo | '' {
  if (!wx.getStorageSync('roomInfo')) return ''
  return JSON.parse(wx.getStorageSync('roomInfo'));
}
export function removeRoomInfo() {
  wx.removeStorageSync('roomInfo');
}

export function removeAll() {
  wx.clearStorageSync();
}