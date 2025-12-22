// 动画组件测试脚本
const testComponent = {
  properties: {
    enableAnimation: {
      type: Boolean,
      value: true
    },
    animationType: {
      type: String,
      value: 'both'
    }
  },

  data: {
    particles: [],
    cards: [],
    isAnimating: false,
    animationTimer: null
  },

  methods: {
    attached() {
      console.log('组件已附加');
      if (this.properties.enableAnimation) {
        this.initAnimation();
      }
    },

    detached() {
      console.log('组件已分离');
      this.stopAnimation();
    },

    initAnimation() {
      console.log('初始化动画');
      this.generateParticles();
      this.generateCards();
      this.startAnimation();
    },

    generateParticles() {
      const particles = [];
      for (let i = 0; i < 5; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          opacity: 0.5
        });
      }
      console.log('生成粒子:', particles);
      this.setData({ particles });
    },

    generateCards() {
      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['A', '2', '3'];
      const cards = [];
      for (let i = 0; i < 3; i++) {
        cards.push({
          id: i,
          suit: suits[Math.floor(Math.random() * suits.length)],
          rank: ranks[Math.floor(Math.random() * ranks.length)],
          x: Math.random() * 100,
          rotation: Math.random() * 360 - 180,
          opacity: 0.7
        });
      }
      console.log('生成卡片:', cards);
      this.setData({ cards });
    },

    startAnimation() {
      console.log('开始动画');
      this.setData({ isAnimating: true });
    },

    stopAnimation() {
      console.log('停止动画');
      this.setData({ isAnimating: false });
    }
  }
};

// 测试组件
console.log('=== 动画组件测试开始 ===');
const component = Component(testComponent);
console.log('=== 动画组件测试完成 ===');