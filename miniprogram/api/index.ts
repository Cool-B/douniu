import request from "../utils/request";

export const baseUrl = '3dgmrp.natappfree.cc'
export async function login(data: {
  code: string,
  name: string,
  avatar: string,
}) {

  return await request({
    // url: 'https://cow.lyjiubei.cn/api/wx/user/login',
    url: 'http://' + baseUrl + '/api/wx/user/login',
    data,
    method: 'POST'
  })
}
export async function createRoom(data: {
  userId: number,
  roomType: 2 | 1,
}) {
  return await request({
    url: 'http://' + baseUrl + '/poker/createRoom',
    data,
    method: 'POST'
  })
}
// http://e28fwq.natappfree.cc/poker/webSocketServer/save

export async function joinRoom(data: {
  userId: number,
  roomNumber: string,
}) {
  return await request({
    url: 'http://' + baseUrl + '/poker/joinRoom',
    data,
    method: 'POST'
  })
}