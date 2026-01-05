# 任务清单：优化游戏房间操作方法

## 任务概述
本变更包含 6 个主要任务，按顺序执行以确保稳定性和可追溯性。

---

## Task 1: 优化 changeBet Mock API 方法
**优先级**: 高  
**预计时间**: 30 分钟  
**依赖**: 无

### 工作内容
1. 在 `utils/mockData.ts` 中完善 `changeBet` 方法
2. 添加完整的参数验证（roomId, userId, bet）
3. 添加业务规则验证：
   - 庄家不能下注
   - 已准备状态不能更改下注
   - 游戏已开始不能更改下注
   - 下注倍数必须是 1-10 之间的整数
   - 检查下注是否有变化
4. 实现数据更新和持久化（调用 setRoomInfo）
5. 添加详细的日志记录

### 验证标准
- [x] 参数验证覆盖所有必需字段
- [x] 所有业务规则验证正确触发
- [x] 错误场景返回明确的错误消息
- [x] 成功场景正确更新数据并保存
- [x] 日志记录完整清晰

### 相关文件
- `utils/mockData.ts`

---

## Task 2: 更新 addAssistantOrChangeSeat API 定义
**优先级**: 高  
**预计时间**: 10 分钟  
**依赖**: 无

### 工作内容
1. 在 `api/index.ts` 中更新 `addAssistantOrChangeSeat` 函数签名
2. 添加 `userId` 参数到接口定义
3. 更新 TypeScript 类型定义

### 验证标准
- [x] API 接口定义包含所有必需参数
- [x] TypeScript 类型检查通过
- [x] 参数顺序和命名符合约定

### 相关文件
- `api/index.ts`

---

## Task 3: 优化 addAssistantOrChangeSeat Mock API 方法
**优先级**: 高  
**预计时间**: 40 分钟  
**依赖**: Task 2

### 工作内容
1. 在 `utils/mockData.ts` 中重构 `addAssistantOrChangeSeat` 方法
2. 添加完整的参数验证（roomId, userId, seatIndex, isBanker）
3. 添加通用验证规则：
   - 游戏已开始不能操作
   - 目标座位必须是空位
   - 不能操作庄家位（第7位）
4. 实现庄家添加机器人逻辑：
   - 验证操作者是庄家
   - 生成机器人玩家信息
   - 设置机器人默认已准备状态
5. 实现玩家换座位逻辑：
   - 验证操作者是普通玩家
   - 验证玩家未准备状态
   - 执行座位交换
6. 实现数据持久化和日志记录

### 验证标准
- [x] 参数验证覆盖所有必需字段
- [x] 通用验证规则正确实施
- [x] 庄家添加机器人功能正常
- [x] 玩家换座位功能正常
- [x] 所有错误场景有明确提示
- [x] 数据正确保存到本地存储
- [x] 日志记录完整清晰

### 相关文件
- `utils/mockData.ts`

---

## Task 4: 更新前端 changeBet 调用逻辑
**优先级**: 中  
**预计时间**: 10 分钟  
**依赖**: Task 1

### 工作内容
1. 在 `pages/card_game/card_game.ts` 中验证 `handleBetChange` 方法
2. 确保传递正确的参数到 API
3. 优化错误处理和用户反馈
4. 确保 `currentPlayerBetAmount` 正确更新

### 验证标准
- [x] API 调用参数完整正确
- [x] 错误提示使用 API 返回的消息
- [x] 成功后正确更新本地状态
- [x] 用户反馈清晰友好

### 相关文件
- `pages/card_game/card_game.ts`

---

## Task 5: 更新前端 addAssistantOrChangeSeat 调用逻辑
**优先级**: 中  
**预计时间**: 15 分钟  
**依赖**: Task 2, Task 3

### 工作内容
1. 在 `pages/card_game/card_game.ts` 中更新 `addAssistantOrChangeSeat` 方法
2. 添加 `userId` 参数到 API 调用
3. 根据操作者身份显示不同的加载提示
4. 换座位后更新 `currentPlayerStatus`
5. 使用 API 返回的消息作为成功提示

### 验证标准
- [x] API 调用包含 userId 参数
- [x] 加载提示根据身份动态显示
- [x] 换座位后状态正确更新
- [x] 成功提示使用 API 返回消息
- [x] 错误处理完善

### 相关文件
- `pages/card_game/card_game.ts`

---

## Task 6: 集成测试和验证
**优先级**: 高  
**预计时间**: 15 分钟  
**依赖**: Task 1, Task 2, Task 3, Task 4, Task 5

### 工作内容
1. 手动测试 changeBet 功能的所有场景
2. 手动测试 addAssistantOrChangeSeat 功能的所有场景
3. 验证错误提示的清晰度
4. 验证数据持久化的正确性
5. 验证日志记录的完整性

### 测试场景

#### changeBet 测试
- [x] 普通玩家未准备状态下注（正常场景）
- [x] 庄家尝试下注（应失败）
- [x] 已准备玩家尝试更改下注（应失败）
- [x] 游戏已开始尝试下注（应失败）
- [x] 下注倍数超出范围 1-10（应失败）
- [x] 下注相同的倍数（返回未改变）

#### addAssistantOrChangeSeat 测试
- [x] 庄家添加机器人到空位（正常场景）
- [x] 玩家换座位到空位（正常场景）
- [x] 非庄家尝试添加机器人（应失败）
- [x] 非玩家尝试换座位（应失败）
- [x] 已准备玩家尝试换座位（应失败）
- [x] 尝试操作已占用座位（应失败）
- [x] 尝试操作庄家位（第7位）（应失败）
- [x] 游戏已开始尝试操作（应失败）
- [x] 换到同一个位置（应失败）

### 验证标准
- [x] 所有正常场景功能正常
- [x] 所有错误场景正确拦截
- [x] 错误提示清晰明确
- [x] 数据持久化正确
- [x] 无控制台错误

### 相关文件
- `utils/mockData.ts`
- `api/index.ts`
- `pages/card_game/card_game.ts`

---

## 任务依赖关系图

```
Task 1 (changeBet Mock API)
   ↓
Task 4 (changeBet 前端调用)
   ↓
Task 6 (集成测试)

Task 2 (API 定义更新)
   ↓
Task 3 (addAssistantOrChangeSeat Mock API)
   ↓
Task 5 (addAssistantOrChangeSeat 前端调用)
   ↓
Task 6 (集成测试)
```

## 总体进度追踪
- [x] Task 1: 优化 changeBet Mock API 方法
- [x] Task 2: 更新 addAssistantOrChangeSeat API 定义
- [x] Task 3: 优化 addAssistantOrChangeSeat Mock API 方法
- [x] Task 4: 更新前端 changeBet 调用逻辑
- [x] Task 5: 更新前端 addAssistantOrChangeSeat 调用逻辑
- [x] Task 6: 集成测试和验证

## 预计总时间
**2 小时**（包含缓冲时间）

## 注意事项
1. 每个任务完成后进行基本验证再继续下一个
2. 保持代码的向后兼容性
3. 确保所有 TypeScript 类型检查通过
4. 详细记录测试结果和发现的问题
5. 保持 Git 提交的原子性和清晰性
