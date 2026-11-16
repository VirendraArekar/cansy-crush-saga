import { 
  Tile, 
  GridPosition, 
  MatchGroup, 
  CandyColor, 
  SpecialType, 
  MatchShape 
} from './types';

interface RawRun {
  color: CandyColor;
  orientation: 'H' | 'V' | 'D_DOWN' | 'D_UP';
  tiles: GridPosition[];
}

export class MatchDetector {
  /**
   * Scans the grid and returns all match groups:
   * - Straight lines of 3, 4, 5+ in all directions (horizontal, vertical, diagonal)
   * - 2x2 squares of 4 candies (like Candy Crush Soda / Friends)
   * - Intersecting T/L/Cross shapes
   * - Any connected grouping or cluster of 3 or more candies of the same color
   * 
   * targetPos is the destination tile that the player moved into, so special candies spawn there!
   */
  public static findMatches(
    grid: Tile[][], 
    targetPos?: GridPosition,
    originPos?: GridPosition
  ): MatchGroup[] {
    const rows = grid.length;
    if (rows === 0) return [];
    const cols = grid[0].length;

    // Helper: is playable normal candy of valid color
    const getCandy = (r: number, c: number) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
      const tile = grid[r][c];
      if (!tile?.isPlayable || !tile.candy || tile.candy.isIngredient || tile.candy.special === 'COLOR_BOMB') {
        return null;
      }
      return tile.candy;
    };

    // 1. Scan Horizontal runs (>= 3)
    const horizontalRuns: RawRun[] = [];
    for (let r = 0; r < rows; r++) {
      let run: GridPosition[] = [];
      let color: CandyColor | null = null;
      for (let c = 0; c < cols; c++) {
        const candy = getCandy(r, c);
        if (candy) {
          if (candy.color === color) {
            run.push({ row: r, col: c });
          } else {
            if (run.length >= 3 && color !== null) {
              horizontalRuns.push({ color, orientation: 'H', tiles: [...run] });
            }
            color = candy.color;
            run = [{ row: r, col: c }];
          }
        } else {
          if (run.length >= 3 && color !== null) {
            horizontalRuns.push({ color, orientation: 'H', tiles: [...run] });
          }
          run = [];
          color = null;
        }
      }
      if (run.length >= 3 && color !== null) {
        horizontalRuns.push({ color, orientation: 'H', tiles: [...run] });
      }
    }

    // 2. Scan Vertical runs (>= 3)
    const verticalRuns: RawRun[] = [];
    for (let c = 0; c < cols; c++) {
      let run: GridPosition[] = [];
      let color: CandyColor | null = null;
      for (let r = 0; r < rows; r++) {
        const candy = getCandy(r, c);
        if (candy) {
          if (candy.color === color) {
            run.push({ row: r, col: c });
          } else {
            if (run.length >= 3 && color !== null) {
              verticalRuns.push({ color, orientation: 'V', tiles: [...run] });
            }
            color = candy.color;
            run = [{ row: r, col: c }];
          }
        } else {
          if (run.length >= 3 && color !== null) {
            verticalRuns.push({ color, orientation: 'V', tiles: [...run] });
          }
          run = [];
          color = null;
        }
      }
      if (run.length >= 3 && color !== null) {
        verticalRuns.push({ color, orientation: 'V', tiles: [...run] });
      }
    }

    // 3. Scan Diagonal Down-Right runs (\)
    const diagonalDownRuns: RawRun[] = [];
    for (let start = -(cols - 1); start < rows; start++) {
      let run: GridPosition[] = [];
      let color: CandyColor | null = null;
      for (let r = 0; r < rows; r++) {
        const c = r - start;
        if (c < 0 || c >= cols) continue;
        const candy = getCandy(r, c);
        if (candy) {
          if (candy.color === color) {
            run.push({ row: r, col: c });
          } else {
            if (run.length >= 3 && color !== null) {
              diagonalDownRuns.push({ color, orientation: 'D_DOWN', tiles: [...run] });
            }
            color = candy.color;
            run = [{ row: r, col: c }];
          }
        } else {
          if (run.length >= 3 && color !== null) {
            diagonalDownRuns.push({ color, orientation: 'D_DOWN', tiles: [...run] });
          }
          run = [];
          color = null;
        }
      }
      if (run.length >= 3 && color !== null) {
        diagonalDownRuns.push({ color, orientation: 'D_DOWN', tiles: [...run] });
      }
    }

