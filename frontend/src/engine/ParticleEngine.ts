export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'star' | 'spark' | 'ring';
}

export class ParticleEngine {
  private particles: Particle[] = [];

  public createBurst(x: number, y: number, color: string, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      const life = 20 + Math.random() * 15;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life,
        maxLife: life,
        shape: Math.random() > 0.4 ? 'circle' : 'spark',
      });
    }
  }

  public createStripeBeam(x1: number, y1: number, x2: number, y2: number, color: string) {
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 4 + Math.random() * 3,
        color,
        alpha: 1,
        life: 25,
        maxLife: 25,
        shape: 'spark',
      });
    }
  }

  public createWrappedExplosion(x: number, y: number, color: string) {
    this.createBurst(x, y, color, 30);
    // Add expanding shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 10,
      color,
      alpha: 0.9,
      life: 25,
      maxLife: 25,
      shape: 'ring',
    });
  }

  public createRainbowSpiral(x: number, y: number) {
    const rainbowColors = ['#FF2A6D', '#05D9E8', '#00E676', '#FFEA00', '#FF8A00', '#9B5DE5'];
    rainbowColors.forEach((color, idx) => {
      this.createBurst(x, y, color, 8);
    });
  }

  public createJellySplash(x: number, y: number) {
    const colors = ['#E879F9', '#C084FC', '#F472B6', '#FFFFFF'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      const life = 18 + Math.random() * 12;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: colors[i % colors.length],
        alpha: 1,
        life,
        maxLife: life,
        shape: 'circle',
      });
    }
  }

  public createFrostingCrumb(x: number, y: number) {
    const colors = ['#FFFFFF', '#E2E8F0', '#CBD5E1', '#94A3B8'];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      const life = 18 + Math.random() * 14;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color: colors[i % colors.length],
        alpha: 1,
        life,
        maxLife: life,
        shape: 'spark',
      });
    }
  }

  public createChocolateCrumb(x: number, y: number) {
    const colors = ['#78350F', '#92400E', '#B45309', '#451A03'];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      const life = 20 + Math.random() * 15;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: colors[i % colors.length],
        alpha: 1,
        life,
        maxLife: life,
        shape: 'circle',
      });
    }
  }

  public createIngredientCollected(x: number, y: number) {
    const colors = ['#FBBF24', '#FDE047', '#FEF08A', '#FFFFFF'];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5.5;
      const life = 25 + Math.random() * 18;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3.5 + Math.random() * 4,
        color: colors[i % colors.length],
        alpha: 1,
        life,
        maxLife: life,
        shape: 'spark',
      });
    }
  }

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.shape === 'ring') {
        p.size += 3.5;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ring') {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  public clear() {
    this.particles = [];
  }
}
