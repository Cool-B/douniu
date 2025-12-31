import { player } from "../utils/localStorage";
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
export async function addAssistantOrChangeSeat(data: {
  roomId: number,
  userId: number,
  seatIndex: number,
  isBanker: boolean
}) {
  return await request({
    url: '/poker/addAssistantOrChangeSeat',
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

// 玩家准备/取消准备
export async function playerReady(data: {
  roomId: number,
  userId: number,
  status: 1 | 2,  // 1取消准备 2确认准备
}) {
  return await request({
    url: '/poker/playerReady',
    data,
    method: 'POST'
  })
}

// 踢出玩家（庄家权限）
export async function kickPlayer(data: {
  roomId: number,
  userId: number,
  player: player,
}) {
  return await request({
    url: '/poker/kickPlayer',
    data,
    method: 'POST'
  })
}
// 下注
export async function changeBet(data: {
  roomId: number,
  userId: number,
  bet: number
}) {
  return await request({
    url: '/poker/changeBet',
    data,
    method: 'POST'
  })
}