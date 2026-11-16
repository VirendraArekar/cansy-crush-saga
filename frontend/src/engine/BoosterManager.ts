import { Tile, GridPosition, BoosterType, CandyColor } from './types';
import { BoardManager } from './BoardManager';
import { SwapValidator } from './SwapValidator';
import { SpecialCandyEngine } from './SpecialCandyEngine';

export class BoosterManager {
  /**
   * Applies the Lollipop Hammer booster to smash a single targeted tile.
   */
  public static useLollipopHammer(grid: Tile[][], pos: GridPosition): {
    success: boolean;
    clearedCandy?: Tile['candy'];
    clearedJelly?: boolean;
    clearedFrosting?: boolean;
    clearedChocolate?: boolean;
  } {
    if (!BoardManager.isValidCoord(grid, pos.row, pos.col)) return { success: false };
    const tile = grid[pos.row][pos.col];
    if (!tile.isPlayable) return { success: false };

    let clearedCandy = tile.candy ? { ...tile.candy } : undefined;
    let clearedJelly = false;
    let clearedFrosting = false;
    let clearedChocolate = false;

    if (tile.hasChocolate) {
      tile.hasChocolate = false;
      clearedChocolate = true;
    } else if (tile.frostingLayer > 0) {
      tile.frostingLayer--;
      clearedFrosting = true;
    } else if (tile.candy) {
      // If hammer hits a special candy, detonate it!
      if (tile.candy.special !== 'NONE') {
        SpecialCandyEngine.triggerSingleSpecial(grid, pos);
      }
      tile.candy = null;
    }

    if (tile.jellyLayer > 0) {
      tile.jellyLayer--;
      clearedJelly = true;
    }

    return {
      success: true,
      clearedCandy,
      clearedJelly,
      clearedFrosting,
      clearedChocolate,
    };
  }

  /**
   * Applies Free Switch booster: swaps any two tiles regardless of match validity.
   */
  public static useFreeSwitch(grid: Tile[][], posA: GridPosition, posB: GridPosition): boolean {
    if (!BoardManager.isValidCoord(grid, posA.row, posA.col) || !BoardManager.isValidCoord(grid, posB.row, posB.col)) {
      return false;
    }
    const tileA = grid[posA.row][posA.col];
    const tileB = grid[posB.row][posB.col];

    if (!tileA?.isPlayable || !tileB?.isPlayable) return false;
    if (!tileA.candy || !tileB.candy) return false;

    const temp = tileA.candy;
    tileA.candy = tileB.candy;
    tileB.candy = temp;

    tileA.candy.row = posA.row;
    tileA.candy.col = posA.col;
    tileB.candy.row = posB.row;
    tileB.candy.col = posB.col;

    return true;
  }

  /**
   * Spawns a Color Bomb on the board.
   */
  public static useColorBombBooster(grid: Tile[][], targetPos?: GridPosition): boolean {
    const rows = grid.length;
    const cols = grid[0].length;

    let targetTile: Tile | null = null;
    if (targetPos && BoardManager.isValidCoord(grid, targetPos.row, targetPos.col)) {
      targetTile = grid[targetPos.row][targetPos.col];
    } else {
      // Pick first normal candy available
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = grid[r][c];
          if (t.isPlayable && t.candy && t.candy.special === 'NONE' && !t.candy.isIngredient) {
            targetTile = t;
            break;
          }
        }
        if (targetTile) break;
      }
    }

    if (!targetTile) return false;
    targetTile.candy = BoardManager.createCandy('YELLOW', targetTile.row, targetTile.col, 'COLOR_BOMB');
    return true;
  }

  /**
   * Paints a candy into a Striped Candy.
   */
  public static useStripedBrush(grid: Tile[][], pos: GridPosition): boolean {
    if (!BoardManager.isValidCoord(grid, pos.row, pos.col)) return false;
    const tile = grid[pos.row][pos.col];
    if (!tile.isPlayable || !tile.candy || tile.candy.isIngredient) return false;

    const stripeType = Math.random() > 0.5 ? 'STRIPED_H' : 'STRIPED_V';
    tile.candy.special = stripeType;
    return true;
  }

  /**
   * Reshuffles the board candies.
   */
  public static useShuffleBooster(grid: Tile[][]): boolean {
    return SwapValidator.shuffleBoard(grid);
  }
}
