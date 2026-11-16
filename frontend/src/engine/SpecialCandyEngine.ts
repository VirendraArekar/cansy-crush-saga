import { 
  Tile, 
  GridPosition, 
  ComboType, 
  ClearedCandyEvent, 
  CandyColor 
} from './types';
import { BoardManager } from './BoardManager';

export class SpecialCandyEngine {
  /**
   * Resolves a special candy combo triggered between two adjacent swapped tiles.
   */
  public static triggerCombo(
    grid: Tile[][], 
    posA: GridPosition, 
    posB: GridPosition, 
    combo: ComboType
  ): {
    clearedEvents: ClearedCandyEvent[];
    affectedJellies: GridPosition[];
    affectedFrosting: GridPosition[];
    affectedChocolate: GridPosition[];
  } {
    const rows = grid.length;
    const cols = grid[0].length;
    const clearedEvents: ClearedCandyEvent[] = [];
    const affectedJellies: GridPosition[] = [];
    const affectedFrosting: GridPosition[] = [];
    const affectedChocolate: GridPosition[] = [];
    const clearedSet = new Set<string>();

    const recordClear = (r: number, c: number, reason: ClearedCandyEvent['reason'] = 'COMBO') => {
      const key = `${r},${c}`;
      if (clearedSet.has(key)) return;
      if (!BoardManager.isValidCoord(grid, r, c)) return;

      const tile = grid[r][c];
      if (!tile.isPlayable) return;

      clearedSet.add(key);

      if (tile.candy) {
        clearedEvents.push({
          row: r,
          col: c,
          candy: { ...tile.candy },
          reason,
        });
      }

      if (tile.jellyLayer > 0) affectedJellies.push({ row: r, col: c });
      if (tile.frostingLayer > 0) affectedFrosting.push({ row: r, col: c });
      if (tile.hasChocolate) affectedChocolate.push({ row: r, col: c });
    };

    const tileA = grid[posA.row][posA.col];
    const tileB = grid[posB.row][posB.col];

    switch (combo) {
      case 'COLOR_BOMB_COLOR_BOMB': {
        // Clears the ENTIRE board
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            recordClear(r, c, 'COMBO');
          }
        }
        break;
      }

      case 'STRIPED_STRIPED': {
        // Clears full row and full column at target position posB
        for (let c = 0; c < cols; c++) recordClear(posB.row, c, 'COMBO');
        for (let r = 0; r < rows; r++) recordClear(r, posB.col, 'COMBO');
        break;
      }

      case 'WRAPPED_WRAPPED': {
        // 5x5 massive explosion around posB
        for (let r = posB.row - 2; r <= posB.row + 2; r++) {
          for (let c = posB.col - 2; c <= posB.col + 2; c++) {
            recordClear(r, c, 'COMBO');
          }
        }
        break;
      }

      case 'STRIPED_WRAPPED': {
        // Giant 3-row by 3-column cross clear
        for (let r = posB.row - 1; r <= posB.row + 1; r++) {
          for (let c = 0; c < cols; c++) recordClear(r, c, 'COMBO');
        }
        for (let c = posB.col - 1; c <= posB.col + 1; c++) {
          for (let r = 0; r < rows; r++) recordClear(r, c, 'COMBO');
        }
        break;
      }

      case 'COLOR_BOMB_STRIPED': {
        // Find target color (the non-color-bomb candy)
        const targetColor = tileA.candy?.special === 'COLOR_BOMB' ? tileB.candy!.color : tileA.candy!.color;
        recordClear(posA.row, posA.col, 'COLOR_BOMB');
        recordClear(posB.row, posB.col, 'COLOR_BOMB');

        // Turn all candies of that color into striped candies and ignite them!
        const transformed: GridPosition[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tile = grid[r][c];
            if (tile.isPlayable && tile.candy && tile.candy.color === targetColor) {
              const stripeType = Math.random() > 0.5 ? 'STRIPED_H' : 'STRIPED_V';
              tile.candy.special = stripeType;
              transformed.push({ row: r, col: c });
            }
          }
        }

