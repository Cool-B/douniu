// 动画组件 - 基于ParticleEffect和FloatingCards的设计
Component({
  properties: {
    // 是否启用动画
    enableAnimation: {
      type: Boolean,
      value: true
    },
    // 动画类型：'particle' | 'cards' | 'both'
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
      if (this.properties.enableAnimation) {
        this.initAnimation();
      }
    },

    detached() {
      this.stopAnimation();
    },
    // 初始化动画
    initAnimation() {
      this.generateParticles();
      this.generateCards();
      this.startAnimation();
    },

    // 生成粒子数据
    generateParticles() {
      if (this.properties.animationType === 'cards') return;

      const particles = [];
      const particleCount = this.properties.animationType === 'particle' ? 50 : 25;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          opacity: 0
        });
      }

      this.setData({ particles });
    },

    // 生成卡片数据
    generateCards() {
      if (this.properties.animationType === 'particle') return;

      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      const cards = [];
      const cardCount = this.properties.animationType === 'cards' ? 15 : 8;

      for (let i = 0; i < cardCount; i++) {
        cards.push({
          id: i,
          suit: suits[Math.floor(Math.random() * suits.length)],
          rank: ranks[Math.floor(Math.random() * ranks.length)],
          x: Math.random() * 100,
          rotation: Math.random() * 360 - 180,
          opacity: 0
        });
      }

      this.setData({ cards });
    },

    // 开始动画
    startAnimation() {
      if (this.data.isAnimating) return;

      this.setData({ isAnimating: true });
      this.animate();
    },

    // 停止动画
    stopAnimation() {
      this.setData({ isAnimating: false });
      if (this.data.animationTimer) {
        clearTimeout(this.data.animationTimer);
      }
    },

    // 动画循环
    animate() {
      if (!this.data.isAnimating) return;

      // 更新粒子状态
      if (this.data.particles.length > 0) {
        const particles = this.data.particles.map(particle => ({
          ...particle,
          x: (particle.x + (Math.random() - 0.5) * 0.5) % 100,
          y: (particle.y + (Math.random() - 0.5) * 0.5) % 100,
          opacity: Math.sin(Date.now() / 1000 + particle.id) * 0.5 + 0.5
        }));
        this.setData({ particles });
      }

      // 更新卡片状态
      if (this.data.cards.length > 0) {
        const cards = this.data.cards.map(card => ({
          ...card,
          x: (card.x + (Math.random() - 0.5) * 0.3) % 100,
          rotation: card.rotation + (Math.random() - 0.5) * 2,
          opacity: Math.sin(Date.now() / 1000 + card.id) * 0.3 + 0.7
        }));
        this.setData({ cards });
      }

      // 继续动画循环
      const animationTimer = setTimeout(() => {
        this.animate();
      }, 1000 / 30); // 30fps
      this.setData({ animationTimer });
    },

    // 重置动画
    resetAnimation() {
      this.stopAnimation();
      this.generateParticles();
      this.generateCards();
      this.startAnimation();
    },

    // 切换动画状态
    toggleAnimation() {
      if (this.data.isAnimating) {
        this.stopAnimation();
      } else {
        this.startAnimation();
      }
    }
  }
});