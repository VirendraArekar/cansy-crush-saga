import React, { useEffect, useRef, useState } from 'react';
import { Tile, GridPosition } from '../../engine/types';
import { CandyRenderer } from '../../engine/CandyRenderer';
import { SwapValidator } from '../../engine/SwapValidator';
import { visualBoard } from '../../engine/VisualBoard';

interface ZapRay {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  life: number;
}

interface GameCanvasProps {
  grid: Tile[][];
  selectedTile: GridPosition | null;
  onTileClick: (pos: GridPosition) => void;
  isAnimating: boolean;
  activeBooster: string | null;
  onSwapMove?: (from: GridPosition, to: GridPosition) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  grid,
  selectedTile,
  onTileClick,
  isAnimating,
  activeBooster,
  onSwapMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active drag state
  const dragRef = useRef<{
    active: boolean;
    startPos: GridPosition;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    targetNeighbor: GridPosition | null;
  } | null>(null);

  // Active zap rays for Color Bomb
  const zapRaysRef = useRef<ZapRay[]>([]);

  // Idle Hint Timer
  const [hintTiles, setHintTiles] = useState<GridPosition[] | null>(null);
  const idleTimerRef = useRef<any>(null);

  const rows = grid.length || 8;
  const cols = grid[0]?.length || 8;

  // Sync visual board whenever grid data changes
  useEffect(() => {
    if (grid.length > 0) {
      visualBoard.syncFromGrid(grid);
    }
  }, [grid]);

  // Reset and start idle hint timer
  useEffect(() => {
    setHintTiles(null);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (!isAnimating && grid.length > 0) {
      idleTimerRef.current = setTimeout(() => {
        const moves = SwapValidator.findPossibleMoves(grid);
        if (moves.length > 0) {
          const m = moves[0];
          setHintTiles([m.from, m.to]);
        }
      }, 4200);
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [grid, isAnimating]);

  // Main Canvas 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      const width = canvas.width;
      const height = canvas.height;
      const tileSize = Math.min(width / cols, height / rows);
      const offsetX = (width - cols * tileSize) / 2;
      const offsetY = (height - rows * tileSize) / 2;

      // Keep visual board geometry synchronized
      visualBoard.updateGeometry(tileSize, offsetX, offsetY);
      visualBoard.update();

      // 1. Clear canvas
      ctx.clearRect(0, 0, width, height);

      // 2. Draw Board Background Tiles & Static Blockers
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = grid[r]?.[c];
          if (!tile || !tile.isPlayable) continue;

          const x = offsetX + c * tileSize;
          const y = offsetY + r * tileSize;
          const pad = 3;
          const innerSize = tileSize - pad * 2;

          // Authentic Wafer / Gingerbread Socket Pattern
          const isEven = (r + c) % 2 === 0;

          // Socket Base
          ctx.save();
          ctx.fillStyle = isEven ? '#24140C' : '#331B10';
          roundRect(ctx, x + pad, y + pad, innerSize, innerSize, 12);
          ctx.fill();

          // 3D Wafer Tile Surface
          const waferGrad = ctx.createLinearGradient(x + pad, y + pad, x + pad + innerSize, y + pad + innerSize);
          if (isEven) {
            waferGrad.addColorStop(0, '#532F1A');
            waferGrad.addColorStop(1, '#3B1F0F');
          } else {
            waferGrad.addColorStop(0, '#663B22');
            waferGrad.addColorStop(1, '#4A2714');
          }
          ctx.fillStyle = waferGrad;
          roundRect(ctx, x + pad + 2, y + pad + 2, innerSize - 4, innerSize - 4, 10);
          ctx.fill();

          // 3D Inner Socket Bevel
          ctx.strokeStyle = 'rgba(255, 230, 180, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Subtle wafer waffle crosshatch indent
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + pad + innerSize * 0.35, y + pad + 3);
          ctx.lineTo(x + pad + innerSize * 0.35, y + pad + innerSize - 3);
          ctx.moveTo(x + pad + innerSize * 0.65, y + pad + 3);
          ctx.lineTo(x + pad + innerSize * 0.65, y + pad + innerSize - 3);
          ctx.moveTo(x + pad + 3, y + pad + innerSize * 0.35);
          ctx.lineTo(x + pad + innerSize - 3, y + pad + innerSize * 0.35);
          ctx.moveTo(x + pad + 3, y + pad + innerSize * 0.65);
          ctx.lineTo(x + pad + innerSize - 3, y + pad + innerSize * 0.65);
          ctx.stroke();
          ctx.restore();

          // Jelly layer underneath candies
          if (tile.jellyLayer > 0) {
            CandyRenderer.drawJelly(ctx, x, y, tileSize, tile.jellyLayer, elapsed);
          }

          // Golden selection border on selected tile
          if (selectedTile && selectedTile.row === r && selectedTile.col === c) {
            ctx.save();
            ctx.strokeStyle = '#FBBF24';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#FBBF24';
            ctx.shadowBlur = 12;
            roundRect(ctx, x + pad, y + pad, innerSize, innerSize, 14);
            ctx.stroke();
            ctx.restore();
          }

          // Idle Hint Pulse/Wobble
          const isHinted = hintTiles?.some(h => h.row === r && h.col === c);
          if (isHinted && !selectedTile) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
            ctx.lineWidth = 2.5;
            roundRect(ctx, x + pad, y + pad, innerSize, innerSize, 12);
            ctx.stroke();
          }

