import { describe, it, expect } from 'vitest';
import { SpecialCandyEngine } from '../src/engine/SpecialCandyEngine';
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
        candy: BoardManager.createCandy('BLUE', r, c),
        jellyLayer: 0,
        frostingLayer: 0,
        hasChocolate: false,
        isSpawner: r === 0,
      };
    }
  }
  return grid;
}

describe('SpecialCandyEngine', () => {
  it('STRIPED_STRIPED combo clears both entire row and entire column', () => {
    const grid = createBlank8x8Grid();
    grid[3][3].candy!.special = 'STRIPED_H';
    grid[3][4].candy!.special = 'STRIPED_V';

    const result = SpecialCandyEngine.triggerCombo(
      grid, 
      { row: 3, col: 3 }, 
      { row: 3, col: 4 }, 
      'STRIPED_STRIPED'
    );

    // 8 tiles in row 3 + 8 tiles in col 4 - 1 intersection = 15 tiles cleared
    expect(result.clearedEvents).toHaveLength(15);
  });

  it('WRAPPED_WRAPPED combo clears a 5x5 zone', () => {
    const grid = createBlank8x8Grid();
    grid[4][4].candy!.special = 'WRAPPED';
    grid[4][5].candy!.special = 'WRAPPED';

    const result = SpecialCandyEngine.triggerCombo(
      grid, 
      { row: 4, col: 4 }, 
      { row: 4, col: 5 }, 
      'WRAPPED_WRAPPED'
    );

    // 5x5 around (4, 5) -> rows 2..6, cols 3..7 = 25 tiles
    expect(result.clearedEvents).toHaveLength(25);
  });

  it('COLOR_BOMB_COLOR_BOMB clears all 64 tiles on an 8x8 board', () => {
    const grid = createBlank8x8Grid();
    grid[0][0].candy!.special = 'COLOR_BOMB';
    grid[0][1].candy!.special = 'COLOR_BOMB';

    const result = SpecialCandyEngine.triggerCombo(
      grid, 
      { row: 0, col: 0 }, 
      { row: 0, col: 1 }, 
      'COLOR_BOMB_COLOR_BOMB'
    );

    expect(result.clearedEvents).toHaveLength(64);
  });

  it('COLOR_BOMB_NORMAL clears all candies of the chosen color', () => {
    const grid = createBlank8x8Grid();
    // Fill 10 tiles with RED, others are BLUE
    grid[0][0].candy = BoardManager.createCandy('YELLOW', 0, 0, 'COLOR_BOMB');
    grid[0][1].candy = BoardManager.createCandy('RED', 0, 1);
    grid[1][1].candy = BoardManager.createCandy('RED', 1, 1);
    grid[2][2].candy = BoardManager.createCandy('RED', 2, 2);

    const result = SpecialCandyEngine.triggerCombo(
      grid, 
      { row: 0, col: 0 }, 
      { row: 0, col: 1 }, 
      'COLOR_BOMB_NORMAL'
    );

    // Clears the 2 swapped tiles + all other RED candies
    const clearedRedCandies = result.clearedEvents.filter(e => e.candy.color === 'RED');
    expect(clearedRedCandies).toHaveLength(3);
  });
});
