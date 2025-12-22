// 动画系统 - 基于ParticleEffect和FloatingCards的设计理念
// 适配WeChat Mini Program环境

// 粒子效果系统
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 30;
    this.init();
  }

  init() {
    // 创建粒子数据
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
        opacity: 0
      });
    }
  }

  getParticles() {
    return this.particles;
  }

  update() {
    // 更新粒子状态（用于动态效果）
    this.particles.forEach(particle => {
      // 简单的粒子运动逻辑
      particle.x += (Math.random() - 0.5) * 0.5;
      particle.y += (Math.random() - 0.5) * 0.5;
      
      // 边界检查
      if (particle.x < 0) particle.x = 100;
      if (particle.x > 100) particle.x = 0;
      if (particle.y < 0) particle.y = 100;
      if (particle.y > 100) particle.y = 0;
    });
  }
}

// 浮动卡片系统
class FloatingCardSystem {
  constructor() {
    this.cards = [];
    this.maxCards = 8;
    this.init();
  }

  init() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    for (let i = 0; i < this.maxCards; i++) {
      this.cards.push({
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
  }

  getCards() {
    return this.cards;
  }

  update() {
    // 更新卡片状态
    this.cards.forEach(card => {
      // 简单的浮动运动
      card.x += (Math.random() - 0.5) * 0.3;
      card.rotation += (Math.random() - 0.5) * 2;
      
      // 边界检查
      if (card.x < 0) card.x = 100;
      if (card.x > 100) card.x = 0;
    });
  }
}

// 动画管理器
class AnimationManager {
  constructor() {
    this.particleSystem = new ParticleSystem();
    this.cardSystem = new FloatingCardSystem();
    this.isRunning = false;
    this.animationFrame = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      clearTimeout(this.animationFrame);
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.particleSystem.update();
    this.cardSystem.update();

    // 使用setTimeout模拟requestAnimationFrame
    this.animationFrame = setTimeout(() => {
      this.animate();
    }, 1000 / 30); // 30fps
  }

  getAnimationData() {
    return {
      particles: this.particleSystem.getParticles(),
      cards: this.cardSystem.getCards()
    };
  }

  reset() {
    this.stop();
    this.particleSystem = new ParticleSystem();
    this.cardSystem = new FloatingCardSystem();
  }
}

// 导出动画管理器
module.exports = AnimationManager;