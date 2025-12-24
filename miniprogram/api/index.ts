import request from "../utils/request";

export async function login(data: {
  code: string,
  name: string,
  avatar: string,
}) {
  return await request({
    url: '/api/wx/user/login',
    data,
    method: 'POST'
  })
}

export async function createRoom(data: {
  userId: number,
  roomType: 2 | 1,
}) {
  return await request({
    url: '/poker/createRoom',
    data,
    method: 'POST'
  })
}

export async function joinRoom(data: {
  userId: number,
  roomNumber: string,
}) {
  return await request({
    url: '/poker/joinRoom',
    data,
    method: 'POST'
  })
}

export async function getRoomInfo(data: {
  roomId: number,
}) {
  return await request({
    url: '/poker/getRoomInfo',
    data,
    method: 'POST'
  })
}
export async function assAssistant(data: {
  roomId: number,
  seatIndex: number
}) {
  return await request({
    url: '/poker/assAssistant',
    data,
    method: 'POST'
  })
}
export async function startGame(data: {
  roomId: number,
  userId: number,
}) {
  return await request({
    url: '/poker/startGame',
    data,
    method: 'POST'
  })
}

export async function gameAction(data: {
  gameId: string,
  userId: number,
  action: string,
  round?: number,
}) {
  return await request({
    url: '/poker/gameAction',
    data,
    method: 'POST'
  })
}

export async function exitRoom(data: {
  roomId: number,
  userId: number,
}) {
  return await request({
    url: '/poker/exitRoom',
    data,
    method: 'POST'
  })
}