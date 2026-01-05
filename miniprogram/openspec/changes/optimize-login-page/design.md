# 设计文档：优化登录页面

## 概述
本文档描述了登录页面全面优化的架构设计、技术选型和实现细节，包括微信一键登录功能和视觉设计优化。

## 架构决策

### ADR-1: 采用微信手机号快速验证实现一键登录
**状态**: 已接受  
**日期**: 2026-01-04

#### 背景
需要实现一键登录功能，减少用户操作步骤。微信小程序提供了多种获取用户信息的方式：
1. `wx.getUserProfile` - 获取用户信息（已废弃）
2. `button open-type="getPhoneNumber"` - 获取手机号
3. `button open-type="getUserInfo"` - 获取用户基本信息（已废弃）
4. `wx.getUserInfo` - 获取用户基本信息（需授权）

#### 决策
使用 `button open-type="getPhoneNumber"` + 微信用户信息接口组合方案：
1. 用户点击"一键登录"按钮
2. 触发微信手机号授权
3. 获取encryptedData和iv
4. 后端解密获取手机号
5. 同时获取微信用户的头像和昵称
6. 自动完成注册/登录

#### 替代方案
1. **仅使用手机号授权**：无法获取头像和昵称，体验不完整
2. **使用getUserProfile**：已被微信废弃，不推荐使用
3. **纯自定义输入**：操作步骤多，体验差

#### 后果
- ✅ 用户体验最佳，一键完成登录
- ✅ 获取到手机号、头像、昵称等完整信息
- ✅ 符合微信最新规范
- ⚠️ 需要后端支持手机号解密
- ⚠️ 用户可能拒绝授权，需要降级方案

---

### ADR-2: 保留自定义登录作为降级方案
**状态**: 已接受  
**日期**: 2026-01-04

#### 背景
用户可能拒绝授权手机号，或者在授权失败的情况下，需要提供备选的登录方式。

#### 决策
保留现有的自定义登录方式作为降级方案：
- 主要入口：一键登录（更醒目）
- 次要入口：自定义登录（用户拒绝授权时自动显示，或提供手动切换入口）
- 两种方式最终都调用相同的login API

#### 实现逻辑
```typescript
// 一键登录流程
1. 用户点击"一键登录"
2. 触发getPhoneNumber授权
3. 授权成功 -> 获取用户信息 -> 调用login API
4. 授权失败 -> 显示自定义登录表单

// 自定义登录流程
1. 用户选择头像
2. 输入昵称
3. 点击"开始游戏"
4. 调用login API
```

#### 后果
- ✅ 覆盖所有用户场景
- ✅ 不会因授权失败而阻塞用户
- ✅ 保持向后兼容
- ⚠️ 需要维护两套UI

---

### ADR-3: 渐进式视觉优化策略
**状态**: 已接受  
**日期**: 2026-01-04

#### 背景
视觉优化涉及多个方面（布局、配色、动画、细节），如何平衡完成度和开发时间？

#### 决策
采用渐进式优化策略，按优先级逐步实施：

**阶段1：核心视觉优化**（必须）
- 重新设计按钮样式和层次
- 优化配色方案
- 调整布局和间距

**阶段2：动画和交互**（应该）
- 添加按钮交互动画
- 实现页面过渡效果
- 优化加载状态

**阶段3：细节打磨**（可以）
- 添加背景装饰元素
- 实现高级动画效果
- 优化微交互细节

#### 替代方案
1. **一次性全面优化**：耗时长，风险高
2. **仅优化核心元素**：效果有限
3. **当前方案（推荐）**：平衡效果和效率

#### 后果
- ✅ 可以快速看到优化效果
- ✅ 降低返工风险
- ✅ 便于团队评审和调整
- ⚠️ 需要多次迭代

---

## 技术方案

### 一键登录技术流程

