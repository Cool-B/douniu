import request from "../utils/request";

export async function login(data: {
  code: string,
  name: string,
  avatar: string,
}) {
  return await request({
    // url: 'https://cow.lyjiubei.cn/api/wx/user/login',
    url: 'http://xpymak.natappfree.cc/api/wx/user/login',
    data,
    method:'POST'
  })
}
export async function createRoom(data: {
  userId: number,
  roomType: 2 | 1,
}) {
  return await request({
    url: 'http://xpymak.natappfree.cc/poker/createRoom',
    data,
    method: 'POST'
  })
}
// http://e28fwq.natappfree.cc/poker/webSocketServer/save