        // Now ignite each of the transformed striped candies
        for (const pos of transformed) {
          const t = grid[pos.row][pos.col];
          const isH = t.candy?.special === 'STRIPED_H';
          if (isH) {
            for (let c = 0; c < cols; c++) recordClear(pos.row, c, 'STRIPED');
          } else {
            for (let r = 0; r < rows; r++) recordClear(r, pos.col, 'STRIPED');
          }
        }
        break;
      }

      case 'COLOR_BOMB_WRAPPED': {
        const targetColor = tileA.candy?.special === 'COLOR_BOMB' ? tileB.candy!.color : tileA.candy!.color;
        recordClear(posA.row, posA.col, 'COLOR_BOMB');
        recordClear(posB.row, posB.col, 'COLOR_BOMB');

        // Turn all candies of that color into wrapped candies and explode them!
        const transformed: GridPosition[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tile = grid[r][c];
            if (tile.isPlayable && tile.candy && tile.candy.color === targetColor) {
              tile.candy.special = 'WRAPPED';
              transformed.push({ row: r, col: c });
            }
          }
        }

        for (const pos of transformed) {
          for (let r = pos.row - 1; r <= pos.row + 1; r++) {
            for (let c = pos.col - 1; c <= pos.col + 1; c++) {
              recordClear(r, c, 'WRAPPED');
            }
          }
        }
        break;
      }

      case 'COLOR_BOMB_NORMAL': {
        const targetColor = tileA.candy?.special === 'COLOR_BOMB' ? tileB.candy!.color : tileA.candy!.color;
        recordClear(posA.row, posA.col, 'COLOR_BOMB');
        recordClear(posB.row, posB.col, 'COLOR_BOMB');

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tile = grid[r][c];
            if (tile.isPlayable && tile.candy && tile.candy.color === targetColor && !tile.candy.isIngredient) {
              recordClear(r, c, 'COLOR_BOMB');
            }
          }
        }
        break;
      }
    }

    return {
      clearedEvents,
      affectedJellies,
      affectedFrosting,
      affectedChocolate,
    };
  }

  /**
   * Triggers a single special candy detonation and handles recursive chain triggers.
   */
  public static triggerSingleSpecial(
    grid: Tile[][], 
    pos: GridPosition,
    visited = new Set<string>()
  ): {
    clearedEvents: ClearedCandyEvent[];
    affectedJellies: GridPosition[];
    affectedFrosting: GridPosition[];
    affectedChocolate: GridPosition[];
  } {
    const key = `${pos.row},${pos.col}`;
    if (visited.has(key)) {
      return { clearedEvents: [], affectedJellies: [], affectedFrosting: [], affectedChocolate: [] };
    }
    visited.add(key);

    const tile = grid[pos.row]?.[pos.col];
    if (!tile?.candy || tile.candy.special === 'NONE') {
      return { clearedEvents: [], affectedJellies: [], affectedFrosting: [], affectedChocolate: [] };
    }

    const rows = grid.length;
    const cols = grid[0].length;
    const clearedEvents: ClearedCandyEvent[] = [];
    const affectedJellies: GridPosition[] = [];
    const affectedFrosting: GridPosition[] = [];
    const affectedChocolate: GridPosition[] = [];
    const special = tile.candy.special;

    const targets: GridPosition[] = [];

    if (special === 'STRIPED_H') {
      for (let c = 0; c < cols; c++) targets.push({ row: pos.row, col: c });
    } else if (special === 'STRIPED_V') {
      for (let r = 0; r < rows; r++) targets.push({ row: r, col: pos.col });
    } else if (special === 'WRAPPED') {
      for (let r = pos.row - 1; r <= pos.row + 1; r++) {
        for (let c = pos.col - 1; c <= pos.col + 1; c++) {
          if (BoardManager.isValidCoord(grid, r, c)) {
            targets.push({ row: r, col: c });
          }
        }
      }
    } else if (special === 'COLOR_BOMB') {
      // Pick the most abundant color on the board if detonated standalone
      const colorCounts: Partial<Record<CandyColor, number>> = {};
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cnd = grid[r][c]?.candy;
          if (cnd && cnd.special === 'NONE' && !cnd.isIngredient) {
            colorCounts[cnd.color] = (colorCounts[cnd.color] || 0) + 1;
          }
        }
      }
      let bestColor: CandyColor = 'RED';
      let maxCount = -1;
      for (const [colStr, cnt] of Object.entries(colorCounts)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          bestColor = colStr as CandyColor;
        }
      }
      targets.push({ row: pos.row, col: pos.col });
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]?.candy?.color === bestColor) {
            targets.push({ row: r, col: c });
          }
        }
      }
    }

    for (const tgt of targets) {
      const t = grid[tgt.row]?.[tgt.col];
      if (!t || !t.isPlayable) continue;

      if (t.candy) {
        clearedEvents.push({
          row: tgt.row,
          col: tgt.col,
          candy: { ...t.candy },
          reason: special === 'WRAPPED' ? 'WRAPPED' : special.startsWith('STRIPED') ? 'STRIPED' : 'COLOR_BOMB',
        });

        // Chain trigger if this target also has an unvisited special candy!
        if (t.candy.special !== 'NONE' && !visited.has(`${tgt.row},${tgt.col}`)) {
          const chain = this.triggerSingleSpecial(grid, tgt, visited);
          clearedEvents.push(...chain.clearedEvents);
          affectedJellies.push(...chain.affectedJellies);
          affectedFrosting.push(...chain.affectedFrosting);
          affectedChocolate.push(...chain.affectedChocolate);
        }
      }

      if (t.jellyLayer > 0) affectedJellies.push({ row: tgt.row, col: tgt.col });
      if (t.frostingLayer > 0) affectedFrosting.push({ row: tgt.row, col: tgt.col });
      if (t.hasChocolate) affectedChocolate.push({ row: tgt.row, col: tgt.col });
    }

    return {
      clearedEvents,
      affectedJellies,
      affectedFrosting,
      affectedChocolate,
    };
  }
}