```
┌─────────────┐
│  用户点击   │
│ 一键登录按钮 │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│ 触发微信手机号授权   │
│ open-type=          │
│ "getPhoneNumber"    │
└──────┬──────────────┘
       │
       ↓
┌──────────────┐      ┌──────────────┐
│  用户同意授权 │      │  用户拒绝授权 │
└──────┬───────┘      └──────┬───────┘
       │                     │
       ↓                     ↓
┌─────────────────┐   ┌──────────────┐
│ 获取encryptedData│   │显示自定义登录│
│ 和 iv           │   │   表单      │
└──────┬──────────┘   └──────────────┘
       │
       ↓
┌─────────────────┐
│ 调用login API   │
│ 传递encrypted   │
│ Data和iv        │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ 后端解密手机号  │
│ 查询或创建用户  │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ 获取微信用户信息│
│ (头像、昵称)    │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│   登录成功      │
│ 保存用户信息    │
└─────────────────┘
```

### 关键代码设计

#### 前端 (index.ts)
```typescript
// 一键登录处理
onGetPhoneNumber(e: any) {
  const { encryptedData, iv, errMsg } = e.detail;
  
  if (errMsg === 'getPhoneNumber:ok') {
    // 用户同意授权
    this.performQuickLogin(encryptedData, iv);
  } else {
    // 用户拒绝授权或授权失败
    this.showCustomLoginForm();
  }
}

// 执行快速登录
async performQuickLogin(encryptedData: string, iv: string) {
  this.setData({ loading: true });
  
  // 获取微信登录code
  const { code } = await wx.login();
  
  // 调用登录API
  const response = await login({
    code,
    encryptedData,
    iv,
    loginType: 'quick' // 标识一键登录
  });
  
  if (response.code === 200) {
    // 登录成功，保存用户信息
    setUserInfo(response.data);
    this.setData({ loginFlag: 1 });
  }
}
```

#### 后端API增强
```typescript
// login API需要支持两种登录方式
interface LoginRequest {
  code: string;
  
  // 快速登录字段
  encryptedData?: string;
  iv?: string;
  loginType?: 'quick' | 'custom';
  
  // 自定义登录字段
  name?: string;
  avatar?: string;
}
```

---

## 视觉设计方案

### 配色方案

#### 主题色
- **主色调**：渐变紫蓝 `#667eea → #764ba2`
- **强调色**：渐变橙金 `#ff9a56 → #ff6a00`
- **成功色**：渐变绿 `#11998e → #38ef7d`
- **警告色**：渐变红 `#eb3349 → #f45c43`

#### 背景色
- **主背景**：深紫蓝渐变
- **卡片背景**：半透明白色 `rgba(255, 255, 255, 0.95)`
- **遮罩背景**：半透明黑色 `rgba(0, 0, 0, 0.4)`

### 布局设计

#### 登录页布局
```
┌──────────────────┐
│                  │ 20%
│   Logo + 标题    │
│                  │
├──────────────────┤
│                  │
│  一键登录按钮    │ 30%
│  (主要操作)     │
│                  │
├──────────────────┤
│                  │
│  或             │ 10%
│                  │
├──────────────────┤
│  自定义登录     │
│  (次要操作)     │ 30%
│  [头像选择]     │
│  [昵称输入]     │
│  [开始游戏]     │
├──────────────────┤
│   安全说明      │ 10%
└──────────────────┘
```

### 动画设计

#### 页面进入动画
```less
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeInUp 0.6s ease;
}
```

#### 按钮交互动画
```less
.primary-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}
```

---

## 状态管理设计

### 登录状态枚举
```typescript
enum LoginStatus {
  LOADING = 0,      // 加载中（静默登录检查）
  LOGGED_IN = 1,    // 已登录
  NEED_LOGIN = 2,   // 需要登录
  AUTHORIZING = 3,  // 授权中（新增）
  AUTH_FAILED = 4   // 授权失败（新增）
}
```

