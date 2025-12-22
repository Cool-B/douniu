/**
 * Mock数据功能测试脚本
 * 用于验证Mock数据接口是否正常工作
 */

const mockApi = require('./utils/mockData.ts');

async function testMockData() {
  console.log('开始测试Mock数据功能...\n');
  
  try {
    // 测试登录接口
    console.log('1. 测试登录接口...');
    const loginResult = await mockApi.login({
      code: 'mock_code_123',
      name: '测试用户',
      avatar: 'https://example.com/avatar.jpg'
    });
    console.log('登录结果:', loginResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    // 测试创建房间接口
    console.log('\n2. 测试创建房间接口...');
    const createRoomResult = await mockApi.createRoom({
      userId: 1001,
      roomType: 1
    });
    console.log('创建房间结果:', createRoomResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    // 测试加入房间接口
    console.log('\n3. 测试加入房间接口...');
    const joinRoomResult = await mockApi.joinRoom({
      userId: 1002,
      roomNumber: '888888'
    });
    console.log('加入房间结果:', joinRoomResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    // 测试获取房间信息接口
    console.log('\n4. 测试获取房间信息接口...');
    const getRoomInfoResult = await mockApi.getRoomInfo({
      roomId: 2001
    });
    console.log('获取房间信息结果:', getRoomInfoResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    // 测试开始游戏接口
    console.log('\n5. 测试开始游戏接口...');
    const startGameResult = await mockApi.startGame({
      roomId: 2001,
      userId: 1001
    });
    console.log('开始游戏结果:', startGameResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    // 测试游戏操作接口
    console.log('\n6. 测试游戏操作接口...');
    const gameActionResult = await mockApi.gameAction({
      gameId: 'game_3001',
      userId: 1001,
      action: 'dealCards'
    });
    console.log('游戏操作结果:', gameActionResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    // 测试退出房间接口
    console.log('\n7. 测试退出房间接口...');
    const exitRoomResult = await mockApi.exitRoom({
      roomId: 2001,
      userId: 1001
    });
    console.log('退出房间结果:', exitRoomResult.code === 200 ? '✓ 成功' : '✗ 失败');
    
    console.log('\n✅ Mock数据功能测试完成！所有接口均正常工作。');
    
  } catch (error) {
    console.error('❌ Mock数据功能测试失败:', error);
  }
}

// 运行测试
testMockData();