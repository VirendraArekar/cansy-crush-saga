import { Tile, GridPosition, ComboType } from './types';
import { MatchDetector } from './MatchDetector';
import { BoardManager } from './BoardManager';

export class SwapValidator {
  /**
   * Checks if two positions are adjacent in any direction (horizontal, vertical, or diagonal).
   */
  public static isAdjacent(pos1: GridPosition, pos2: GridPosition): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  }

  /**
   * Identifies if a swap between two candies triggers a special combination.
   */
  public static detectCombo(tileA: Tile, tileB: Tile): ComboType {
    const candyA = tileA?.candy;
    const candyB = tileB?.candy;
    if (!candyA || !candyB) return 'NONE';

    const specials = [candyA.special, candyB.special];

    // Color Bomb + Color Bomb
    if (candyA.special === 'COLOR_BOMB' && candyB.special === 'COLOR_BOMB') {
      return 'COLOR_BOMB_COLOR_BOMB';
    }

    // Color Bomb + Striped
    if (
      (candyA.special === 'COLOR_BOMB' && (candyB.special === 'STRIPED_H' || candyB.special === 'STRIPED_V')) ||
      (candyB.special === 'COLOR_BOMB' && (candyA.special === 'STRIPED_H' || candyA.special === 'STRIPED_V'))
    ) {
      return 'COLOR_BOMB_STRIPED';
    }

    // Color Bomb + Wrapped
    if (
      (candyA.special === 'COLOR_BOMB' && candyB.special === 'WRAPPED') ||
      (candyB.special === 'COLOR_BOMB' && candyA.special === 'WRAPPED')
    ) {
      return 'COLOR_BOMB_WRAPPED';
    }

    // Color Bomb + Normal Candy
    if (
      (candyA.special === 'COLOR_BOMB' && candyB.special === 'NONE' && !candyB.isIngredient) ||
      (candyB.special === 'COLOR_BOMB' && candyA.special === 'NONE' && !candyA.isIngredient)
    ) {
      return 'COLOR_BOMB_NORMAL';
    }

    // Striped + Striped
    if (
      (candyA.special === 'STRIPED_H' || candyA.special === 'STRIPED_V') &&
      (candyB.special === 'STRIPED_H' || candyB.special === 'STRIPED_V')
    ) {
      return 'STRIPED_STRIPED';
    }

    // Wrapped + Wrapped
    if (candyA.special === 'WRAPPED' && candyB.special === 'WRAPPED') {
      return 'WRAPPED_WRAPPED';
    }

    // Striped + Wrapped
    if (
      ((candyA.special === 'STRIPED_H' || candyA.special === 'STRIPED_V') && candyB.special === 'WRAPPED') ||
      ((candyB.special === 'STRIPED_H' || candyB.special === 'STRIPED_V') && candyA.special === 'WRAPPED')
    ) {
      return 'STRIPED_WRAPPED';
    }

    return 'NONE';
  }

  /**
   * Validates if swapping posA and posB is allowed.
   */
  public static isValidSwap(
    grid: Tile[][], 
    posA: GridPosition, 
    posB: GridPosition
  ): { valid: boolean; combo: ComboType } {
    if (!this.isAdjacent(posA, posB)) {
      return { valid: false, combo: 'NONE' };
    }

    const tileA = grid[posA.row]?.[posA.col];
    const tileB = grid[posB.row]?.[posB.col];

    if (!tileA?.isPlayable || !tileB?.isPlayable) return { valid: false, combo: 'NONE' };
    if (!tileA.candy || !tileB.candy) return { valid: false, combo: 'NONE' };
    if (tileA.candy.isIngredient && tileB.candy.isIngredient) return { valid: false, combo: 'NONE' };

    // Check for special combinations
    const combo = this.detectCombo(tileA, tileB);
    if (combo !== 'NONE') {
      return { valid: true, combo };
    }

    // Simulate swap on a cloned grid
    const simGrid = BoardManager.cloneGrid(grid);
    const temp = simGrid[posA.row][posA.col].candy!;
    simGrid[posA.row][posA.col].candy = simGrid[posB.row][posB.col].candy!;
    simGrid[posB.row][posB.col].candy = temp;

    // Check if matches form
    const matches = MatchDetector.findMatches(simGrid, posB, posA);
    return { valid: matches.length > 0, combo: 'NONE' };
  }

  /**
   * Finds all possible valid moves currently on the board.
   */
  public static findPossibleMoves(grid: Tile[][]): { from: GridPosition; to: GridPosition }[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const validMoves: { from: GridPosition; to: GridPosition }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const current = { row: r, col: c };

        // 1. Test Right (0, 1)
        if (c + 1 < cols) {
          const right = { row: r, col: c + 1 };
          if (this.isValidSwap(grid, current, right).valid) {
            validMoves.push({ from: current, to: right });
          }
        }

        // 2. Test Down (1, 0)
        if (r + 1 < rows) {
          const down = { row: r + 1, col: c };
          if (this.isValidSwap(grid, current, down).valid) {
            validMoves.push({ from: current, to: down });
          }
        }

        // 3. Test Down-Right Diagonal (1, 1)
        if (r + 1 < rows && c + 1 < cols) {
          const downRight = { row: r + 1, col: c + 1 };
          if (this.isValidSwap(grid, current, downRight).valid) {
            validMoves.push({ from: current, to: downRight });
          }
        }

        // 4. Test Down-Left Diagonal (1, -1)
        if (r + 1 < rows && c - 1 >= 0) {
          const downLeft = { row: r + 1, col: c - 1 };
          if (this.isValidSwap(grid, current, downLeft).valid) {
            validMoves.push({ from: current, to: downLeft });
          }
        }
      }
    }

    return validMoves;
  }

  /**
   * Checks if the board has reached a deadlock (no possible moves).
   */
  public static isDeadlocked(grid: Tile[][]): boolean {
    return this.findPossibleMoves(grid).length === 0;
  }

  /**
   * Shuffles candies on the board when deadlocked, guaranteeing at least one valid move
   * and no pre-existing 3-matches.
   */
  public static shuffleBoard(grid: Tile[][]): boolean {
    const rows = grid.length;
    const cols = grid[0].length;

    // Collect all movable candies
    const candyPool: { special: Tile['candy'] extends null ? never : any; color: any; isIngredient?: boolean; ingredientType?: any }[] = [];
    const tileCoords: GridPosition[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = grid[r][c];
        if (tile.isPlayable && tile.candy && !tile.hasChocolate && tile.frostingLayer === 0) {
          candyPool.push({
            color: tile.candy.color,
            special: tile.candy.special,
            isIngredient: tile.candy.isIngredient,
            ingredientType: tile.candy.ingredientType,
          });
          tileCoords.push({ row: r, col: c });
        }
      }
    }

    if (candyPool.length < 4) return false;

    // Attempt shuffle permutations up to 100 times
    for (let attempt = 0; attempt < 100; attempt++) {
      // Fisher-Yates shuffle
      for (let i = candyPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candyPool[i], candyPool[j]] = [candyPool[j], candyPool[i]];
      }

      // Assign to tiles
      for (let i = 0; i < tileCoords.length; i++) {
        const { row, col } = tileCoords[i];
        const src = candyPool[i];
        grid[row][col].candy = BoardManager.createCandy(
          src.color,
          row,
          col,
          src.special,
          src.isIngredient,
          src.ingredientType
        );
      }

      // Verify no immediate matches exist
      const initialMatches = MatchDetector.findMatches(grid);
      if (initialMatches.length === 0) {
        // Verify at least one move is possible
        const moves = this.findPossibleMoves(grid);
        if (moves.length > 0) {
          return true;
        }
      }
    }

    return false;
  }
}
