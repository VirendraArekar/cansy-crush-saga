import { describe, it, expect } from 'vitest';
import { GravityEngine } from '../src/engine/GravityEngine';
import { BoardManager } from '../src/engine/BoardManager';
import { Tile, CandyColor } from '../src/engine/types';

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

describe('GravityEngine', () => {
  const colors: CandyColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

  it('drops a suspended candy down to the bottom empty tile', () => {
    const grid = createBlank8x8Grid();
    // Candy at row 2, col 3. Rows 3..7 are empty
    grid[2][3].candy = BoardManager.createCandy('RED', 2, 3);

    const result = GravityEngine.applyGravity(grid, colors);

    // Candy should have fallen to row 7, col 3
    expect(grid[7][3].candy).toBeDefined();
    expect(grid[7][3].candy?.color).toBe('RED');
    expect(result.drops.some(d => d.fromRow === 2 && d.toRow === 7 && d.col === 3)).toBe(true);
  });

  it('refills empty spaces at the top from spawners', () => {
    const grid = createBlank8x8Grid();
    const result = GravityEngine.applyGravity(grid, colors);

    // All playable tiles should now be populated
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(grid[r][c].candy).not.toBeNull();
      }
    }
    expect(result.spawns.length).toBeGreaterThan(0);
  });

  it('collects ingredients when they reach the bottom row', () => {
    const grid = createBlank8x8Grid();
    // Place Cherry at row 6, col 2. Row 7 is empty.
    grid[6][2].candy = BoardManager.createCandy('YELLOW', 6, 2, 'NONE', true, 'CHERRY');

    const result = GravityEngine.applyGravity(grid, colors);
    expect(result.collectedIngredients).toHaveLength(1);
    expect(result.collectedIngredients[0].type).toBe('CHERRY');
    expect(result.collectedIngredients[0].position).toEqual({ row: 7, col: 2 });
  });
});
