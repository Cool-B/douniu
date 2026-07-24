// api/index.ts - API 调用层（无 async/await，避开 babel runtime）
import { player } from "../utils/localStorage";
import request from "../utils/request";

export function login(data: { code: string, name: string, avatar: string }) {
  return request({
    url: '/api/wx/user/login',
    data: data,
    method: 'POST'
  });
}

export function createRoom(data: { userId: number, roomType: 2 | 1 }) {
  return request({
    url: '/poker/createRoom',
    data: data,
    method: 'POST'
  });
}

export function joinRoom(data: { userId: number, roomNumber: string }) {
  return request({
    url: '/poker/joinRoom',
    data: data,
    method: 'POST'
  });
}

export function getRoomInfo(data: { roomId: number }) {
  return request({
    url: '/poker/getRoomInfo',
    data: data,
    method: 'POST'
  });
}

export function addAssistantOrChangeSeat(data: {
  roomId: number,
  userId: number,
  seatIndex: number,
  isBanker: boolean
}) {
  return request({
    url: '/poker/addAssistantOrChangeSeat',
    data: data,
    method: 'POST'
  });
}

export function startGame(data: { roomId: number, userId: number }) {
  return request({
    url: '/poker/startGame',
    data: data,
    method: 'POST'
  });
}

export function gameAction(data: {
  gameId: string,
  userId: number,
  action: string,
  round?: number,
}) {
  return request({
    url: '/poker/gameAction',
    data: data,
    method: 'POST'
  });
}

export function exitRoom(data: { roomId: number, userId: number }) {
  return request({
    url: '/poker/exitRoom',
    data: data,
    method: 'POST'
  });
}

// 玩家准备/取消准备
export function playerReady(data: { roomId: number, userId: number, status: 1 | 2 }) {
  return request({
    url: '/poker/playerReady',
    data: data,
    method: 'POST'
  });
}

// 踢出玩家（庄家权限）
export function kickPlayer(data: { roomId: number, userId: number, player: player }) {
  return request({
    url: '/poker/kickPlayer',
    data: data,
    method: 'POST'
  });
}

// 下注
export function changeBet(data: { roomId: number, userId: number, bet: number }) {
  return request({
    url: '/poker/changeBet',
    data: data,
    method: 'POST'
  });
}
