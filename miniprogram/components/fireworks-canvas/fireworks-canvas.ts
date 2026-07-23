// components/fireworks-canvas/fireworks-canvas.ts

// 烟花粒子接口
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  gravity: number;
  friction: number;
  life: number;
  maxLife: number;
  trail: Array<{ x: number; y: number; alpha: number }>; // 添加粒子拖尾
}

// 火箭接口
interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

// 组件实例接口
interface ComponentInstance {
  canvas: any;
  ctx: any;
  width: number;
  height: number;
  rockets: Rocket[];
  particles: Particle[];
  animationFrame: number | null;
  lastLaunchTime: number;
}

Component<any, any, any>({
  properties: {
    // 是否启用烟花效果
    enabled: {
      type: Boolean,
      value: true
    },
    // 烟花发射频率（毫秒）
    frequency: {
      type: Number,
      value: 2000
    }
  },

  data: {
    canvasWidth: 375,
    canvasHeight: 667
  },

  lifetimes: {
    attached(this: ComponentInstance) {
      this.initCanvas();
    },
    detached(this: ComponentInstance) {
      this.stopAnimation();
    }
  },

  pageLifetimes: {
    show(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      if (this.data.enabled) {
        this.startAnimation();
      }
    },
    hide(this: ComponentInstance) {
      this.stopAnimation();
    }
  },

  methods: {
    /**
     * 初始化Canvas
     */
    async initCanvas(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      try {
        // 获取系统信息
        const systemInfo = wx.getSystemInfoSync();
        const pixelRatio = systemInfo.pixelRatio || 2;
        const screenWidth = systemInfo.screenWidth;
        const screenHeight = systemInfo.screenHeight;

        this.setData({
          canvasWidth: screenWidth,
          canvasHeight: screenHeight
        });

        // 等待Canvas元素准备好
        await new Promise(resolve => setTimeout(resolve, 100));

        // 获取Canvas实例
        const query = this.createSelectorQuery();
        query.select('#fireworks-canvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0]) {
              const canvas = res[0].node;
              const ctx = canvas.getContext('2d');

              // 设置Canvas实际尺寸（物理像素）
              canvas.width = screenWidth * pixelRatio;
              canvas.height = screenHeight * pixelRatio;

              // 缩放上下文以匹配设备像素比
              ctx.scale(pixelRatio, pixelRatio);

              // 保存到组件实例
              this.canvas = canvas;
              this.ctx = ctx;
              this.width = screenWidth;
              this.height = screenHeight;

              // 初始化动画数据
              this.rockets = [];
              this.particles = [];
              this.animationFrame = null;
              this.lastLaunchTime = 0;

              // 启动动画
              if (this.data.enabled) {
                this.startAnimation();
              }

              console.log('✅ Canvas烟花组件初始化成功', {
                width: screenWidth,
                height: screenHeight,
                pixelRatio
              });
            }
          });
      } catch (error) {
        console.error('❌ Canvas初始化失败:', error);
      }
    },

    /**
     * 启动动画循环
     */
    startAnimation(this: ComponentInstance) {
      if (!this.canvas || !this.ctx) return;
      if (this.animationFrame) return; // 已经在运行

      console.log('🎆 启动烟花动画');
      this.animate();
    },

    /**
     * 停止动画循环
     */
    stopAnimation(this: ComponentInstance) {
      if (this.animationFrame) {
        this.canvas?.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      console.log('⏸️ 停止烟花动画');
    },

    /**
     * 动画循环
     */
    animate(this: ComponentInstance & WechatMiniprogram.Component.TrivialInstance) {
      if (!this.canvas || !this.ctx) return;

      const now = Date.now();

      // 清空画布
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 检查是否需要发射新火箭
      if (now - this.lastLaunchTime > this.data.frequency) {
        this.launchRocket();
        this.lastLaunchTime = now;
      }

      // 更新和绘制火箭
      this.updateRockets();

      // 更新和绘制粒子
      this.updateParticles();

      // 请求下一帧
      this.animationFrame = this.canvas.requestAnimationFrame(() => {
        this.animate();
      });
    },

    /**
     * 发射火箭
     */
    launchRocket(this: ComponentInstance) {
      const x = Math.random() * this.width * 0.6 + this.width * 0.2; // 20-80% 位置
      const targetY = this.height * 0.2 + Math.random() * this.height * 0.3; // 20-50% 高度
      const color = this.getRandomColor();

      const rocket: Rocket = {
        x,
        y: this.height,
        targetY,
        vy: -8 - Math.random() * 4, // -8 到 -12 的速度
        color,
        exploded: false,
        trail: []
      };

      this.rockets.push(rocket);
    },

    /**
     * 更新火箭
     */
    updateRockets(this: ComponentInstance) {
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const rocket = this.rockets[i];

        if (!rocket.exploded) {
          // 更新位置
          rocket.y += rocket.vy;
          rocket.vy += 0.1; // 重力

          // 添加轨迹
          rocket.trail.push({ x: rocket.x, y: rocket.y, alpha: 1 });
          if (rocket.trail.length > 15) {
            rocket.trail.shift();
          }

          // 更新轨迹透明度
          rocket.trail.forEach((point, index) => {
            point.alpha = index / rocket.trail.length;
          });

          // 绘制轨迹
          this.ctx.save();
          rocket.trail.forEach((point, index) => {
            if (index > 0) {
              const prev = rocket.trail[index - 1];
              this.ctx.beginPath();
              this.ctx.moveTo(prev.x, prev.y);
              this.ctx.lineTo(point.x, point.y);
              this.ctx.strokeStyle = `rgba(255, 255, 255, ${point.alpha * 0.8})`;
              this.ctx.lineWidth = 3;
              this.ctx.stroke();
            }
          });

          // 绘制火箭头部（发光球）
          const gradient = this.ctx.createRadialGradient(rocket.x, rocket.y, 0, rocket.x, rocket.y, 8);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.4, rocket.color);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(rocket.x, rocket.y, 8, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();

          // 检查是否到达目标高度
          if (rocket.y <= rocket.targetY || rocket.vy > 0) {
            this.explode(rocket.x, rocket.y, rocket.color);
            rocket.exploded = true;
            this.rockets.splice(i, 1);
          }
        }
      }
    },

    /**
     * 爆炸效果
     */
    explode(this: ComponentInstance, x: number, y: number, baseColor: string) {
      const particleCount = 80 + Math.floor(Math.random() * 40); // 80-120个粒子
      const colors = this.getExplosionColors(baseColor);

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 4; // 随机速度
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        const particle: Particle = {
          x,
          y,
          vx,
          vy,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 2,
          gravity: 0.05 + Math.random() * 0.05,
          friction: 0.98 - Math.random() * 0.02,
          life: 0,
          maxLife: 80 + Math.random() * 40,
          trail: [] // 初始化拖尾数组
        };

        this.particles.push(particle);
      }

      // 添加中心闪光效果
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 0.5 + Math.random() * 1.5;
        const particle: Particle = {
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          alpha: 1,
          color: '#ffffff',
          size: 3 + Math.random() * 3,
          gravity: 0.02,
          friction: 0.95,
          life: 0,
          maxLife: 40,
          trail: [] // 初始化拖尾数组
        };
        this.particles.push(particle);
      }
    },

    /**
     * 更新粒子
     */
    updateParticles(this: ComponentInstance) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        // 添加当前位置到拖尾
        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
        
        // 限制拖尾长度（根据速度动态调整）
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxTrailLength = Math.floor(5 + speed * 2); // 速度越快拖尾越长
        if (p.trail.length > maxTrailLength) {
          p.trail.shift();
        }

        // 更新拖尾透明度
        p.trail.forEach((point, index) => {
          point.alpha = (index / p.trail.length) * p.alpha;
        });

        // 更新位置
        p.x += p.vx;
        p.y += p.vy;

        // 应用重力和摩擦力
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;

        // 更新生命周期
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        // 绘制粒子
        if (p.alpha > 0) {
          this.ctx.save();

          // 绘制拖尾轨迹
          if (p.trail.length > 1) {
            for (let j = 1; j < p.trail.length; j++) {
              const prev = p.trail[j - 1];
              const curr = p.trail[j];
              
              this.ctx.beginPath();
              this.ctx.moveTo(prev.x, prev.y);
              this.ctx.lineTo(curr.x, curr.y);
              
              // 拖尾渐变色
              const trailAlpha = curr.alpha * 0.6;
              this.ctx.strokeStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${trailAlpha})`);
              
              // 如果颜色是十六进制格式，需要转换
              if (p.color.startsWith('#')) {
                const r = parseInt(p.color.slice(1, 3), 16);
                const g = parseInt(p.color.slice(3, 5), 16);
                const b = parseInt(p.color.slice(5, 7), 16);
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${trailAlpha})`;
              }
              
              // 拖尾宽度随位置递减
              const widthScale = j / p.trail.length;
              this.ctx.lineWidth = p.size * widthScale * 1.5;
              this.ctx.lineCap = 'round';
              this.ctx.stroke();
            }
          }

          // 绘制粒子头部的发光效果
          this.ctx.globalAlpha = p.alpha;
          
          // 外层光晕（更大更柔和）
          const outerGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          outerGradient.addColorStop(0, p.color);
          outerGradient.addColorStop(0.3, p.color);
          outerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          this.ctx.fillStyle = outerGradient;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          this.ctx.fill();

          // 中层光晕
          const midGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          midGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          midGradient.addColorStop(0.4, p.color);
          midGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          this.ctx.fillStyle = midGradient;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          this.ctx.fill();

          // 核心粒子（实心亮点）
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.restore();
        }

        // 移除死亡粒子
        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
        }
      }
    },

    /**
     * 获取随机颜色
     */
    getRandomColor(this: ComponentInstance): string {
      const colors = [
        '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B24BF3',
        '#FF6348', '#FFA502', '#2ED573', '#5F27CD', '#48DBFB',
        '#FF6B9D', '#C44569', '#FFC312', '#F953C6', '#B91D73'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * 获取爆炸颜色组合
     */
    getExplosionColors(this: ComponentInstance, baseColor: string): string[] {
      // 预定义的颜色组合
      const colorCombos = [
        ['#FF6B6B', '#FFD93D', '#FFFFFF'], // 红黄白
        ['#4D96FF', '#FFB6D9', '#FFFFFF'], // 蓝粉白
        ['#B24BF3', '#FFE66D', '#00D9FF'], // 紫黄青
        ['#FF4757', '#FFA502', '#2ED573'], // 红橙绿
        ['#5F27CD', '#FF6348', '#48DBFB'], // 紫红青
        ['#FF6B9D', '#C44569', '#FFC312'], // 粉红黄
        ['#00D2FF', '#3A7BD5', '#FFFFFF'], // 蓝白
        ['#F953C6', '#B91D73', '#FFFFFF'], // 粉紫白
      ];

      return colorCombos[Math.floor(Math.random() * colorCombos.length)];
    }
  }
});
