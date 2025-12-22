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
    animationTimer: null,
    lastCardTime: 0,
    usedPositions: [] // 记录已使用的位置，避免重叠
  },

  // 生命周期方法
  attached() {
    if (this.properties.enableAnimation) {
      this.initAnimation();
    }
  },

  detached() {
    this.stopAnimation();
  },

  methods: {
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

    // 生成单个卡片
    generateSingleCard() {
      if (this.properties.animationType === 'particle') return null;

      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      
      // 将屏幕分成12个位置，避免重叠
      const positionCount = 12;
      const positionWidth = 100 / positionCount;
      
      // 找到可用的位置
      let availablePositions = [];
      for (let i = 0; i < positionCount; i++) {
        const positionKey = i.toString();
        const positionX = (i * positionWidth) + (positionWidth / 2);
        
        // 检查这个位置是否已被占用（考虑当前所有卡片的位置）
        let isOccupied = false;
        for (let card of this.data.cards) {
          const distance = Math.abs(card.x - positionX);
          if (distance < positionWidth * 0.8) { // 如果距离太近，认为被占用
            isOccupied = true;
            break;
          }
        }
        
        if (!isOccupied) {
          availablePositions.push(positionX);
        }
      }
      
      // 如果没有完全空的位置，随机选择一个，但添加偏移避免完全重叠
      if (availablePositions.length === 0) {
        availablePositions = Array.from({length: positionCount}, (_, i) => 
          (i * positionWidth) + (positionWidth / 2) + (Math.random() - 0.5) * positionWidth * 0.6
        );
      }
      
      // 随机选择一个位置
      const x = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      
      return {
        id: Date.now() + Math.random(),
        suit: suits[Math.floor(Math.random() * suits.length)],
        rank: ranks[Math.floor(Math.random() * ranks.length)],
        x: x, // 避免重叠的位置
        y: -10, // 从屏幕上方开始
        rotation: Math.random() * 360, // 初始旋转角度
        opacity: 0,
        fallSpeed: Math.random() * 0.4 + 0.4, // 更快的下落速度
        rotationSpeed: (Math.random() - 0.5) * 5, // 更快的旋转速度
        horizontalSpeed: 0 // 移除水平移动，垂直下落
      };
    },

    // 生成初始卡片数据
    generateCards() {
      this.setData({ cards: [] });
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

      const currentTime = Date.now();
      
      // 更新粒子状态
      if (this.data.particles.length > 0) {
        const particles = this.data.particles.map(particle => ({
          ...particle,
          opacity: Math.sin(Date.now() / 1000 + particle.id) * 0.5 + 0.5
        }));
        this.setData({ particles });
      }

      // 更新卡片状态 - 飘落效果
      if (this.data.cards.length >= 0) {
        let cards = this.data.cards.map(card => {
          let newY = card.y + card.fallSpeed;
          let newX = card.x; // 保持x坐标不变，垂直下落
          let newRotation = (card.rotation + card.rotationSpeed) % 360; // 360度循环旋转
          
          // 计算透明度：进入视野时淡入，离开视野时淡出
          let opacity = 0;
          if (newY > 5 && newY < 95) {
            opacity = 0.7; // 完全可见
          } else if (newY >= 0 && newY <= 5) {
            opacity = newY / 5 * 0.7; // 淡入
          } else if (newY >= 95 && newY <= 100) {
            opacity = (100 - newY) / 5 * 0.7; // 淡出
          }
          
          return {
            ...card,
            x: newX,
            y: newY,
            rotation: newRotation,
            opacity: opacity
          };
        });

        // 移除已经飘出屏幕的卡片
        cards = cards.filter(card => card.y < 110);

        // 定时生成新卡片
        if (currentTime - this.data.lastCardTime > 2000) { // 每2秒生成一张新卡片
          const newCard = this.generateSingleCard();
          if (newCard) {
            cards.push(newCard);
          }
          this.setData({ lastCardTime: currentTime });
        }

        // 限制最大卡片数量，避免性能问题
        if (cards.length > 15) {
          cards = cards.slice(-15);
        }

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