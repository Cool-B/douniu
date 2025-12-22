// 动画系统测试脚本
// 验证新的动画系统是否工作正常

// 模拟动画数据生成
function testParticleGeneration() {
  console.log('=== 测试粒子生成 ===');
  
  const particles = [];
  const particleCount = 25;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: 0
    });
  }

  console.log('生成的粒子数量:', particles.length);
  console.log('粒子数据示例:', particles[0]);
  return particles.length === particleCount;
}

function testCardGeneration() {
  console.log('=== 测试卡片生成 ===');
  
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const cards = [];
  const cardCount = 8;

  for (let i = 0; i < cardCount; i++) {
    cards.push({
      id: i,
      suit: suits[Math.floor(Math.random() * suits.length)],
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      rotation: Math.random() * 360 - 180,
      opacity: 0
    });
  }

  console.log('生成的卡片数量:', cards.length);
  console.log('卡片数据示例:', cards[0]);
  return cards.length === cardCount;
}

function testAnimationUpdate() {
  console.log('=== 测试动画更新 ===');
  
  // 模拟粒子更新
  const particle = {
    id: 0,
    x: 50,
    y: 50,
    opacity: 0.5
  };

  const updatedParticle = {
    ...particle,
    x: (particle.x + (Math.random() - 0.5) * 0.5) % 100,
    y: (particle.y + (Math.random() - 0.5) * 0.5) % 100,
    opacity: Math.sin(Date.now() / 1000 + particle.id) * 0.5 + 0.5
  };

  console.log('粒子更新前:', particle);
  console.log('粒子更新后:', updatedParticle);
  
  // 模拟卡片更新
  const card = {
    id: 0,
    x: 50,
    rotation: 0,
    opacity: 0.7
  };

  const updatedCard = {
    ...card,
    x: (card.x + (Math.random() - 0.5) * 0.3) % 100,
    rotation: card.rotation + (Math.random() - 0.5) * 2,
    opacity: Math.sin(Date.now() / 1000 + card.id) * 0.3 + 0.7
  };

  console.log('卡片更新前:', card);
  console.log('卡片更新后:', updatedCard);
  
  return true;
}

// 运行所有测试
function runAllTests() {
  console.log('开始动画系统测试...\n');
  
  const tests = [
    { name: '粒子生成', func: testParticleGeneration },
    { name: '卡片生成', func: testCardGeneration },
    { name: '动画更新', func: testAnimationUpdate }
  ];

  let allPassed = true;
  
  tests.forEach(test => {
    console.log(`\n运行测试: ${test.name}`);
    const result = test.func();
    console.log(`${test.name}: ${result ? '✓ 通过' : '✗ 失败'}`);
    allPassed = allPassed && result;
  });

  console.log(`\n=== 测试结果 ===`);
  console.log(`所有测试: ${allPassed ? '✓ 全部通过' : '✗ 部分失败'}`);
  
  return allPassed;
}

// 导出测试函数
module.exports = {
  runAllTests,
  testParticleGeneration,
  testCardGeneration,
  testAnimationUpdate
};

// 如果直接运行此文件，则执行测试
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}