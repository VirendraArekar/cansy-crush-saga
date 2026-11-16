import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualBoard } from '../src/engine/VisualBoard';
import { BoardManager } from '../src/engine/BoardManager';
import { getLevelConfig } from '../src/levels/levelCatalog';
import { ParticleEngine } from '../src/engine/ParticleEngine';

describe('VisualBoard Animation Engine', () => {
  let visualBoard: VisualBoard;

  beforeEach(() => {
    visualBoard = new VisualBoard();
    visualBoard.updateGeometry(70, 40, 40);
  });

  it('syncFromGrid accurately creates visual candies matching grid tiles', () => {
    const config = getLevelConfig(1);
    const grid = BoardManager.initializeBoard(config);

    visualBoard.syncFromGrid(grid, true);

    expect(visualBoard.candies.size).toBe(64); // 8x8 playable tiles
    const firstCandy = Array.from(visualBoard.candies.values()).find(c => c.row === 0 && c.col === 0);
    expect(firstCandy).toBeDefined();
    expect(firstCandy?.x).toBe(40 + 0 * 70 + 35);
    expect(firstCandy?.y).toBe(40 + 0 * 70 + 35);
  });

  it('setDragOffset sets real-time offset on primary and target neighbor and clears cleanly', () => {
    const config = getLevelConfig(1);
    const grid = BoardManager.initializeBoard(config);
    visualBoard.syncFromGrid(grid, true);

    visualBoard.setDragOffset({ row: 0, col: 0 }, { row: 0, col: 1 }, 25, 0);

    const candyA = Array.from(visualBoard.candies.values()).find(c => c.row === 0 && c.col === 0);
    const candyB = Array.from(visualBoard.candies.values()).find(c => c.row === 0 && c.col === 1);

    expect(candyA?.dragOffsetX).toBe(25);
    expect(candyB?.dragOffsetX).toBe(-25);

    visualBoard.clearDragOffsets();
    expect(candyA?.dragOffsetX).toBe(0);
    expect(candyB?.dragOffsetX).toBe(0);
  });

  it('animateSwap completes smooth interpolation and swaps row/col tracking', async () => {
    const config = getLevelConfig(1);
    const grid = BoardManager.initializeBoard(config);
    visualBoard.syncFromGrid(grid, true);

    const candyA = Array.from(visualBoard.candies.values()).find(c => c.row === 2 && c.col === 3)!;
    const candyB = Array.from(visualBoard.candies.values()).find(c => c.row === 2 && c.col === 4)!;

    const promise = visualBoard.animateSwap({ row: 2, col: 3 }, { row: 2, col: 4 }, 20);
    expect(visualBoard.isBusy).toBe(true);

    await promise;

    expect(visualBoard.isBusy).toBe(false);
    expect(candyA.col).toBe(4);
    expect(candyB.col).toBe(3);
  });

  it('animateInvalidSwap springs candies towards each other and returns them home', async () => {
    const config = getLevelConfig(1);
    const grid = BoardManager.initializeBoard(config);
    visualBoard.syncFromGrid(grid, true);

    const candyA = Array.from(visualBoard.candies.values()).find(c => c.row === 1 && c.col === 1)!;
    const originalX = candyA.x;

    const promise = visualBoard.animateInvalidSwap({ row: 1, col: 1 }, { row: 1, col: 2 }, 30);
    expect(visualBoard.isBusy).toBe(true);

    await promise;

    expect(visualBoard.isBusy).toBe(false);
    expect(candyA.x).toBe(originalX);
  });

  it('animateCascadeStep pops matched candies, drops upper candies, and spawns new ones', async () => {
    const config = getLevelConfig(1);
    const grid = BoardManager.initializeBoard(config);
    visualBoard.syncFromGrid(grid, true);

    const particleEngine = new ParticleEngine();
    const candyToClear = Array.from(visualBoard.candies.values()).find(c => c.row === 7 && c.col === 0)!;

    const step = {
      clearedCandies: [{
        row: 7,
        col: 0,
        candy: {
          id: candyToClear.id,
          key: candyToClear.id,
          color: candyToClear.color,
          special: candyToClear.special,
          row: 7,
          col: 0,
        },
        reason: 'MATCH' as const,
      }],
      createdSpecials: [],
      clearedJellies: [],
      damagedFrosting: [],
      clearedChocolate: [],
      collectedIngredients: [],
      drops: [{
        fromRow: 6,
        toRow: 7,
        col: 0,
        candyId: Array.from(visualBoard.candies.values()).find(c => c.row === 6 && c.col === 0)!.id,
      }],
      spawns: [{
        row: 0,
        col: 0,
        candy: BoardManager.createCandy('RED', 0, 0),
      }],
      scoreEarned: 150,
      comboCount: 1,
    };

    await visualBoard.animateCascadeStep(step, particleEngine);

    // Cleared candy is removed
    expect(visualBoard.candies.has(candyToClear.id)).toBe(false);
    // Dropped candy is now at row 7
    const dropped = visualBoard.candies.get(step.drops[0].candyId);
    expect(dropped?.row).toBe(7);
    // Spawned candy exists at row 0
    const spawned = visualBoard.candies.get(step.spawns[0].candy.id);
    expect(spawned?.row).toBe(0);
  });
});