          // Frosting blocker (drawn over tile)
          if (tile.frostingLayer > 0) {
            CandyRenderer.drawFrosting(ctx, x, y, tileSize, tile.frostingLayer);
          }

          // Chocolate blocker (drawn over tile)
          if (tile.hasChocolate) {
            CandyRenderer.drawChocolate(ctx, x, y, tileSize);
          }
        }
      }

      // 3. Render all Candies from VisualBoard (smooth continuous coordinates)
      for (const c of visualBoard.candies.values()) {
        const cx = c.x + (c.dragOffsetX || 0);
        const cy = c.y + (c.dragOffsetY || 0);
        const radius = (tileSize * 0.42) * c.scale;

        const isHinted = hintTiles?.some(h => h.row === c.row && h.col === c.col);
        let wobbleScale = 1;
        if (isHinted && !c.isFalling && !c.isSwapping && !selectedTile) {
          wobbleScale = 1 + Math.sin(elapsed * 0.008) * 0.08;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, c.alpha));

        CandyRenderer.renderCandy(
          ctx,
          cx,
          cy,
          radius,
          {
            id: c.id,
            key: c.key || c.id,
            color: c.color,
            special: c.special,
            row: c.row,
            col: c.col,
            isIngredient: c.isIngredient,
            ingredientType: c.ingredientType,
          },
          wobbleScale,
          elapsed
        );

        ctx.restore();
      }

      // 4. Draw Color Bomb Lightning Zaps
      for (let i = zapRaysRef.current.length - 1; i >= 0; i--) {
        const ray = zapRaysRef.current[i];
        CandyRenderer.drawLightningZap(ctx, ray.fromX, ray.fromY, ray.toX, ray.toY, ray.color);
        ray.life--;
        if (ray.life <= 0) {
          zapRaysRef.current.splice(i, 1);
        }
      }

      // 5. Update & Render Particles
      visualBoard.particleEngine.update();
      visualBoard.particleEngine.render(ctx);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [grid, selectedTile, hintTiles, rows, cols]);

  // Coordinate Conversion: Screen to Internal Canvas (640x640)
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const getTileFromCoords = (px: number, py: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const tileSize = Math.min(canvas.width / cols, canvas.height / rows);
    const offsetX = (canvas.width - cols * tileSize) / 2;
    const offsetY = (canvas.height - rows * tileSize) / 2;

    const c = Math.floor((px - offsetX) / tileSize);
    const r = Math.floor((py - offsetY) / tileSize);

    if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r]?.[c]?.isPlayable) {
      return { row: r, col: c };
    }
    return null;
  };

  // --- TOUCH & POINTER INTERACTIONS ---

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isAnimating || visualBoard.isBusy) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    const tilePos = getTileFromCoords(coords.x, coords.y);
    if (!tilePos) return;

    const targetTile = grid[tilePos.row]?.[tilePos.col];
    if (!targetTile?.isPlayable) return;

    // Active Booster: immediate action on tap
    if (activeBooster) {
      onTileClick(tilePos);
      return;
    }

    // Capture pointer for smooth dragging across canvas bounds
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      active: true,
      startPos: tilePos,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      targetNeighbor: null,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current || !dragRef.current.active || isAnimating || visualBoard.isBusy) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    dragRef.current.currentX = coords.x;
    dragRef.current.currentY = coords.y;

    const dx = coords.x - dragRef.current.startX;
    const dy = coords.y - dragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 6) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const tileSize = Math.min(canvas.width / cols, canvas.height / rows);
    const maxDrag = tileSize * 0.85;

    // 8-directional angle mapping (Right, Down-Right, Down, Down-Left, Left, Up-Left, Up, Up-Right)
    const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    const sector = Math.round(deg / 45) % 8;

    const DIRECTION_OFFSETS = [
      { r: 0, c: 1 },   // 0: Right (0 deg)
      { r: 1, c: 1 },   // 1: Down-Right (45 deg)
      { r: 1, c: 0 },   // 2: Down (90 deg)
      { r: 1, c: -1 },  // 3: Down-Left (135 deg)
      { r: 0, c: -1 },  // 4: Left (180 deg)
      { r: -1, c: -1 }, // 5: Up-Left (225 deg)
      { r: -1, c: 0 },  // 6: Up (270 deg)
      { r: -1, c: 1 },  // 7: Up-Right (315 deg)
    ];

    const offset = DIRECTION_OFFSETS[sector];
    const { startPos } = dragRef.current;
    const neighborRow = startPos.row + offset.r;
    const neighborCol = startPos.col + offset.c;

    let neighborPos: GridPosition | null = null;
    if (
      neighborRow >= 0 && neighborRow < rows &&
      neighborCol >= 0 && neighborCol < cols &&
      grid[neighborRow]?.[neighborCol]?.isPlayable &&
      grid[neighborRow]?.[neighborCol]?.candy !== null
    ) {
      neighborPos = { row: neighborRow, col: neighborCol };
    }

    dragRef.current.targetNeighbor = neighborPos;

    // Clamp drag distance along vector in any direction
    const clampedDist = Math.min(maxDrag, dist);
    const rad = Math.atan2(dy, dx);
    const clampedDx = Math.cos(rad) * clampedDist;
    const clampedDy = Math.sin(rad) * clampedDist;

    // Live real-time candy offset under finger in any direction!
    visualBoard.setDragOffset(startPos, neighborPos, clampedDx, clampedDy);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current || !dragRef.current.active) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const { startPos, targetNeighbor, startX, startY, currentX, currentY } = dragRef.current;
    dragRef.current = null;
    visualBoard.clearDragOffsets();

    if (isAnimating || visualBoard.isBusy) return;

    const dx = currentX - startX;
    const dy = currentY - startY;
    const dist = Math.hypot(dx, dy);

    const canvas = canvasRef.current;
    const tileSize = canvas ? Math.min(canvas.width / cols, canvas.height / rows) : 70;
    const swipeThreshold = tileSize * 0.35;

    // Case 1: Drag swipe exceeded threshold
    if (dist >= swipeThreshold && targetNeighbor) {
      if (onSwapMove) {
        onSwapMove(startPos, targetNeighbor);
      } else {
        onTileClick(startPos);
        onTileClick(targetNeighbor);
      }
      return;
    }

    // Case 2: Tap / Click
    if (dist < 12) {
      onTileClick(startPos);
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[min(460px,calc(100vh-220px))] mx-auto p-1.5 md:p-2 rounded-3xl bg-gradient-to-b from-amber-950/95 via-stone-900/95 to-slate-950/95 backdrop-blur-md shadow-[0_15px_45px_rgba(0,0,0,0.85),inset_0_2px_10px_rgba(255,215,0,0.25)] border-4 border-amber-500/70 flex items-center justify-center select-none touch-none">
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`w-full h-full rounded-2xl cursor-pointer ${
          activeBooster ? 'cursor-crosshair' : ''
        }`}
      />
    </div>
  );
};

function roundRect(
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
