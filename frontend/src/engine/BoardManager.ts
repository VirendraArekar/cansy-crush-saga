import { 
  Tile, 
  Candy, 
  CandyColor, 
  LevelConfig, 
  IngredientType,
  SpecialType 
} from './types';

let candyIdCounter = 1;

export function generateCandyId(): string {
  return `candy_${candyIdCounter++}_${Date.now()}`;
}

export class BoardManager {
  /**
   * Generates a random candy color from allowed list, avoiding matches with left and top neighbors.
   */
  public static getRandomColor(
    allowedColors: CandyColor[], 
    forbiddenColors: CandyColor[] = []
  ): CandyColor {
    const candidates = allowedColors.filter(c => !forbiddenColors.includes(c));
    const pool = candidates.length > 0 ? candidates : allowedColors;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  /**
   * Creates a fresh candy instance.
   */
  public static createCandy(
    color: CandyColor, 
    row: number, 
    col: number, 
    special: SpecialType = 'NONE',
    isIngredient = false,
    ingredientType: IngredientType = 'NONE'
  ): Candy {
    const id = generateCandyId();
    return {
      id,
      color,
      special,
      isIngredient,
      ingredientType,
      row,
      col,
      key: `${id}_${row}_${col}`,
    };
  }

  /**
   * Initializes the full grid from a LevelConfig, ensuring no 3-in-a-row at start.
   */
  public static initializeBoard(config: LevelConfig): Tile[][] {
    const { rows, cols, allowedColors, layout } = config;
    const grid: Tile[][] = [];

    // Step 1: Construct basic tile structures
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = {
          row: r,
          col: c,
          isPlayable: true,
          candy: null,
          jellyLayer: 0,
          frostingLayer: 0,
          hasChocolate: false,
          isSpawner: r === 0, // top row spawns by default
        };
      }
    }

    // Step 2: Apply layout tokens if provided
    if (layout && layout.length > 0) {
      for (let r = 0; r < rows; r++) {
        if (!layout[r]) continue;
        const line = layout[r].trim().split(/\s+/);
        for (let c = 0; c < cols; c++) {
          const token = line[c] || '#';
          if (token === '.') {
            grid[r][c].isPlayable = false;
          } else if (token === 'J1' || token === 'J') {
            grid[r][c].jellyLayer = 1;
          } else if (token === 'J2') {
            grid[r][c].jellyLayer = 2;
          } else if (token === 'F1') {
            grid[r][c].frostingLayer = 1;
          } else if (token === 'F2') {
            grid[r][c].frostingLayer = 2;
          } else if (token === 'F3') {
            grid[r][c].frostingLayer = 3;
          } else if (token === 'C') {
            grid[r][c].hasChocolate = true;
          }
        }
      }
    }

    // Step 3: Populate candies without creating initial 3-in-a-row matches
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = grid[r][c];
        if (!tile.isPlayable) continue;

        // Tiles with chocolate or frosting don't hold movable candies initially
        if (tile.hasChocolate || tile.frostingLayer > 0) {
          tile.candy = null;
          continue;
        }

        const forbidden: CandyColor[] = [];

        // Check horizontal left 2
        if (c >= 2) {
          const c1 = grid[r][c - 1]?.candy;
          const c2 = grid[r][c - 2]?.candy;
          if (c1 && c2 && c1.color === c2.color && !c1.isIngredient && !c2.isIngredient) {
            forbidden.push(c1.color);
          }
        }

        // Check vertical top 2
        if (r >= 2) {
          const r1 = grid[r - 1][c]?.candy;
          const r2 = grid[r - 2][c]?.candy;
          if (r1 && r2 && r1.color === r2.color && !r1.isIngredient && !r2.isIngredient) {
            forbidden.push(r1.color);
          }
        }

        const color = this.getRandomColor(allowedColors, forbidden);
        tile.candy = this.createCandy(color, r, c);
      }
    }

    // Step 4: Place initial ingredients if configured
    if (config.initialIngredients) {
      for (const item of config.initialIngredients) {
        if (grid[item.row] && grid[item.row][item.col] && grid[item.row][item.col].isPlayable) {
          const tile = grid[item.row][item.col];
          tile.candy = this.createCandy('YELLOW', item.row, item.col, 'NONE', true, item.type);
        }
      }
    }

    return grid;
  }

  /**
   * Deep clone of a grid.
   */
  public static cloneGrid(grid: Tile[][]): Tile[][] {
    return grid.map(row => 
      row.map(tile => ({
        ...tile,
        candy: tile.candy ? { ...tile.candy } : null,
      }))
    );
  }

  /**
   * Checks if coordinates are within the board bounds.
   */
  public static isValidCoord(grid: Tile[][], row: number, col: number): boolean {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
  }
}
