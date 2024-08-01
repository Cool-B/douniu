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
export function setUserInfo(userInfo: userInfo) {
  wx.setStorageSync('setUserInfo', JSON.stringify(userInfo));
}
export function getUserInfo():userInfo|''{
  if (!wx.getStorageSync('setUserInfo')) return ''
  return JSON.parse(wx.getStorageSync('setUserInfo'));
}
export function removeUserInfo() {
  wx.removeStorageSync('setUserInfo');
}
export function removeAll() {
  wx.clearStorageSync();
}