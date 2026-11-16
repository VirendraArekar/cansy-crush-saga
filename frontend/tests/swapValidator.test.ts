import { describe, it, expect } from 'vitest';
import { SwapValidator } from '../src/engine/SwapValidator';
import { BoardManager } from '../src/engine/BoardManager';
import { Tile } from '../src/engine/types';

function createBlank8x8Grid(): Tile[][] {
  const grid: Tile[][] = [];
  for (let r = 0; r < 8; r++) {
    grid[r] = [];
    for (let c = 0; c < 8; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        isPlayable: true,
        candy: null,
        jellyLayer: 0,
        frostingLayer: 0,
        hasChocolate: false,
        isSpawner: r === 0,
      };
    }
  }
  return grid;
}

describe('SwapValidator', () => {
  it('correctly checks adjacency in any direction (horizontal, vertical, and diagonal)', () => {
    expect(SwapValidator.isAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
    expect(SwapValidator.isAdjacent({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(true);
    expect(SwapValidator.isAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(true); // Diagonal allowed!
    expect(SwapValidator.isAdjacent({ row: 0, col: 0 }, { row: 0, col: 2 })).toBe(false); // Distance 2
  });

  it('validates a swap that leads to a 3-match', () => {
    const grid = createBlank8x8Grid();
    grid[0][0].candy = BoardManager.createCandy('RED', 0, 0);
    grid[0][1].candy = BoardManager.createCandy('BLUE', 0, 1);
    grid[0][2].candy = BoardManager.createCandy('RED', 0, 2);
    grid[1][1].candy = BoardManager.createCandy('RED', 1, 1); // Swapping (1, 1) and (0, 1) creates 3 RED

    const result = SwapValidator.isValidSwap(grid, { row: 1, col: 1 }, { row: 0, col: 1 });
    expect(result.valid).toBe(true);
  });

  it('rejects an invalid swap that does not create any match', () => {
    const grid = createBlank8x8Grid();
    grid[0][0].candy = BoardManager.createCandy('GREEN', 0, 0);
    grid[0][1].candy = BoardManager.createCandy('PURPLE', 0, 1);
    grid[0][2].candy = BoardManager.createCandy('YELLOW', 0, 2);
    grid[1][0].candy = BoardManager.createCandy('RED', 1, 0);

    const result = SwapValidator.isValidSwap(grid, { row: 0, col: 0 }, { row: 0, col: 1 });
    expect(result.valid).toBe(false);
  });

  it('identifies special combo swaps as valid regardless of 3-match', () => {
    const grid = createBlank8x8Grid();
    grid[3][3].candy = BoardManager.createCandy('YELLOW', 3, 3, 'COLOR_BOMB');
    grid[3][4].candy = BoardManager.createCandy('RED', 3, 4, 'STRIPED_H');

    const result = SwapValidator.isValidSwap(grid, { row: 3, col: 3 }, { row: 3, col: 4 });
    expect(result.valid).toBe(true);
    expect(result.combo).toBe('COLOR_BOMB_STRIPED');
  });

  it('identifies Color Bomb with normal candy as valid', () => {
    const grid = createBlank8x8Grid();
    grid[2][2].candy = BoardManager.createCandy('YELLOW', 2, 2, 'COLOR_BOMB');
    grid[2][3].candy = BoardManager.createCandy('BLUE', 2, 3, 'NONE');

    const result = SwapValidator.isValidSwap(grid, { row: 2, col: 2 }, { row: 2, col: 3 });
    expect(result.valid).toBe(true);
    expect(result.combo).toBe('COLOR_BOMB_NORMAL');
  });
});
