import { CandyColor, Tile, IngredientType } from './types';
import { CANDY_THEME } from './constants';

export class CandyRenderer {
  /**
   * Main dispatcher to render any candy with glossy 3D confectionery effects.
   */
  public static renderCandy(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    candy: NonNullable<Tile['candy']>,
    scale = 1,
    time = 0
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    // 1. Ingredients (Twin Cherries or Hazelnut)
    if (candy.isIngredient) {
      this.drawIngredient(ctx, 0, 0, radius, candy.ingredientType);
      ctx.restore();
      return;
    }

    // 2. Color Bomb (Chocolate Disco Sprinkle Ball)
    if (candy.special === 'COLOR_BOMB') {
      this.drawColorBomb(ctx, 0, 0, radius, time);
      ctx.restore();
      return;
    }

    // 3. Base Candy Shape (Red Bean, Orange Diamond, Yellow Lemon, Green Pillow, Blue Sphere, Purple Cluster)
    const theme = CANDY_THEME[candy.color as CandyColor] || CANDY_THEME.RED;
    this.drawBaseCandy(ctx, 0, 0, radius, candy.color, theme);

    // 4. Special Candy Overlays (Stripes & Wrapped)
    if (candy.special === 'STRIPED_H' || candy.special === 'STRIPED_V') {
      this.drawStripes(ctx, 0, 0, radius, candy.special === 'STRIPED_H', time);
    } else if (candy.special === 'WRAPPED') {
      this.drawWrapper(ctx, 0, 0, radius, theme, time);
    }

    ctx.restore();
  }

  /**
   * Draws the authentic 3D candy shape for each color.
   */
  private static drawBaseCandy(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    color: CandyColor,
    theme: typeof CANDY_THEME[CandyColor]
  ) {
    // Soft realistic confectionery drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = r * 0.35;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = r * 0.16;

    switch (color) {
      case 'RED':
        this.drawJellyBean(ctx, cx, cy, r);
        break;
      case 'ORANGE':
        this.drawOrangeDiamond(ctx, cx, cy, r);
        break;
      case 'YELLOW':
        this.drawLemonDrop(ctx, cx, cy, r);
        break;
      case 'GREEN':
        this.drawPillowSquare(ctx, cx, cy, r);
        break;
      case 'BLUE':
        this.drawBlueSphere(ctx, cx, cy, r);
        break;
      case 'PURPLE':
        this.drawPurpleCluster(ctx, cx, cy, r);
        break;
      default:
        this.drawBlueSphere(ctx, cx, cy, r);
        break;
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // ==========================================
  // 1. RED CANDY: AUTHENTIC JELLY BEAN
  // ==========================================
  private static drawJellyBean(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);

    // Organic kidney bean vector path
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, -r * 0.62);
    ctx.bezierCurveTo(-r * 0.05, -r * 0.92, r * 0.78, -r * 0.75, r * 0.82, -r * 0.12);
    ctx.bezierCurveTo(r * 0.86, r * 0.52, r * 0.42, r * 0.88, -r * 0.18, r * 0.78);
    ctx.bezierCurveTo(-r * 0.78, r * 0.68, -r * 0.88, r * 0.15, -r * 0.72, -r * 0.28);
    ctx.closePath();

    // 3D Spherical Red Candy Gradient
    const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.32, r * 0.08, 0, 0, r * 0.95);
    grad.addColorStop(0, '#FF80AB');     // Bright strawberry pink highlight
    grad.addColorStop(0.28, '#FF1744');  // Vibrant ruby red body
    grad.addColorStop(0.72, '#D50000');  // Rich crimson
    grad.addColorStop(1, '#880E4F');     // Deep plum shadow rim
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Glass Rim Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.stroke();

    // Primary Curved Specular Glare (Top-Left crest)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.26, -r * 0.34, r * 0.38, r * 0.15, -Math.PI / 4.8, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Pinpoint Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(-r * 0.38, -r * 0.26, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Belly Translucent Bounce Light
    ctx.fillStyle = 'rgba(255, 128, 171, 0.32)';
    ctx.beginPath();
    ctx.ellipse(r * 0.15, r * 0.52, r * 0.36, r * 0.12, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 2. ORANGE CANDY: DIAMOND LOZENGE
  // ==========================================
  private static drawOrangeDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);