    // 4. Scan Diagonal Up-Right runs (/)
    const diagonalUpRuns: RawRun[] = [];
    for (let sum = 0; sum <= (rows + cols - 2); sum++) {
      let run: GridPosition[] = [];
      let color: CandyColor | null = null;
      for (let r = 0; r < rows; r++) {
        const c = sum - r;
        if (c < 0 || c >= cols) continue;
        const candy = getCandy(r, c);
        if (candy) {
          if (candy.color === color) {
            run.push({ row: r, col: c });
          } else {
            if (run.length >= 3 && color !== null) {
              diagonalUpRuns.push({ color, orientation: 'D_UP', tiles: [...run] });
            }
            color = candy.color;
            run = [{ row: r, col: c }];
          }
        } else {
          if (run.length >= 3 && color !== null) {
            diagonalUpRuns.push({ color, orientation: 'D_UP', tiles: [...run] });
          }
          run = [];
          color = null;
        }
      }
      if (run.length >= 3 && color !== null) {
        diagonalUpRuns.push({ color, orientation: 'D_UP', tiles: [...run] });
      }
    }

    // 5. Scan 2x2 Squares of 4 candies
    interface Square2x2 {
      color: CandyColor;
      tiles: GridPosition[];
    }
    const squares2x2: Square2x2[] = [];
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const c1 = getCandy(r, c);
        const c2 = getCandy(r, c + 1);
        const c3 = getCandy(r + 1, c);
        const c4 = getCandy(r + 1, c + 1);
        if (
          c1 && c2 && c3 && c4 && 
          c1.color === c2.color && 
          c1.color === c3.color && 
          c1.color === c4.color
        ) {
          squares2x2.push({
            color: c1.color,
            tiles: [
              { row: r, col: c },
              { row: r, col: c + 1 },
              { row: r + 1, col: c },
              { row: r + 1, col: c + 1 },
            ],
          });
        }
      }
    }

    // 6. Scan all connected components of same-color candies (Orthogonal BFS)
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const clusters: { color: CandyColor; tiles: GridPosition[] }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (visited[r][c]) continue;
        const startCandy = getCandy(r, c);
        if (!startCandy) {
          visited[r][c] = true;
          continue;
        }

        const color = startCandy.color;
        const queue: GridPosition[] = [{ row: r, col: c }];
        visited[r][c] = true;
        const component: GridPosition[] = [];

        while (queue.length > 0) {
          const curr = queue.shift()!;
          component.push(curr);

          const neighbors = [
            { row: curr.row - 1, col: curr.col },
            { row: curr.row + 1, col: curr.col },
            { row: curr.row, col: curr.col - 1 },
            { row: curr.row, col: curr.col + 1 },
          ];

          for (const n of neighbors) {
            if (n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols && !visited[n.row][n.col]) {
              const neighborCandy = getCandy(n.row, n.col);
              if (neighborCandy && neighborCandy.color === color) {
                visited[n.row][n.col] = true;
                queue.push(n);
              }
            }
          }
        }

        if (component.length >= 3) {
          clusters.push({ color, tiles: component });
        }
      }
    }

    const matchGroups: MatchGroup[] = [];
    const matchedTileKeys = new Set<string>();

    const getTileKey = (p: GridPosition) => `${p.row},${p.col}`;

    // Determine special spawn pos helper
    const pickSpawnPos = (tiles: GridPosition[]): GridPosition => {
      if (targetPos && tiles.some(t => t.row === targetPos.row && t.col === targetPos.col)) {
        return targetPos;
      }
      if (originPos && tiles.some(t => t.row === originPos.row && t.col === originPos.col)) {
        return originPos;
      }
      return tiles[Math.floor(tiles.length / 2)];
    };

    // Helper: does set of tiles contain run
    const containsSubRun = (clusterTiles: GridPosition[], run: GridPosition[]): boolean => {
      const set = new Set(clusterTiles.map(getTileKey));
      return run.every(t => set.has(getTileKey(t)));
    };

    // 7. Process clusters
    for (const cluster of clusters) {
      const clusterTileKeys = new Set(cluster.tiles.map(getTileKey));

      // Check horizontal runs within this cluster
      const hRunsInCluster = horizontalRuns.filter(
        h => h.color === cluster.color && h.tiles.every(t => clusterTileKeys.has(getTileKey(t)))
      );

      // Check vertical runs within this cluster
      const vRunsInCluster = verticalRuns.filter(
        v => v.color === cluster.color && v.tiles.every(t => clusterTileKeys.has(getTileKey(t)))
      );

      // Check 2x2 squares within this cluster
      const squaresInCluster = squares2x2.filter(
        sq => sq.color === cluster.color && sq.tiles.every(t => clusterTileKeys.has(getTileKey(t)))
      );

      // Check diagonal runs within this cluster
      const dRunsInCluster = [...diagonalDownRuns, ...diagonalUpRuns].filter(
        d => d.color === cluster.color && d.tiles.every(t => clusterTileKeys.has(getTileKey(t)))
      );

      const maxH = hRunsInCluster.reduce((max, r) => Math.max(max, r.tiles.length), 0);
      const maxV = vRunsInCluster.reduce((max, r) => Math.max(max, r.tiles.length), 0);
      const maxD = dRunsInCluster.reduce((max, r) => Math.max(max, r.tiles.length), 0);
      const maxStraight = Math.max(maxH, maxV, maxD);

      let shape: MatchShape = 'HORIZONTAL_3';
      let specialType: SpecialType = 'NONE';
      let spawnPos = pickSpawnPos(cluster.tiles);

      // Priority 1: 5 or more in a straight line -> COLOR_BOMB
      if (maxStraight >= 5) {
        shape = 'COLOR_BOMB';
        specialType = 'COLOR_BOMB';
      }
      // Priority 2: Intersecting T, L, or Cross shapes (>= 5 candies with both H and V runs)
      else if (hRunsInCluster.length > 0 && vRunsInCluster.length > 0) {
        shape = 'T_SHAPE';
        specialType = 'WRAPPED';

        // Prefer intersection tile for spawn pos if targetPos is not in match
        const intersection = hRunsInCluster[0].tiles.find(hTile => 
          vRunsInCluster[0].tiles.some(vTile => vTile.row === hTile.row && vTile.col === hTile.col)
        );
        if (intersection && (!targetPos || !cluster.tiles.some(t => t.row === targetPos.row && t.col === targetPos.col))) {
          spawnPos = intersection;
        }
      }
      // Priority 3: Large cluster of 5+ candies -> WRAPPED bomb
      else if (cluster.tiles.length >= 5) {
        shape = 'T_SHAPE';
        specialType = 'WRAPPED';
      }
      // Priority 4: 2x2 Square of 4 candies -> SQUARE_2X2 (creates WRAPPED bomb)
      else if (squaresInCluster.length > 0) {
        shape = 'SQUARE_2X2';
        specialType = 'WRAPPED';
      }
      // Priority 5: 4 in a straight line -> STRIPED candy
      else if (maxStraight === 4) {
        if (maxV === 4) {
          shape = 'VERTICAL_4';
          specialType = 'STRIPED_H'; // Vertical line creates horizontal stripe
        } else {
          shape = 'HORIZONTAL_4';
          specialType = 'STRIPED_V'; // Horizontal line creates vertical stripe
        }
      }
      // Priority 6: Line of 3 or Corner/Group of 3
      else if (cluster.tiles.length === 3) {
        if (maxV === 3) {
          shape = 'VERTICAL_3';
        } else {
          shape = 'HORIZONTAL_3';
        }
        specialType = 'NONE';
      }
      // Other grouping of 4
      else {
        shape = 'HORIZONTAL_4';
        specialType = 'STRIPED_V';
      }

      cluster.tiles.forEach(t => matchedTileKeys.add(getTileKey(t)));

      matchGroups.push({
        tiles: cluster.tiles,
        color: cluster.color,
        shape,
        createdSpecial: specialType !== 'NONE' ? {
          position: spawnPos,
          type: specialType,
          color: cluster.color,
        } : undefined,
      });
    }

    // 8. Process any standalone diagonal runs that didn't touch orthogonally
    const allDiagonalRuns = [...diagonalDownRuns, ...diagonalUpRuns];
    for (const dRun of allDiagonalRuns) {
      const unassignedTiles = dRun.tiles.filter(t => !matchedTileKeys.has(getTileKey(t)));
      if (unassignedTiles.length >= 3) {
        let shape: MatchShape = 'HORIZONTAL_3';
        let specialType: SpecialType = 'NONE';

        if (dRun.tiles.length >= 5) {
          shape = 'COLOR_BOMB';
          specialType = 'COLOR_BOMB';
        } else if (dRun.tiles.length === 4) {
          shape = 'HORIZONTAL_4';
          specialType = 'STRIPED_V';
        } else {
          shape = 'HORIZONTAL_3';
          specialType = 'NONE';
        }

        const spawnPos = pickSpawnPos(dRun.tiles);
        dRun.tiles.forEach(t => matchedTileKeys.add(getTileKey(t)));

        matchGroups.push({
          tiles: dRun.tiles,
          color: dRun.color,
          shape,
          createdSpecial: specialType !== 'NONE' ? {
            position: spawnPos,
            type: specialType,
            color: dRun.color,
          } : undefined,
        });
      }
    }

    return matchGroups;
  }
}
