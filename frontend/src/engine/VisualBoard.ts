import { 
  Tile, 
  GridPosition, 
  CandyColor, 
  SpecialType, 
  IngredientType, 
  CascadeStep 
} from './types';
import { ParticleEngine } from './ParticleEngine';
import { SoundEngine } from './SoundEngine';

const safeRAF = (cb: (time: number) => void): number => {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(cb);
  }
  return setTimeout(() => cb(Date.now()), 16) as unknown as number;
};

export interface VisualCandy {
  id: string;
  key?: string;
  color: CandyColor;
  special: SpecialType;
  isIngredient?: boolean;
  ingredientType?: IngredientType;
  row: number;
  col: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  dragOffsetX?: number;
  dragOffsetY?: number;
  scale: number;
  targetScale: number;
  alpha: number;
  targetAlpha: number;
  vy: number;
  isFalling: boolean;
  isClearing: boolean;
  isSwapping: boolean;
  bounced?: boolean;
}

export class VisualBoard {
  public candies: Map<string, VisualCandy> = new Map();
  public isBusy = false;
  public tileSize = 70;
  public offsetX = 0;
  public offsetY = 0;
  public particleEngine: ParticleEngine = new ParticleEngine();

  /**
   * Updates board geometry dimensions from canvas rendering.
   */
  public updateGeometry(tileSize: number, offsetX: number, offsetY: number) {
    const changed = 
      Math.abs(this.tileSize - tileSize) > 0.5 ||
      Math.abs(this.offsetX - offsetX) > 0.5 ||
      Math.abs(this.offsetY - offsetY) > 0.5;

    this.tileSize = tileSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    if (changed) {
      for (const c of this.candies.values()) {
        const tx = offsetX + c.col * tileSize + tileSize / 2;
        const ty = offsetY + c.row * tileSize + tileSize / 2;
        c.targetX = tx;
        c.targetY = ty;
        if (!c.isFalling && !c.isSwapping && !c.isClearing) {
          c.x = tx;
          c.y = ty;
        }
      }
    }
  }