    const w = r * 0.94;
    const h = r * 0.84;

    // Smooth rounded rhombus path
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.quadraticCurveTo(w * 0.88, -h * 0.42, w, 0);
    ctx.quadraticCurveTo(w * 0.88, h * 0.42, 0, h);
    ctx.quadraticCurveTo(-w * 0.88, h * 0.42, -w, 0);
    ctx.quadraticCurveTo(-w * 0.88, -h * 0.42, 0, -h);
    ctx.closePath();

    // Juicy Tangerine 3D Radial Gradient
    const grad = ctx.createRadialGradient(-w * 0.25, -h * 0.28, r * 0.08, 0, 0, r * 0.95);
    grad.addColorStop(0, '#FFE082');     // Bright apricot highlight
    grad.addColorStop(0.3, '#FF9100');   // Vivid citrus orange
    grad.addColorStop(0.75, '#FF6D00');  // Rich amber orange
    grad.addColorStop(1, '#BF360C');     // Deep terracotta rim
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Rim Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.stroke();

    // Diagonal Specular Gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.22, -h * 0.28, w * 0.36, h * 0.14, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Dot Gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(-w * 0.36, -h * 0.22, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 3. YELLOW CANDY: LEMON DROP TEARDROP
  // ==========================================
  private static drawLemonDrop(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);

