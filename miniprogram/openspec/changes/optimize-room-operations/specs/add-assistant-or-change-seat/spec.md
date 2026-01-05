# Spec: 添加机器人或换座位功能优化

**能力 ID**: `add-assistant-or-change-seat`  
**版本**: 1.0.0  
**状态**: 草稿

## ADDED Requirements

### Requirement: 完整的参数验证
**ID**: `ACS-REQ-001`  
**优先级**: 必须  
**类型**: 功能性

addAssistantOrChangeSeat 方法必须验证所有必需参数的完整性和有效性。

#### Scenario: 缺少必需参数时拒绝请求
**Given** 调用 addAssistantOrChangeSeat 方法  
**When** roomId、userId、seatIndex 或 isBanker 参数缺失或为 undefined/null  
**Then** 返回 400 错误码和消息 "参数不完整"

#### Scenario: 房间不存在时拒绝请求
**Given** 调用 addAssistantOrChangeSeat 方法  
**When** 指定的 roomId 在存储中不存在  
**Then** 返回 404 错误码和消息 "房间不存在"

#### Scenario: 座位索引无效时拒绝请求
**Given** 调用 addAssistantOrChangeSeat 方法  
**When** seatIndex 小于 0 或大于等于玩家数组长度  
**Then** 返回 400 错误码和消息 "座位索引无效"

#### Scenario: 操作者不在房间中时拒绝请求
**Given** 调用 addAssistantOrChangeSeat 方法  
**When** 指定的 userId 不在房间的玩家列表中  
**Then** 返回 404 错误码和消息 "操作玩家不在房间中"

---

### Requirement: 游戏状态操作限制
**ID**: `ACS-REQ-002`  
**优先级**: 必须  
**类型**: 业务规则

游戏已开始时不允许添加机器人或换座位。

#### Scenario: 游戏中尝试操作时拒绝
**Given** 房间的 isGaming 为 true 或 isStart 为 true  
**When** 调用 addAssistantOrChangeSeat 方法  
**Then** 返回 400 错误码和消息 "游戏已开始，无法操作"  
**And** 座位状态不发生变化

#### Scenario: 游戏未开始时允许操作
**Given** 房间的 isGaming 和 isStart 均为 false  
**When** 调用 addAssistantOrChangeSeat 方法且其他条件满足  
**Then** 操作成功执行

---

### Requirement: 目标座位验证
**ID**: `ACS-REQ-003`  
**优先级**: 必须  
**类型**: 业务规则

目标座位必须是空位（userType=4）才能进行操作。

#### Scenario: 目标座位已被占用时拒绝
**Given** 目标座位的 userType 不为 4（非空位）  
**When** 调用 addAssistantOrChangeSeat 方法  
**Then** 返回 400 错误码和消息 "目标座位已被占用"  
**And** 座位状态不发生变化

#### Scenario: 目标座位为空位时允许操作
**Given** 目标座位的 userType 为 4（空位）  
**When** 调用 addAssistantOrChangeSeat 方法且其他条件满足  
**Then** 操作成功执行

---

### Requirement: 庄家位置保护
**ID**: `ACS-REQ-004`  
**优先级**: 必须  
**类型**: 业务规则

第 7 位是庄家专属位置，不允许进行添加机器人或换座位操作。

#### Scenario: 尝试操作第 7 位时拒绝
**Given** 调用 addAssistantOrChangeSeat 方法  
**When** seatIndex 为 7  
**Then** 返回 400 错误码和消息 "不能操作庄家位置"  
**And** 座位状态不发生变化

---

### Requirement: 庄家添加机器人功能
**ID**: `ACS-REQ-005`  
**优先级**: 必须  
**类型**: 功能性

庄家可以在空位上添加机器人玩家。

#### Scenario: 非庄家尝试添加机器人时拒绝
**Given** 操作者的 userType 不为 1（非庄家）  
**When** isBanker 为 true 时调用 addAssistantOrChangeSeat 方法  
**Then** 返回 403 错误码和消息 "只有庄家才能添加机器人"  
**And** 座位状态不发生变化

#### Scenario: 庄家成功添加机器人
**Given** 操作者的 userType 为 1（庄家）  
**And** 目标座位为空位  
**And** 游戏未开始  
**And** 目标座位不是第 7 位  
**When** isBanker 为 true 时调用 addAssistantOrChangeSeat 方法  
**Then** 返回 200 成功码和消息 "添加机器人成功"  
**And** 目标座位的玩家信息更新为：
  - userId: 房间ID + 时间戳 + 随机数
  - name: 'Bot_' + 随机字符串
  - userType: 3（机器人）
  - status: 2（已准备）
  - bet: 1
  - avatar: 庄家的头像
**And** 数据保存到本地存储

---

### Requirement: 玩家换座位功能
**ID**: `ACS-REQ-006`  
**优先级**: 必须  
**类型**: 功能性

普通玩家可以在未准备状态下换到空位。

#### Scenario: 非普通玩家尝试换座位时拒绝
**Given** 操作者的 userType 不为 2（非普通玩家）  
**When** isBanker 为 false 时调用 addAssistantOrChangeSeat 方法  
**Then** 返回 403 错误码和消息 "只有普通玩家才能换座位"  
**And** 座位状态不发生变化