### 状态转换图
```
LOADING ──检查本地信息──→ LOGGED_IN
   │                          ↓
   │                     进入主页
   ↓
NEED_LOGIN ──点击一键登录──→ AUTHORIZING
   │                          ├──成功──→ LOGGED_IN
   │                          └──失败──→ AUTH_FAILED
   │                                        ↓
   └────────────────────────────────  显示自定义登录
```

---

## 错误处理设计

### 错误场景分类

#### 授权错误
| 错误类型 | 场景 | 处理方式 |
|---------|------|---------|
| 用户拒绝授权 | 用户点击"拒绝" | 显示自定义登录表单 + 引导文案 |
| 授权超时 | 网络慢或无响应 | 显示错误提示 + 重试按钮 |
| 授权接口异常 | 微信接口错误 | 显示错误提示 + 降级到自定义登录 |

#### 登录错误
| 错误类型 | 场景 | 处理方式 |
|---------|------|---------|
| 网络异常 | 无网络或超时 | 显示"网络异常" + 重试按钮 |
| 后端错误 | API返回失败 | 显示具体错误信息 |
| 解密失败 | 手机号解密失败 | 显示"授权失败" + 降级方案 |

### 错误提示设计
```typescript
interface ErrorMessage {
  icon: string;       // 错误图标
  title: string;      // 错误标题
  message: string;    // 详细信息
  actionText: string; // 操作按钮文本
  action: () => void; // 操作回调
}

// 示例
const authFailedError: ErrorMessage = {
  icon: '⚠️',
  title: '授权失败',
  message: '无法获取您的手机号，您可以选择自定义登录',
  actionText: '自定义登录',
  action: () => this.showCustomLoginForm()
};
```

---

## 性能优化方案

### 加载优化
1. **预加载关键资源**
   - 预加载默认头像
   - 预加载Logo图片
   - 优化图片格式和大小

2. **减少初始渲染**
   - 使用条件渲染避免不必要的DOM
   - 延迟加载非关键内容

3. **优化网络请求**
   - 合并API请求
   - 使用本地缓存

### 动画性能
1. **使用transform和opacity**
   - 避免触发重排的属性
   - 启用GPU加速

2. **控制动画复杂度**
   - 避免同时运行过多动画
   - 使用requestAnimationFrame

---

## 可访问性设计

### 视觉可访问性
- 确保文本对比度 ≥ 4.5:1
- 按钮大小 ≥ 88rpx × 88rpx
- 提供明确的焦点状态

### 操作可访问性
- 支持键盘操作
- 提供语义化的ARIA标签
- 错误信息明确可读

---

## 安全性考虑

### 用户隐私保护
1. **明确授权说明**
   - 清楚说明获取手机号的用途
   - 说明数据保护措施

2. **最小化权限请求**
   - 仅在用户主动操作时请求授权
   - 不重复请求已拒绝的权限

3. **数据加密传输**
   - 使用HTTPS传输
   - 敏感数据加密存储

---

## 测试策略

### 单元测试
- 登录逻辑方法测试
- 状态管理测试
- 错误处理测试

### 集成测试
- 一键登录完整流程
- 自定义登录完整流程
- 授权拒绝场景
- 网络异常场景

### 视觉回归测试
- 截图对比
- 多设备适配测试
- 动画流畅度测试

---

## 监控和日志

### 关键指标
- **一键登录成功率**：授权成功次数 / 点击次数
- **自定义登录使用率**：自定义登录次数 / 总登录次数
- **首次登录时间**：从进入页面到登录成功的平均时间
- **授权拒绝率**：拒绝次数 / 请求次数

### 日志记录
```typescript
// 关键操作日志
console.log('[Login] 用户点击一键登录');
console.log('[Login] 授权成功，手机号：***');
console.log('[Login] 登录成功，用户ID：123');
console.error('[Login] 授权失败：用户拒绝');
```

---

## 参考资料
- [微信小程序登录流程](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [微信小程序手机号快速验证](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html)
- [Material Design - Authentication](https://material.io/design/communication/authentication.html)
- [iOS Human Interface Guidelines - Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple/overview/)
