# Spec: 下注功能优化

**能力 ID**: `change-bet`  
**版本**: 1.0.0  
**状态**: 草稿

## ADDED Requirements

### Requirement: 完整的参数验证
**ID**: `CB-REQ-001`  
**优先级**: 必须  
**类型**: 功能性

changeBet 方法必须验证所有必需参数的完整性和有效性。

#### Scenario: 缺少必需参数时拒绝请求
**Given** 调用 changeBet 方法  
**When** roomId、userId 或 bet 参数缺失或为 undefined/null  
**Then** 返回 400 错误码和消息 "参数不完整"

#### Scenario: 房间不存在时拒绝请求
**Given** 调用 changeBet 方法  
**When** 指定的 roomId 在存储中不存在  
**Then** 返回 404 错误码和消息 "房间不存在"

#### Scenario: 玩家不在房间中时拒绝请求
**Given** 调用 changeBet 方法  
**When** 指定的 userId 不在房间的玩家列表中  
**Then** 返回 404 错误码和消息 "玩家不在房间中"

---

### Requirement: 庄家下注限制
**ID**: `CB-REQ-002`  
**优先级**: 必须  
**类型**: 业务规则

庄家（userType=1）不允许进行下注操作。

#### Scenario: 庄家尝试下注时拒绝
**Given** 房间中存在庄家玩家  
**When** 庄家调用 changeBet 方法  
**Then** 返回 400 错误码和消息 "庄家不能下注"  
**And** 庄家的 bet 字段不发生变化

---

### Requirement: 已准备状态下注限制
**ID**: `CB-REQ-003`  
**优先级**: 必须  
**类型**: 业务规则

玩家在已准备状态（status=2）时不允许更改下注。

#### Scenario: 已准备玩家尝试更改下注时拒绝
**Given** 玩家的 status 为 2（已准备）  
**When** 玩家调用 changeBet 方法  
**Then** 返回 400 错误码和消息 "已准备状态不能更改下注"  
**And** 玩家的 bet 字段不发生变化

#### Scenario: 未准备玩家可以更改下注
**Given** 玩家的 status 为 1（未准备）  
**When** 玩家调用 changeBet 方法且参数有效  
**Then** 返回 200 成功码  
**And** 玩家的 bet 字段更新为新值

---

### Requirement: 游戏状态下注限制
**ID**: `CB-REQ-004`  
**优先级**: 必须  
**类型**: 业务规则

游戏已开始时不允许更改下注。

#### Scenario: 游戏中尝试更改下注时拒绝
**Given** 房间的 isGaming 为 true 或 isStart 为 true  
**When** 玩家调用 changeBet 方法  
**Then** 返回 400 错误码和消息 "游戏已开始，无法更改下注"  
**And** 玩家的 bet 字段不发生变化

#### Scenario: 游戏未开始时可以更改下注
**Given** 房间的 isGaming 和 isStart 均为 false  
**When** 玩家调用 changeBet 方法且参数有效  
**Then** 返回 200 成功码  
**And** 玩家的 bet 字段更新为新值

---

### Requirement: 下注范围验证
**ID**: `CB-REQ-005`  
**优先级**: 必须  
**类型**: 业务规则

下注倍数必须是 1-10 之间的整数。

#### Scenario: 下注倍数为 0 时拒绝
**Given** 玩家调用 changeBet 方法  
**When** bet 参数为 0  
**Then** 返回 400 错误码和消息 "下注倍数必须是1-10之间的整数"

#### Scenario: 下注倍数大于 10 时拒绝
**Given** 玩家调用 changeBet 方法  
**When** bet 参数为 11 或更大  
**Then** 返回 400 错误码和消息 "下注倍数必须是1-10之间的整数"

#### Scenario: 下注倍数为小数时拒绝
**Given** 玩家调用 changeBet 方法  
**When** bet 参数为小数（如 1.5）  
**Then** 返回 400 错误码和消息 "下注倍数必须是1-10之间的整数"

#### Scenario: 下注倍数在有效范围内时接受
**Given** 玩家调用 changeBet 方法  
**When** bet 参数为 1-10 之间的整数  
**Then** 返回 200 成功码  
**And** 玩家的 bet 字段更新为新值

---

### Requirement: 重复下注检测
**ID**: `CB-REQ-006`  
**优先级**: 应该  
**类型**: 用户体验

当玩家下注倍数未改变时，应返回成功但提示未改变。

#### Scenario: 下注相同倍数时返回未改变
**Given** 玩家当前 bet 为 5  
**When** 玩家调用 changeBet 方法且 bet 参数为 5  
**Then** 返回 200 成功码和消息 "下注倍数未改变"  
**And** 玩家的 bet 字段保持为 5  
**And** 不触发存储更新

---

### Requirement: 数据持久化
**ID**: `CB-REQ-007`  
**优先级**: 必须  
**类型**: 功能性

成功更改下注后，必须将数据持久化到本地存储。

#### Scenario: 成功下注后保存数据
**Given** 玩家成功更改下注  
**When** changeBet 方法执行完成  
**Then** 调用 setRoomInfo 方法保存房间信息  
**And** 本地存储中的房间信息已更新  
**And** 玩家的 bet 字段反映新值

---

### Requirement: 操作日志记录
**ID**: `CB-REQ-008`  
**优先级**: 应该  
**类型**: 可观测性

成功更改下注时应记录详细的操作日志。

#### Scenario: 成功下注后记录日志
**Given** 玩家成功更改下注从 3 倍到 7 倍  
**When** changeBet 方法执行完成  
**Then** 在控制台输出日志  
**And** 日志包含玩家名称、玩家ID、旧下注值和新下注值  
**And** 日志格式为 "[changeBet] 玩家 {name}(ID:{userId}) 下注从 {oldBet}倍 改为 {newBet}倍"

---

## MODIFIED Requirements

无

---

## REMOVED Requirements

无

---

## 相关能力
- `add-assistant-or-change-seat`: 换座位功能也需要考虑准备状态限制

---

## 实现注意事项
1. 参数验证应在业务逻辑验证之前执行
2. 使用 `Number.isInteger()` 验证整数
3. 错误返回应保持一致的格式 `{ code, message, data }`
4. 成功返回应包含完整的 roomInfo
5. 日志记录应在数据持久化之后