#### Scenario: 已准备玩家尝试换座位时拒绝
**Given** 操作者的 userType 为 2（普通玩家）  
**And** 操作者的 status 为 2（已准备）  
**When** isBanker 为 false 时调用 addAssistantOrChangeSeat 方法  
**Then** 返回 400 错误码和消息 "已准备状态不能换座位，请先取消准备"  
**And** 座位状态不发生变化

#### Scenario: 换到同一位置时拒绝
**Given** 操作者的 userType 为 2（普通玩家）  
**And** 操作者的 status 为 1（未准备）  
**When** 目标座位索引等于操作者当前座位索引  
**Then** 返回 400 错误码和消息 "您已经在这个位置了"  
**And** 座位状态不发生变化

#### Scenario: 玩家成功换座位
**Given** 操作者的 userType 为 2（普通玩家）  
**And** 操作者的 status 为 1（未准备）  
**And** 目标座位为空位  
**And** 目标座位不是操作者当前位置  
**And** 游戏未开始  
**And** 目标座位不是第 7 位  
**When** isBanker 为 false 时调用 addAssistantOrChangeSeat 方法  
**Then** 返回 200 成功码和消息 "换座成功"  
**And** 目标座位的玩家信息更新为操作者的完整信息  
**And** 操作者原座位重置为空位（userType=4）  
**And** 数据保存到本地存储

---

### Requirement: 数据持久化
**ID**: `ACS-REQ-007`  
**优先级**: 必须  
**类型**: 功能性

成功操作后，必须将数据持久化到本地存储。

#### Scenario: 成功添加机器人后保存数据
**Given** 庄家成功添加机器人  
**When** addAssistantOrChangeSeat 方法执行完成  
**Then** 调用 setRoomInfo 方法保存房间信息  
**And** 本地存储中的房间信息已更新  
**And** 目标座位反映机器人信息

#### Scenario: 成功换座位后保存数据
**Given** 玩家成功换座位  
**When** addAssistantOrChangeSeat 方法执行完成  
**Then** 调用 setRoomInfo 方法保存房间信息  
**And** 本地存储中的房间信息已更新  
**And** 座位布局反映换座后的状态

---

### Requirement: 操作日志记录
**ID**: `ACS-REQ-008`  
**优先级**: 应该  
**类型**: 可观测性

成功操作时应记录详细的操作日志。

#### Scenario: 成功添加机器人后记录日志
**Given** 庄家成功在座位 3 添加机器人  
**When** addAssistantOrChangeSeat 方法执行完成  
**Then** 在控制台输出日志  
**And** 日志包含庄家名称、庄家ID、座位索引、机器人名称和机器人ID  
**And** 日志格式为 "[addAssistantOrChangeSeat] 庄家 {name}(ID:{userId}) 在座位{seatIndex}添加了机器人 {botName}(ID:{botUserId})"

#### Scenario: 成功换座位后记录日志
**Given** 玩家成功从座位 2 换到座位 5  
**When** addAssistantOrChangeSeat 方法执行完成  
**Then** 在控制台输出日志  
**And** 日志包含玩家名称、玩家ID、原座位索引和目标座位索引  
**And** 日志格式为 "[addAssistantOrChangeSeat] 玩家 {name}(ID:{userId}) 从座位{oldIndex}换到座位{newIndex}"

---

### Requirement: 前端状态同步
**ID**: `ACS-REQ-009`  
**优先级**: 必须  
**类型**: 功能性

前端调用成功后必须正确更新本地状态。

#### Scenario: 换座位后更新当前玩家状态
**Given** 玩家成功换座位  
**When** 前端收到成功响应  
**Then** 更新 roomInfo 状态  
**And** 更新 currentPlayerStatus 状态  
**And** 重新计算 canStartGame 状态  
**And** 显示成功提示

#### Scenario: 添加机器人后更新房间状态
**Given** 庄家成功添加机器人  
**When** 前端收到成功响应  
**Then** 更新 roomInfo 状态  
**And** 确保机器人 status 为 2（已准备）  
**And** 重新计算 canStartGame 状态  
**And** 显示成功提示

---

## MODIFIED Requirements

### Requirement: API 接口签名更新
**ID**: `ACS-REQ-MOD-001`  
**优先级**: 必须  
**类型**: 功能性

更新 addAssistantOrChangeSeat API 接口，添加 userId 参数。

#### Scenario: API 调用包含 userId 参数
**Given** 前端调用 addAssistantOrChangeSeat API  
**When** 构造请求参数  
**Then** 参数必须包含 roomId、userId、seatIndex 和 isBanker  
**And** 所有参数类型正确

---

## REMOVED Requirements

无

---

## 相关能力
- `change-bet`: 下注功能也需要考虑准备状态限制
- `player-ready`: 准备状态影响换座位操作

---

## 实现注意事项
1. 参数验证应在业务逻辑验证之前执行
2. 通用验证规则（游戏状态、目标座位、庄家位）对两个分支都适用
3. 庄家分支和玩家分支的验证逻辑应清晰分离
4. 机器人 userId 生成算法应确保唯一性
5. 座位交换应使用直接覆盖而非交换策略
6. 错误返回应保持一致的格式 `{ code, message, data }`
7. 成功返回应包含完整的 roomInfo 和 userInfoList
8. 日志记录应在数据持久化之后