    // Teardrop lemon contour
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.96);
    ctx.bezierCurveTo(r * 0.9, -r * 0.42, r * 0.92, r * 0.44, 0, r * 0.88);
    ctx.bezierCurveTo(-r * 0.92, r * 0.44, -r * 0.9, -r * 0.42, 0, -r * 0.96);
    ctx.closePath();

    // Sunny Lemon 3D Radial Gradient
    const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.22, r * 0.08, 0, 0, r * 0.98);
    grad.addColorStop(0, '#FFFF8D');     // Bright buttercup shine
    grad.addColorStop(0.32, '#FFEA00');  // Pure lemon yellow
    grad.addColorStop(0.72, '#FFD600');  // Warm golden honey
    grad.addColorStop(1, '#E65100');     // Golden-brown rim shadow
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Rim Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.stroke();

    // Curved Crest Specular Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.24, -r * 0.28, r * 0.32, r * 0.15, -Math.PI / 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Apex Sparkle Spot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.68, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 4. GREEN CANDY: PILLOW SQUARE
  // ==========================================
  private static drawPillowSquare(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);

    const s = r * 0.78;
    const corner = r * 0.34;

    // Heavily rounded puffed square
    ctx.beginPath();
    ctx.moveTo(-s + corner, -s);
    ctx.lineTo(s - corner, -s);
    ctx.quadraticCurveTo(s, -s, s, -s + corner);
    ctx.lineTo(s - corner, s);
    ctx.quadraticCurveTo(s, s, s - corner, s);
    ctx.lineTo(-s + corner, s);
    ctx.quadraticCurveTo(-s, s, -s, s - corner);
    ctx.lineTo(-s, -s + corner);
    ctx.quadraticCurveTo(-s, -s, -s + corner, -s);
    ctx.closePath();

    // Fresh Green Apple 3D Radial Gradient
    const grad = ctx.createRadialGradient(-s * 0.32, -s * 0.32, r * 0.08, 0, 0, r * 1.05);
    grad.addColorStop(0, '#B9F6CA');     // Minty frosted highlight
    grad.addColorStop(0.3, '#00E676');   // Bright apple green
    grad.addColorStop(0.72, '#00C853');  // Rich emerald green
    grad.addColorStop(1, '#1B5E20');     // Deep forest border
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Glass Rim Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.stroke();

    // Puffed Pillow Dome Specular Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.22, -s * 0.32, s * 0.42, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corner Gloss Dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(-s * 0.42, -s * 0.42, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 5. BLUE CANDY: JAWBREAKER SPHERE
  // ==========================================
  private static drawBlueSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);

    const rad = r * 0.86;

    // Smooth sphere
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.closePath();

    // Deep Azure Orb 3D Radial Gradient
    const grad = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, rad * 0.08, 0, 0, rad);
    grad.addColorStop(0, '#E0F7FA');     // Ice white specular top
    grad.addColorStop(0.28, '#00E5FF');  // Bright electric cyan
    grad.addColorStop(0.68, '#0288D1');  // Deep ocean sapphire
    grad.addColorStop(1, '#0D47A1');     // Royal navy shadow rim
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Rim Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.stroke();

    // Elegant candy swirl motif
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.beginPath();
    ctx.arc(rad * 0.08, rad * 0.08, rad * 0.5, 0.2, Math.PI * 1.3);
    ctx.stroke();

    // Sharp Circular Specular Glare
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(-rad * 0.32, -rad * 0.34, rad * 0.3, rad * 0.16, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Pinpoint Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-rad * 0.42, -rad * 0.44, rad * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 6. PURPLE CANDY: GRAPE CLUSTER GEM
  // ==========================================
  private static drawPurpleCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);

    const rad = r * 0.86;
    const sides = 6;

    // Beveled hexagonal gem
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = Math.cos(angle) * rad;
      const py = Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Royal Violet 3D Radial Gradient
    const grad = ctx.createRadialGradient(-rad * 0.28, -rad * 0.28, r * 0.08, 0, 0, rad);
    grad.addColorStop(0, '#F3E8FF');     // Lavender frost
    grad.addColorStop(0.3, '#D500F9');   // Vibrant purple orchid
    grad.addColorStop(0.72, '#7B1FA2');  // Royal amethyst
    grad.addColorStop(1, '#4A148C');     // Deep midnight plum rim
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Rim Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.stroke();

    // Gem Facet Inner Bevel Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
      ctx.stroke();
    }

    // Top Specular Gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-rad * 0.24, -rad * 0.32, rad * 0.32, rad * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 7. COLOR BOMB: CHOCOLATE DISCO SPRINKLE BALL
  // ==========================================
  public static drawColorBomb(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time = 0) {
    ctx.save();
    ctx.translate(cx, cy);

    const rad = r * 0.9;

    // Pulsing Outer Rainbow Aura
    const pulse = 1 + Math.sin(time * 0.005) * 0.08;
    const auraGrad = ctx.createRadialGradient(0, 0, rad * 0.5, 0, 0, rad * 1.38 * pulse);
    auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    auraGrad.addColorStop(0.4, 'rgba(255, 42, 109, 0.3)');
    auraGrad.addColorStop(0.75, 'rgba(5, 217, 232, 0.2)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rad * 1.38 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Rich Dark Belgian Chocolate Sphere
    const chocGrad = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, rad * 0.08, 0, 0, rad);
    chocGrad.addColorStop(0, '#6D4C41');    // Light cocoa top highlight
    chocGrad.addColorStop(0.45, '#3E2723'); // Dark milk chocolate
    chocGrad.addColorStop(0.85, '#26140D'); // Bitter dark cocoa
    chocGrad.addColorStop(1, '#150A05');    // Truffle shadow rim

    ctx.fillStyle = chocGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();

    // Chocolate Rim Stroke
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rainbow Sprinkles on the chocolate ball (3D shaded spheres!)
    const sprinkles: { x: number; y: number; color: string; highlight: string; size: number }[] = [
      { x: -rad * 0.48, y: -rad * 0.38, color: '#FF1744', highlight: '#FF8A80', size: rad * 0.18 }, // Red
      { x: rad * 0.32, y: -rad * 0.52, color: '#00E5FF', highlight: '#84FFFF', size: rad * 0.17 },  // Cyan
      { x: -rad * 0.58, y: rad * 0.18, color: '#00E676', highlight: '#B9F6CA', size: rad * 0.18 },  // Green
      { x: rad * 0.46, y: rad * 0.22, color: '#FFEA00', highlight: '#FFFF8D', size: rad * 0.19 },  // Yellow
      { x: -rad * 0.18, y: rad * 0.56, color: '#FF9100', highlight: '#FFE082', size: rad * 0.18 },  // Orange
      { x: rad * 0.26, y: rad * 0.58, color: '#D500F9', highlight: '#EA80FC', size: rad * 0.18 },  // Purple
      { x: 0, y: -rad * 0.58, color: '#FFFFFF', highlight: '#FFFFFF', size: rad * 0.16 },          // White
      { x: -rad * 0.36, y: -rad * 0.02, color: '#FF4081', highlight: '#FF80AB', size: rad * 0.16 },// Pink
      { x: rad * 0.52, y: -rad * 0.12, color: '#2979FF', highlight: '#82B1FF', size: rad * 0.17 }, // Blue
      { x: rad * 0.06, y: rad * 0.28, color: '#76FF03', highlight: '#CCFF90', size: rad * 0.16 },  // Lime
    ];

    for (const sp of sprinkles) {
      // 3D sprinkle ball
      const spGrad = ctx.createRadialGradient(sp.x - sp.size * 0.3, sp.y - sp.size * 0.3, sp.size * 0.1, sp.x, sp.y, sp.size);
      spGrad.addColorStop(0, sp.highlight);
      spGrad.addColorStop(0.4, sp.color);
      spGrad.addColorStop(1, 'rgba(0,0,0,0.5)');

      ctx.fillStyle = spGrad;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();

      // Sprinkle glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(sp.x - sp.size * 0.32, sp.y - sp.size * 0.32, sp.size * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Golden Magical Core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad * 0.32);
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.45, '#FFD700');
    coreGrad.addColorStop(0.85, 'rgba(255, 171, 0, 0.5)');
    coreGrad.addColorStop(1, 'rgba(255, 171, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Top Chocolate Specular Glare
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-rad * 0.35, -rad * 0.35, rad * 0.28, rad * 0.14, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 8. STRIPED CANDIES: ENERGETIC WHITE STRIPES
  // ==========================================
  private static drawStripes(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    isHorizontal: boolean,
    time = 0
  ) {
    ctx.save();
    ctx.translate(cx, cy);

    const stripeWidth = r * 0.22;
    const offsets = [-r * 0.45, 0, r * 0.45];

    // Pulsing energetic glow
    const pulse = 1 + Math.sin(time * 0.008) * 0.1;

    // 1. Soft Outer Laser Glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = stripeWidth * 1.6 * pulse;
    ctx.lineCap = 'round';
    for (const off of offsets) {
      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(-r * 0.72, off);
        ctx.lineTo(r * 0.72, off);
      } else {
        ctx.moveTo(off, -r * 0.72);
        ctx.lineTo(off, r * 0.72);
      }
      ctx.stroke();
    }

    // 2. High-Contrast White Stripes
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = stripeWidth;
    for (const off of offsets) {
      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(-r * 0.72, off);
        ctx.lineTo(r * 0.72, off);
      } else {
        ctx.moveTo(off, -r * 0.72);
        ctx.lineTo(off, r * 0.72);
      }
      ctx.stroke();
    }

    // 3. Central Luminous Core
    ctx.strokeStyle = '#FFFDE7';
    ctx.lineWidth = stripeWidth * 0.45;
    for (const off of offsets) {
      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(-r * 0.68, off);
        ctx.lineTo(r * 0.68, off);
      } else {
        ctx.moveTo(off, -r * 0.68);
        ctx.lineTo(off, r * 0.68);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================
  // 9. WRAPPED CANDIES: CELLOPHANE PACKET & BOW
  // ==========================================
  private static drawWrapper(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    theme: typeof CANDY_THEME[CandyColor],
    time = 0
  ) {
    ctx.save();
    ctx.translate(cx, cy);

    // Flared crinkled wrapper wings on 4 corners
    const wingSize = r * 0.52;
    const corners = [
      { x: -r * 0.72, y: -r * 0.72, rot: -Math.PI / 4 },
      { x: r * 0.72, y: -r * 0.72, rot: Math.PI / 4 },
      { x: -r * 0.72, y: r * 0.72, rot: -3 * Math.PI / 4 },
      { x: r * 0.72, y: r * 0.72, rot: 3 * Math.PI / 4 },
    ];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;

    for (const c of corners) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      // Crinkled wrapper wing with pleats
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-wingSize * 0.7, -wingSize);
      ctx.lineTo(-wingSize * 0.35, -wingSize * 0.85);
      ctx.lineTo(0, -wingSize);
      ctx.lineTo(wingSize * 0.35, -wingSize * 0.85);
      ctx.lineTo(wingSize * 0.7, -wingSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Translucent cellophane highlight over body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Golden Confectionery Ribbon Band
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = Math.max(3, r * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    // Golden Bow Knot in center
    ctx.fillStyle = '#FFE082';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // 10. JELLY LAYER: SHIMMERING GELATIN
  // ==========================================
  public static drawJelly(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    layers: number,
    time = 0
  ) {
    const pad = 3;
    const s = size - pad * 2;
    const wobble = Math.sin(time * 0.005) * 1.5;

    ctx.save();
    // Translucent gelatin fill
    ctx.fillStyle = layers === 2 
      ? 'rgba(219, 39, 119, 0.75)'  // Double Jelly: Rich raspberry plum
      : 'rgba(244, 114, 182, 0.52)'; // Single Jelly: Translucent strawberry

    roundRectPath(ctx, x + pad, y + pad, s, s, 14);
    ctx.fill();

    // Jelly Surface Sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.beginPath();
    ctx.ellipse(x + pad + s * 0.35 + wobble, y + pad + s * 0.28, s * 0.32, s * 0.15, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Jelly Border
    ctx.strokeStyle = layers === 2 ? '#E11D48' : '#F43F5E';
    ctx.lineWidth = layers === 2 ? 3.5 : 2;
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // 11. FROSTING BLOCKER: ICED BISCUIT
  // ==========================================
  public static drawFrosting(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    layers: number
  ) {
    const pad = 3;
    const s = size - pad * 2;

    ctx.save();
    // Graham Cracker Cookie Base
    ctx.fillStyle = '#B45309';
    roundRectPath(ctx, x + pad, y + pad, s, s, 12);
    ctx.fill();

    // Toasted Crust
    ctx.fillStyle = '#D97706';
    roundRectPath(ctx, x + pad + 2, y + pad + 2, s - 4, s - 4, 10);
    ctx.fill();

    // White Vanilla Meringue Icing
    ctx.fillStyle = layers === 3 ? '#FFFFFF' : layers === 2 ? '#F1F5F9' : '#E2E8F0';
    roundRectPath(ctx, x + pad + 5, y + pad + 5, s - 10, s - 10, 8);
    ctx.fill();

    // Multi-hit Cracks
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (layers <= 2) {
      ctx.moveTo(x + s * 0.28, y + s * 0.32);
      ctx.lineTo(x + s * 0.58, y + s * 0.68);
    }
    if (layers === 1) {
      ctx.moveTo(x + s * 0.72, y + s * 0.28);
      ctx.lineTo(x + s * 0.38, y + s * 0.82);
    }
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // 12. CHOCOLATE BLOCKER: 4-QUADRANT BAR
  // ==========================================
  public static drawChocolate(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    const pad = 3;
    const s = size - pad * 2;

    ctx.save();
    // Dark cocoa base
    ctx.fillStyle = '#271714';
    roundRectPath(ctx, x + pad, y + pad, s, s, 12);
    ctx.fill();

    // 4 mini beveled quadrants
    const half = (s - 8) / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const qx = x + pad + 3 + c * (half + 2);
        const qy = y + pad + 3 + r * (half + 2);

        // Cocoa quadrant
        ctx.fillStyle = '#4E342E';
        roundRectPath(ctx, qx, qy, half, half, 5);
        ctx.fill();

        // Quadrant light bevel
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(qx + 1, qy + 1, half - 2, 3);
        ctx.fillRect(qx + 1, qy + 1, 3, half - 2);

        // Quadrant dark groove
        ctx.fillStyle = '#1B0E0A';
        ctx.fillRect(qx + 1, qy + half - 2, half - 2, 2);
        ctx.fillRect(qx + half - 2, qy + 1, 2, half - 2);
      }
    }

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    roundRectPath(ctx, x + pad, y + pad, s, s, 12);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // 13. INGREDIENTS: CHERRIES & HAZELNUT
  // ==========================================
  private static drawIngredient(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    type: IngredientType = 'CHERRY'
  ) {
    ctx.save();
    ctx.translate(cx, cy);

    if (type === 'CHERRY') {
      const cherryR = r * 0.44;

      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Left cherry
      const grad1 = ctx.createRadialGradient(-r * 0.35, r * 0.18, cherryR * 0.08, -r * 0.3, r * 0.24, cherryR);
      grad1.addColorStop(0, '#FF8A80');
      grad1.addColorStop(0.35, '#D50000');
      grad1.addColorStop(1, '#5C0011');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(-r * 0.3, r * 0.24, cherryR, 0, Math.PI * 2);
      ctx.fill();

      // Right cherry
      const grad2 = ctx.createRadialGradient(r * 0.3, r * 0.28, cherryR * 0.08, r * 0.32, r * 0.34, cherryR);
      grad2.addColorStop(0, '#FF8A80');
      grad2.addColorStop(0.35, '#C62828');
      grad2.addColorStop(1, '#4E0D14');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(r * 0.32, r * 0.34, cherryR, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Curved Green Stems
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, r * 0.1);
      ctx.quadraticCurveTo(-r * 0.15, -r * 0.5, 0, -r * 0.82);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(r * 0.32, r * 0.18);
      ctx.quadraticCurveTo(r * 0.15, -r * 0.45, 0, -r * 0.82);
      ctx.stroke();

      // Top green leaf
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(r * 0.2, -r * 0.82, r * 0.26, r * 0.12, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Specular glares on cherries
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(-r * 0.42, r * 0.14, cherryR * 0.26, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(r * 0.2, r * 0.24, cherryR * 0.26, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // HAZELNUT: 3D Acorn Nut
      const nutR = r * 0.78;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Golden Nut Body
      ctx.beginPath();
      ctx.moveTo(0, nutR);
      ctx.bezierCurveTo(nutR * 0.9, nutR * 0.3, nutR * 0.85, -nutR * 0.3, 0, -nutR * 0.2);
      ctx.bezierCurveTo(-nutR * 0.85, -nutR * 0.3, -nutR * 0.9, nutR * 0.3, 0, nutR);
      ctx.closePath();

      const nutGrad = ctx.createRadialGradient(-nutR * 0.25, nutR * 0.2, nutR * 0.1, 0, nutR * 0.3, nutR);
      nutGrad.addColorStop(0, '#FFE082');
      nutGrad.addColorStop(0.35, '#B45309');
      nutGrad.addColorStop(1, '#451A03');
      ctx.fillStyle = nutGrad;
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Textured Acorn Cup / Cap
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.ellipse(0, -nutR * 0.3, nutR * 0.78, nutR * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Acorn Stem
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -nutR * 0.3);
      ctx.lineTo(0, -nutR * 0.78);
      ctx.stroke();

      // Nut Shell Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(-nutR * 0.25, nutR * 0.25, nutR * 0.35, nutR * 0.14, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================
  // 14. LIGHTNING ZAP (COLOR BOMB BEAM)
  // ==========================================
  public static drawLightningZap(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) {
    ctx.save();

    // Outer Glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    const segments = 5;
    const dx = (toX - fromX) / segments;
    const dy = (toY - fromY) / segments;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    for (let i = 1; i < segments; i++) {
      const jx = fromX + dx * i + (Math.random() - 0.5) * 16;
      const jy = fromY + dy * i + (Math.random() - 0.5) * 16;
      ctx.lineTo(jx, jy);
    }
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Core White Laser Beam
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.restore();
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
