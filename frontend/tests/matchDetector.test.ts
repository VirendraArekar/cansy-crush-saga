import { describe, it, expect } from 'vitest';
import { MatchDetector } from '../src/engine/MatchDetector';
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

describe('MatchDetector', () => {
  it('detects a simple 3-in-a-row horizontal match', () => {
    const grid = createBlank8x8Grid();
    grid[2][1].candy = BoardManager.createCandy('RED', 2, 1);
    grid[2][2].candy = BoardManager.createCandy('RED', 2, 2);
    grid[2][3].candy = BoardManager.createCandy('RED', 2, 3);

    const matches = MatchDetector.findMatches(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].tiles).toHaveLength(3);
    expect(matches[0].color).toBe('RED');
    expect(matches[0].shape).toBe('HORIZONTAL_3');
  });

  it('detects a 4-in-a-row match and generates a striped candy', () => {
    const grid = createBlank8x8Grid();
    grid[0][1].candy = BoardManager.createCandy('BLUE', 0, 1);
    grid[0][2].candy = BoardManager.createCandy('BLUE', 0, 2);
    grid[0][3].candy = BoardManager.createCandy('BLUE', 0, 3);
    grid[0][4].candy = BoardManager.createCandy('BLUE', 0, 4);

    const targetPos = { row: 0, col: 3 };
    const matches = MatchDetector.findMatches(grid, targetPos);
    expect(matches).toHaveLength(1);
    expect(matches[0].tiles).toHaveLength(4);
    expect(matches[0].shape).toBe('HORIZONTAL_4');
    expect(matches[0].createdSpecial).toBeDefined();
    expect(matches[0].createdSpecial?.type).toBe('STRIPED_V');
    expect(matches[0].createdSpecial?.position).toEqual(targetPos);
  });

  it('detects a 5-in-a-row match and generates a COLOR_BOMB', () => {
    const grid = createBlank8x8Grid();
    for (let c = 1; c <= 5; c++) {
      grid[3][c].candy = BoardManager.createCandy('GREEN', 3, c);
    }

    const matches = MatchDetector.findMatches(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].tiles).toHaveLength(5);
    expect(matches[0].shape).toBe('COLOR_BOMB');
    expect(matches[0].createdSpecial?.type).toBe('COLOR_BOMB');
  });

  it('detects an intersecting T-shape match and creates a WRAPPED candy', () => {
    const grid = createBlank8x8Grid();
    // Horizontal row of 3: (4, 1), (4, 2), (4, 3)
    grid[4][1].candy = BoardManager.createCandy('PURPLE', 4, 1);
    grid[4][2].candy = BoardManager.createCandy('PURPLE', 4, 2);
    grid[4][3].candy = BoardManager.createCandy('PURPLE', 4, 3);

    // Vertical column of 3 sharing (4, 2): (3, 2), (4, 2), (5, 2)
    grid[3][2].candy = BoardManager.createCandy('PURPLE', 3, 2);
    grid[5][2].candy = BoardManager.createCandy('PURPLE', 5, 2);

    const matches = MatchDetector.findMatches(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].shape).toBe('T_SHAPE');
    expect(matches[0].tiles).toHaveLength(5); // 3 + 3 - 1 intersection = 5 tiles
    expect(matches[0].createdSpecial?.type).toBe('WRAPPED');
    expect(matches[0].createdSpecial?.position).toEqual({ row: 4, col: 2 });
  });

  it('detects a 2x2 square match and generates a WRAPPED special candy', () => {
    const grid = createBlank8x8Grid();
    // 2x2 Square of GREEN candies
    grid[2][2].candy = BoardManager.createCandy('GREEN', 2, 2);
    grid[2][3].candy = BoardManager.createCandy('GREEN', 2, 3);
    grid[3][2].candy = BoardManager.createCandy('GREEN', 3, 2);
    grid[3][3].candy = BoardManager.createCandy('GREEN', 3, 3);

    const targetPos = { row: 3, col: 3 };
    const matches = MatchDetector.findMatches(grid, targetPos);
    expect(matches).toHaveLength(1);
    expect(matches[0].tiles).toHaveLength(4);
    expect(matches[0].shape).toBe('SQUARE_2X2');
    expect(matches[0].createdSpecial).toBeDefined();
    expect(matches[0].createdSpecial?.type).toBe('WRAPPED');
    expect(matches[0].createdSpecial?.position).toEqual(targetPos);
  });

  it('detects an L-shaped corner grouping of 3 candies as a valid match', () => {
    const grid = createBlank8x8Grid();
    // 3 candies in a corner (row 1 col 1, row 2 col 1, row 2 col 2)
    grid[1][1].candy = BoardManager.createCandy('ORANGE', 1, 1);
    grid[2][1].candy = BoardManager.createCandy('ORANGE', 2, 1);
    grid[2][2].candy = BoardManager.createCandy('ORANGE', 2, 2);

    const matches = MatchDetector.findMatches(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].tiles).toHaveLength(3);
    expect(matches[0].color).toBe('ORANGE');
  });

  it('detects a diagonal 3-in-a-row match', () => {
    const grid = createBlank8x8Grid();
    grid[1][1].candy = BoardManager.createCandy('RED', 1, 1);
    grid[2][2].candy = BoardManager.createCandy('RED', 2, 2);
    grid[3][3].candy = BoardManager.createCandy('RED', 3, 3);

    const matches = MatchDetector.findMatches(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].tiles).toHaveLength(3);
    expect(matches[0].color).toBe('RED');
  });

  it('does not match ingredients with normal candies', () => {
    const grid = createBlank8x8Grid();
    grid[2][1].candy = BoardManager.createCandy('YELLOW', 2, 1);
    grid[2][2].candy = BoardManager.createCandy('YELLOW', 2, 2, 'NONE', true, 'CHERRY');
    grid[2][3].candy = BoardManager.createCandy('YELLOW', 2, 3);

    const matches = MatchDetector.findMatches(grid);
    expect(matches).toHaveLength(0);
  });
});