  /**
   * Synchronizes the visual candies collection with the logical grid.
   * If forceReset is true, instantaneously aligns all candies.
   */
  public syncFromGrid(grid: Tile[][], forceReset = false) {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const currentIds = new Set<string>();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = grid[r]?.[c];
        const candy = tile?.candy;
        if (!candy) continue;

        currentIds.add(candy.id);
        const targetX = this.offsetX + c * this.tileSize + this.tileSize / 2;
        const targetY = this.offsetY + r * this.tileSize + this.tileSize / 2;

        const existing = this.candies.get(candy.id);
        if (existing) {
          existing.row = r;
          existing.col = c;
          existing.color = candy.color;
          existing.special = candy.special;
          existing.isIngredient = candy.isIngredient;
          existing.ingredientType = candy.ingredientType;
          existing.key = candy.key || candy.id;
          existing.targetX = targetX;
          existing.targetY = targetY;

          if (forceReset || (!existing.isSwapping && !existing.isFalling && !existing.isClearing)) {
            existing.x = targetX;
            existing.y = targetY;
            existing.scale = 1;
            existing.targetScale = 1;
            existing.alpha = 1;
            existing.targetAlpha = 1;
            existing.vy = 0;
            existing.isFalling = false;
            existing.isSwapping = false;
            existing.dragOffsetX = 0;
            existing.dragOffsetY = 0;
          }
        } else {
          this.candies.set(candy.id, {
            id: candy.id,
            key: candy.key || candy.id,
            color: candy.color,
            special: candy.special,
            isIngredient: candy.isIngredient,
            ingredientType: candy.ingredientType,
            row: r,
            col: c,
            x: targetX,
            y: targetY,
            targetX,
            targetY,
            dragOffsetX: 0,
            dragOffsetY: 0,
            scale: 1,
            targetScale: 1,
            alpha: 1,
            targetAlpha: 1,
            vy: 0,
            isFalling: false,
            isClearing: false,
            isSwapping: false,
          });
        }
      }
    }

    // Remove candies no longer on the board unless currently animating clear
    for (const [id, c] of this.candies.entries()) {
      if (!currentIds.has(id) && !c.isClearing) {
        this.candies.delete(id);
      }
    }
  }

  /**
   * Animates a smooth sliding swap between two tiles.
   */
  public animateSwap(
    posA: GridPosition, 
    posB: GridPosition, 
    durationMs = 180
  ): Promise<void> {
    this.isBusy = true;
    this.clearDragOffsets();

    const candyA = Array.from(this.candies.values()).find(
      c => c.row === posA.row && c.col === posA.col && !c.isClearing
    );
    const candyB = Array.from(this.candies.values()).find(
      c => c.row === posB.row && c.col === posB.col && !c.isClearing
    );

    if (!candyA || !candyB) {
      this.isBusy = false;
      return Promise.resolve();
    }

    const ax = this.offsetX + posA.col * this.tileSize + this.tileSize / 2;
    const ay = this.offsetY + posA.row * this.tileSize + this.tileSize / 2;
    const bx = this.offsetX + posB.col * this.tileSize + this.tileSize / 2;
    const by = this.offsetY + posB.row * this.tileSize + this.tileSize / 2;

    candyA.isSwapping = true;
    candyA.targetX = bx;
    candyA.targetY = by;

    candyB.isSwapping = true;
    candyB.targetX = ax;
    candyB.targetY = ay;

    return new Promise((resolve) => {
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Smooth sine ease in-out
        const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);

        candyA.x = ax + (bx - ax) * ease;
        candyA.y = ay + (by - ay) * ease;

        candyB.x = bx + (ax - bx) * ease;
        candyB.y = by + (ay - by) * ease;

        if (progress < 1) {
          safeRAF(step);
        } else {
          candyA.x = bx;
          candyA.y = by;
          candyA.row = posB.row;
          candyA.col = posB.col;
          candyA.isSwapping = false;

          candyB.x = ax;
          candyB.y = ay;
          candyB.row = posA.row;
          candyB.col = posA.col;
          candyB.isSwapping = false;

          this.isBusy = false;
          resolve();
        }
      };

      safeRAF(step);
    });
  }

  /**
   * Animates candies sliding towards each other, hitting elastic resistance,
   * and smoothly sliding back to home position (authentic Candy Crush invalid swap).
   */
  public animateInvalidSwap(
    posA: GridPosition, 
    posB: GridPosition, 
    durationMs = 280
  ): Promise<void> {
    this.isBusy = true;
    this.clearDragOffsets();
    SoundEngine.playInvalidSwap();

    const candyA = Array.from(this.candies.values()).find(
      c => c.row === posA.row && c.col === posA.col && !c.isClearing
    );
    const candyB = Array.from(this.candies.values()).find(
      c => c.row === posB.row && c.col === posB.col && !c.isClearing
    );

    if (!candyA || !candyB) {
      this.isBusy = false;
      return Promise.resolve();
    }

    const ax = this.offsetX + posA.col * this.tileSize + this.tileSize / 2;
    const ay = this.offsetY + posA.row * this.tileSize + this.tileSize / 2;
    const bx = this.offsetX + posB.col * this.tileSize + this.tileSize / 2;
    const by = this.offsetY + posB.row * this.tileSize + this.tileSize / 2;

    candyA.isSwapping = true;
    candyB.isSwapping = true;

    return new Promise((resolve) => {
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / durationMs);

        // Sinusoidal arc peaking at 72% slide distance
        const curve = Math.sin(p * Math.PI) * 0.72;

        candyA.x = ax + (bx - ax) * curve;
        candyA.y = ay + (by - ay) * curve;

        candyB.x = bx + (ax - bx) * curve;
        candyB.y = by + (ay - by) * curve;

        if (p < 1) {
          safeRAF(step);
        } else {
          candyA.x = ax;
          candyA.y = ay;
          candyA.isSwapping = false;

          candyB.x = bx;
          candyB.y = by;
          candyB.isSwapping = false;

          this.isBusy = false;
          resolve();
        }
      };

      safeRAF(step);
    });
  }

  /**
   * Sets real-time drag offsets for interactive dragging between adjacent tiles.
   */
  public setDragOffset(
    posA: GridPosition,
    posB: GridPosition | null,
    dx: number,
    dy: number
  ) {
    const candyA = Array.from(this.candies.values()).find(
      c => c.row === posA.row && c.col === posA.col && !c.isClearing
    );
    if (candyA) {
      candyA.dragOffsetX = dx;
      candyA.dragOffsetY = dy;
    }

    if (posB) {
      const candyB = Array.from(this.candies.values()).find(
        c => c.row === posB.row && c.col === posB.col && !c.isClearing
      );
      if (candyB) {
        candyB.dragOffsetX = -dx;
        candyB.dragOffsetY = -dy;
      }
    }
  }

  /**
   * Clears any active drag offsets.
   */
  public clearDragOffsets() {
    for (const c of this.candies.values()) {
      c.dragOffsetX = 0;
      c.dragOffsetY = 0;
    }
  }

  /**
   * Animates a complete cascade step:
   * Phase 1: Popping & disappearing matched candies with particle explosions.
   * Phase 2: Upper candies smoothly falling down into empty spaces with gravity.
   * Phase 3: New candies spawning above the top and tumbling in with bounce.
   */
  public animateCascadeStep(
    step: CascadeStep,
    particleEngine: ParticleEngine = this.particleEngine
  ): Promise<void> {
    this.isBusy = true;
    this.clearDragOffsets();

    return new Promise((resolve) => {
      // --- PHASE 1: POP & CLEAR MATCHED CANDIES ---
      SoundEngine.playPop();

      for (const cleared of step.clearedCandies) {
        const vc = 
          this.candies.get(cleared.candy.id) ||
          Array.from(this.candies.values()).find(
            c => c.row === cleared.row && c.col === cleared.col && !c.isClearing
          );

        if (vc) {
          vc.isClearing = true;
          vc.targetScale = 0;
          vc.targetAlpha = 0;

          const hex = this.getCandyHex(vc.color);
          particleEngine.createBurst(vc.x, vc.y, hex, 18);

          if (vc.special === 'WRAPPED') {
            particleEngine.createWrappedExplosion(vc.x, vc.y, hex);
          } else if (vc.special === 'STRIPED_H') {
            particleEngine.createStripeBeam(
              this.offsetX, vc.y, 
              this.offsetX + 8 * this.tileSize, vc.y, 
              hex
            );
          } else if (vc.special === 'STRIPED_V') {
            particleEngine.createStripeBeam(
              vc.x, this.offsetY, 
              vc.x, this.offsetY + 8 * this.tileSize, 
              hex
            );
          } else if (vc.special === 'COLOR_BOMB') {
            particleEngine.createRainbowSpiral(vc.x, vc.y);
          }
        }
      }

      // Blocker particle reactions
      for (const jPos of step.clearedJellies) {
        const jx = this.offsetX + jPos.col * this.tileSize + this.tileSize / 2;
        const jy = this.offsetY + jPos.row * this.tileSize + this.tileSize / 2;
        particleEngine.createJellySplash(jx, jy);
      }

      for (const f of step.damagedFrosting) {
        const fx = this.offsetX + f.position.col * this.tileSize + this.tileSize / 2;
        const fy = this.offsetY + f.position.row * this.tileSize + this.tileSize / 2;
        particleEngine.createFrostingCrumb(fx, fy);
      }

      for (const cPos of step.clearedChocolate) {
        const cx = this.offsetX + cPos.col * this.tileSize + this.tileSize / 2;
        const cy = this.offsetY + cPos.row * this.tileSize + this.tileSize / 2;
        particleEngine.createChocolateCrumb(cx, cy);
      }

      for (const ing of step.collectedIngredients) {
        const ix = this.offsetX + ing.position.col * this.tileSize + this.tileSize / 2;
        const iy = this.offsetY + ing.position.row * this.tileSize + this.tileSize / 2;
        particleEngine.createIngredientCollected(ix, iy);
      }

      // Pop duration: 170ms
      setTimeout(() => {
        // Remove cleared visual candies
        for (const [id, c] of this.candies.entries()) {
          if (c.isClearing) {
            this.candies.delete(id);
          }
        }

        // Spawn created specials (4-in-a-row, L/T shapes, 5-in-a-row)
        for (const spec of step.createdSpecials) {
          const targetX = this.offsetX + spec.position.col * this.tileSize + this.tileSize / 2;
          const targetY = this.offsetY + spec.position.row * this.tileSize + this.tileSize / 2;

          this.candies.set(spec.candy.id, {
            id: spec.candy.id,
            key: spec.candy.key || spec.candy.id,
            color: spec.candy.color,
            special: spec.candy.special,
            row: spec.position.row,
            col: spec.position.col,
            x: targetX,
            y: targetY,
            targetX,
            targetY,
            scale: 0.15, // Pops into view
            targetScale: 1,
            alpha: 1,
            targetAlpha: 1,
            vy: 0,
            isFalling: false,
            isClearing: false,
            isSwapping: false,
          });

          particleEngine.createBurst(targetX, targetY, '#FFFFFF', 10);
        }

        // --- PHASE 2: UPPER CANDIES FALLING DOWN ---
        for (const drop of step.drops) {
          const moving = 
            this.candies.get(drop.candyId) ||
            Array.from(this.candies.values()).find(
              c => c.row === drop.fromRow && c.col === drop.col && !c.isClearing
            );

          if (moving) {
            moving.row = drop.toRow;
            moving.targetY = this.offsetY + drop.toRow * this.tileSize + this.tileSize / 2;
            moving.isFalling = true;
            moving.vy = 0;
            moving.bounced = false;
          }
        }

        // --- PHASE 3: NEW CANDIES FALLING FROM ABOVE TOP ---
        const spawnsByCol = new Map<number, typeof step.spawns>();
        for (const sp of step.spawns) {
          if (!spawnsByCol.has(sp.col)) spawnsByCol.set(sp.col, []);
          spawnsByCol.get(sp.col)!.push(sp);
        }

        for (const [col, colSpawns] of spawnsByCol.entries()) {
          // Sort top-most first
          colSpawns.sort((a, b) => a.row - b.row);
          const totalInCol = colSpawns.length;

          colSpawns.forEach((sp, idx) => {
            const targetX = this.offsetX + col * this.tileSize + this.tileSize / 2;
            const targetY = this.offsetY + sp.row * this.tileSize + this.tileSize / 2;

            // Spawn above the board offset cleanly so column falls synchronously
            const startY = Math.min(
              this.offsetY - this.tileSize * 0.4, 
              targetY - (totalInCol + 1.2) * this.tileSize
            );

            this.candies.set(sp.candy.id, {
              id: sp.candy.id,
              key: sp.candy.key || sp.candy.id,
              color: sp.candy.color,
              special: sp.candy.special,
              isIngredient: sp.candy.isIngredient,
              ingredientType: sp.candy.ingredientType,
              row: sp.row,
              col: sp.col,
              x: targetX,
              y: startY,
              targetX,
              targetY,
              scale: 1,
              targetScale: 1,
              alpha: 1,
              targetAlpha: 1,
              vy: 0,
              isFalling: true,
              isClearing: false,
              isSwapping: false,
              bounced: false,
            });
          });
        }

        // Continuous Physics Loop with Gravity and Bounce
        const gravity = 1.45;
        const maxVelocity = 24;
        const bounceDamping = 0.24;

        let safetyGuard = 0;
        const maxFrames = 90; // At most ~1.5 seconds safety window

        const physicsStep = () => {
          safetyGuard++;
          let stillFalling = false;
          let anyJustLanded = false;

          for (const c of this.candies.values()) {
            // Smoothly pop in specials
            if (c.scale !== c.targetScale && !c.isFalling) {
              c.scale += (c.targetScale - c.scale) * 0.25;
              if (Math.abs(c.scale - c.targetScale) < 0.02) c.scale = c.targetScale;
            }

            if (c.isFalling) {
              c.vy = Math.min(maxVelocity, c.vy + gravity);
              c.y += c.vy;

              if (c.y >= c.targetY) {
                c.y = c.targetY;
                if (c.vy > 3.0 && !c.bounced) {
                  // Elastic rebound
                  c.vy = -c.vy * bounceDamping;
                  c.bounced = true;
                  stillFalling = true;
                } else {
                  c.vy = 0;
                  c.isFalling = false;
                  anyJustLanded = true;
                }
              } else {
                stillFalling = true;
              }
            }
          }

          if (anyJustLanded) {
            SoundEngine.playLand();
          }

          if (stillFalling && safetyGuard < maxFrames) {
            safeRAF(physicsStep);
          } else {
            // Safety snap in case of frame timeout
            for (const c of this.candies.values()) {
              c.y = c.targetY;
              c.x = c.targetX;
              c.vy = 0;
              c.isFalling = false;
              c.scale = c.targetScale;
              c.alpha = c.targetAlpha;
            }
            this.isBusy = false;
            resolve();
          }
        };

        safeRAF(physicsStep);
      }, 170);
    });
  }

  /**
   * Frame-by-frame visual candy updates for scales and alphas.
   */
  public update() {
    for (const c of this.candies.values()) {
      if (c.scale !== c.targetScale && !c.isFalling) {
        c.scale += (c.targetScale - c.scale) * 0.25;
        if (Math.abs(c.scale - c.targetScale) < 0.01) c.scale = c.targetScale;
      }
      if (c.alpha !== c.targetAlpha) {
        c.alpha += (c.targetAlpha - c.alpha) * 0.25;
        if (Math.abs(c.alpha - c.targetAlpha) < 0.01) c.alpha = c.targetAlpha;
      }
    }
  }

  public reset() {
    this.candies.clear();
    this.isBusy = false;
  }

  private getCandyHex(color: CandyColor): string {
    switch (color) {
      case 'RED': return '#FF2A6D';
      case 'BLUE': return '#05D9E8';
      case 'GREEN': return '#00E676';
      case 'YELLOW': return '#FFEA00';
      case 'ORANGE': return '#FF8A00';
      case 'PURPLE': return '#9B5DE5';
      default: return '#FFFFFF';
    }
  }
}

export const visualBoard = new VisualBoard();
