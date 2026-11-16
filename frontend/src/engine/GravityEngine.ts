import { 
  Tile, 
  DropEvent, 
  SpawnEvent, 
  CandyColor, 
  IngredientType, 
  GridPosition 
} from './types';
import { BoardManager } from './BoardManager';

export class GravityEngine {
  /**
   * Applies gravity column-by-column, moving candies into empty playable tiles beneath them.
   * Then spawns new random candies from spawner tiles at the top.
   * Returns drops, spawns, and any ingredients collected at the bottom.
   */
  public static applyGravity(
    grid: Tile[][], 
    allowedColors: CandyColor[]
  ): {
    drops: DropEvent[];
    spawns: SpawnEvent[];
    collectedIngredients: { position: GridPosition; type: IngredientType }[];
  } {
    const rows = grid.length;
    const cols = grid[0].length;
    const drops: DropEvent[] = [];
    const spawns: SpawnEvent[] = [];
    const collectedIngredients: { position: GridPosition; type: IngredientType }[] = [];

    // Process each column independently
    for (let c = 0; c < cols; c++) {
      // 1. Candies fall downward into empty spaces
      for (let r = rows - 1; r >= 0; r--) {
        const destTile = grid[r][c];

        // If this tile is playable, has no candy, and has no blocking chocolate or frosting
        if (destTile.isPlayable && destTile.candy === null && !destTile.hasChocolate && destTile.frostingLayer === 0) {
          // Look upward for the nearest movable candy
          let sourceRow = -1;
          for (let lookR = r - 1; lookR >= 0; lookR--) {
            const srcTile = grid[lookR][c];
            if (!srcTile.isPlayable) break; // Gap in board prevents falling straight through
            if (srcTile.hasChocolate || srcTile.frostingLayer > 0) break; // Obstacle blocks falling
            if (srcTile.candy !== null) {
              sourceRow = lookR;
              break;
            }
          }

          if (sourceRow !== -1) {
            const movingCandy = grid[sourceRow][c].candy!;
            movingCandy.row = r;
            movingCandy.col = c;
            destTile.candy = movingCandy;
            grid[sourceRow][c].candy = null;

            drops.push({
              fromRow: sourceRow,
              toRow: r,
              col: c,
              candyId: movingCandy.id,
            });
          }
        }
      }

      // 2. Refill empty spaces at the top from spawners
      for (let r = 0; r < rows; r++) {
        const tile = grid[r][c];
        if (!tile.isPlayable || tile.hasChocolate || tile.frostingLayer > 0) {
          break; // Stop refilling below non-passable obstacles
        }

        if (tile.candy === null) {
          const color = BoardManager.getRandomColor(allowedColors);
          const newCandy = BoardManager.createCandy(color, r, c);
          tile.candy = newCandy;

          spawns.push({
            row: r,
            col: c,
            candy: newCandy,
          });
        }
      }
    }

    // 3. Check for ingredients collected at the bottom playable rows
    for (let c = 0; c < cols; c++) {
      // Find the lowest playable tile in column c
      for (let r = rows - 1; r >= 0; r--) {
        const tile = grid[r][c];
        if (tile.isPlayable) {
          if (tile.candy?.isIngredient && tile.candy.ingredientType) {
            collectedIngredients.push({
              position: { row: r, col: c },
              type: tile.candy.ingredientType,
            });
            tile.candy = null; // Remove collected ingredient
          }
          break; // Only check the bottom-most playable tile of this column
        }
      }
    }

    return { drops, spawns, collectedIngredients };
  }
}
