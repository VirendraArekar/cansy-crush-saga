import { 
  Tile, 
  GridPosition, 
  ComboType, 
  CascadeStep, 
  ClearedCandyEvent, 
  CandyColor, 
  Candy, 
  SpecialType, 
  LevelConfig, 
  ObjectiveProgress 
} from './types';
import { MatchDetector } from './MatchDetector';
import { SpecialCandyEngine } from './SpecialCandyEngine';
import { GravityEngine } from './GravityEngine';
import { ScoreCalculator } from './ScoreCalculator';
import { SwapValidator } from './SwapValidator';
import { BoardManager } from './BoardManager';

export interface TurnResult {
  steps: CascadeStep[];
  totalScoreEarned: number;
  finalObjectiveProgress: ObjectiveProgress;
  isWon: boolean;
  isLost: boolean;
  shuffled: boolean;
}

export class CascadeEngine {
  /**
   * Executes a complete player move: resolves initial swap/combo, cascades until quiet,
   * handles chocolate spread, deadlocks, and checks objective completion.
   */
  public static executeMove(
    grid: Tile[][], 
    posA: GridPosition, 
    posB: GridPosition, 
    combo: ComboType,
    config: LevelConfig,
    currentProgress: ObjectiveProgress,
    remainingMoves: number
  ): TurnResult {
    const steps: CascadeStep[] = [];
    let totalScoreEarned = 0;
    let anyChocolateDestroyedThisTurn = false;
    let comboCount = 1;

    // Local copy of objective progress
    const progress: ObjectiveProgress = {
      ...currentProgress,
      colorsCollected: { ...currentProgress.colorsCollected },
    };

    // Helper to damage adjacent frosting and chocolates when candies are cleared
    const handleAdjacentBlockers = (clearedPositions: GridPosition[]) => {
      const rows = grid.length;
      const cols = grid[0].length;
      const neighbors = [
        { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
      ];

      const damagedFrosting: { position: GridPosition; remaining: number }[] = [];
      const clearedChocolate: GridPosition[] = [];
      const checkedFrosting = new Set<string>();
      const checkedChocolate = new Set<string>();

      for (const pos of clearedPositions) {
        for (const n of neighbors) {
          const nr = pos.row + n.r;
          const nc = pos.col + n.c;
          if (BoardManager.isValidCoord(grid, nr, nc)) {
            const t = grid[nr][nc];
            const key = `${nr},${nc}`;

            // Adjacent Frosting
            if (t.frostingLayer > 0 && !checkedFrosting.has(key)) {
              checkedFrosting.add(key);
              t.frostingLayer--;
              damagedFrosting.push({ position: { row: nr, col: nc }, remaining: t.frostingLayer });
              if (t.frostingLayer === 0) {
                progress.blockersCleared++;
              }
            }

            // Adjacent Chocolate
            if (t.hasChocolate && !checkedChocolate.has(key)) {
              checkedChocolate.add(key);
              t.hasChocolate = false;
              clearedChocolate.push({ row: nr, col: nc });
              anyChocolateDestroyedThisTurn = true;
              progress.blockersCleared++;
            }
          }
        }
      }

      return { damagedFrosting, clearedChocolate };
    };

    // --- PHASE 1: EXECUTE INITIAL SWAP OR COMBO ---
    if (combo !== 'NONE') {
      // Execute Special Combo
      const comboResult = SpecialCandyEngine.triggerCombo(grid, posA, posB, combo);
      
      // Clear jelly layers on affected tiles
      const clearedJellies: GridPosition[] = [];
      for (const jPos of comboResult.affectedJellies) {
        const t = grid[jPos.row][jPos.col];
        if (t.jellyLayer > 0) {
          t.jellyLayer--;
          clearedJellies.push(jPos);
          if (t.jellyLayer === 0) progress.jelliesCleared++;
        }
      }

      // Remove candies from grid
      for (const evt of comboResult.clearedEvents) {
        grid[evt.row][evt.col].candy = null;
        const color = evt.candy.color;
        progress.colorsCollected[color] = (progress.colorsCollected[color] || 0) + 1;
      }

      // Check adjacent blockers
      const blockerRes = handleAdjacentBlockers(
        comboResult.clearedEvents.map(e => ({ row: e.row, col: e.col }))
      );

      // Apply Gravity
      const grav = GravityEngine.applyGravity(grid, config.allowedColors);
      for (const ing of grav.collectedIngredients) {
        if (ing.type === 'CHERRY') progress.cherriesCollected++;
        if (ing.type === 'NUT') progress.nutsCollected++;
      }

      const stepScore = ScoreCalculator.calculateStepScore(
        comboResult.clearedEvents,
        clearedJellies.length,
        blockerRes.damagedFrosting.length,
        blockerRes.clearedChocolate.length,
        grav.collectedIngredients.length,
        combo,
        comboCount
      );
      totalScoreEarned += stepScore;
      progress.score += stepScore;

      steps.push({
        clearedCandies: comboResult.clearedEvents,
        createdSpecials: [],
        clearedJellies,
        damagedFrosting: blockerRes.damagedFrosting,
        clearedChocolate: blockerRes.clearedChocolate,
        collectedIngredients: grav.collectedIngredients,
        drops: grav.drops,
        spawns: grav.spawns,
        scoreEarned: stepScore,
        comboCount: 1,
      });

      comboCount++;
    } else {
      // Normal swap: Physically perform swap on grid first
      const temp = grid[posA.row][posA.col].candy!;
      grid[posA.row][posA.col].candy = grid[posB.row][posB.col].candy!;
      grid[posB.row][posB.col].candy = temp;

      // Find initial matches from swap
      const matchGroups = MatchDetector.findMatches(grid, posB, posA);
      if (matchGroups.length > 0) {
        const step = this.resolveMatchStep(
          grid, 
          matchGroups, 
          config, 
          progress, 
          comboCount, 
          handleAdjacentBlockers,
          (destroyed) => { if (destroyed) anyChocolateDestroyedThisTurn = true; }
        );
        steps.push(step);
        totalScoreEarned += step.scoreEarned;
        comboCount++;
      }
    }

    // --- PHASE 2: CASCADE REACTION LOOP ---
    let loopGuard = 0;
    while (loopGuard < 25) {
      loopGuard++;
      const cascadeMatches = MatchDetector.findMatches(grid);
      if (cascadeMatches.length === 0) break;

      const step = this.resolveMatchStep(
        grid, 
        cascadeMatches, 
        config, 
        progress, 
        comboCount, 
        handleAdjacentBlockers,
        (destroyed) => { if (destroyed) anyChocolateDestroyedThisTurn = true; }
      );
      steps.push(step);
      totalScoreEarned += step.scoreEarned;
      comboCount++;
    }

    // --- PHASE 3: CHOCOLATE SPREAD ---
    let chocolateSpreadPos: GridPosition | undefined;
    if (!anyChocolateDestroyedThisTurn) {
      chocolateSpreadPos = this.spreadChocolate(grid);
      if (chocolateSpreadPos && steps.length > 0) {
        steps[steps.length - 1].chocolateSpread = chocolateSpreadPos;
      }
    }

    // --- PHASE 4: DEADLOCK CHECK & SHUFFLE ---
    let shuffled = false;
    if (SwapValidator.isDeadlocked(grid)) {
      shuffled = SwapValidator.shuffleBoard(grid);
    }

    // --- PHASE 5: OBJECTIVE EVALUATION ---
    const isWon = this.checkWinCondition(config, progress);
    const isLost = !isWon && (remainingMoves - 1 <= 0);

    return {
      steps,
      totalScoreEarned,
      finalObjectiveProgress: progress,
      isWon,
      isLost,
      shuffled,
    };
  }

  /**
   * Resolves a single match step, clearing candies, detonating specials, and dropping replacements.
   */
  private static resolveMatchStep(
    grid: Tile[][],
    matchGroups: ReturnType<typeof MatchDetector.findMatches>,
    config: LevelConfig,
    progress: ObjectiveProgress,
    comboCount: number,
    handleAdjacentBlockers: (positions: GridPosition[]) => {
      damagedFrosting: { position: GridPosition; remaining: number }[];
      clearedChocolate: GridPosition[];
    },
    onChocolateDestroyed: (destroyed: boolean) => void
  ): CascadeStep {
    const clearedEvents: ClearedCandyEvent[] = [];
    const createdSpecials: { position: GridPosition; candy: Candy }[] = [];
    const clearedJellies: GridPosition[] = [];
    const clearedTilesSet = new Set<string>();

    // 1. Collect all matched tiles and identify specials to spawn
    const specialsToSpawn = new Map<string, { position: GridPosition; type: SpecialType; color: CandyColor }>();

    for (const group of matchGroups) {
      if (group.createdSpecial) {
        const key = `${group.createdSpecial.position.row},${group.createdSpecial.position.col}`;
        specialsToSpawn.set(key, group.createdSpecial);
      }

      for (const pos of group.tiles) {
        const key = `${pos.row},${pos.col}`;
        const tile = grid[pos.row]?.[pos.col];
        if (tile && tile.candy && !clearedTilesSet.has(key)) {
          clearedTilesSet.add(key);

          // If tile has an existing special candy, detonate it!
          if (tile.candy.special !== 'NONE') {
            const specialRes = SpecialCandyEngine.triggerSingleSpecial(grid, pos);
            clearedEvents.push(...specialRes.clearedEvents);
            for (const jPos of specialRes.affectedJellies) {
              const jt = grid[jPos.row][jPos.col];
              if (jt.jellyLayer > 0) {
                jt.jellyLayer--;
                clearedJellies.push(jPos);
                if (jt.jellyLayer === 0) progress.jelliesCleared++;
              }
            }
          }

          clearedEvents.push({
            row: pos.row,
            col: pos.col,
            candy: { ...tile.candy },
            reason: 'MATCH',
          });

          // Check jelly on matched tile
          if (tile.jellyLayer > 0) {
            tile.jellyLayer--;
            clearedJellies.push({ row: pos.row, col: pos.col });
            if (tile.jellyLayer === 0) progress.jelliesCleared++;
          }
        }
      }
    }

    // 2. Remove cleared candies from the board
    for (const evt of clearedEvents) {
      grid[evt.row][evt.col].candy = null;
      const color = evt.candy.color;
      progress.colorsCollected[color] = (progress.colorsCollected[color] || 0) + 1;
    }

    // 3. Spawn created special candies at their target locations
    for (const [_, spec] of specialsToSpawn) {
      const specialCandy = BoardManager.createCandy(
        spec.color, 
        spec.position.row, 
        spec.position.col, 
        spec.type
      );
      grid[spec.position.row][spec.position.col].candy = specialCandy;
      createdSpecials.push({
        position: spec.position,
        candy: specialCandy,
      });
    }

    // 4. Handle adjacent obstacles
    const blockerRes = handleAdjacentBlockers(
      clearedEvents.map(e => ({ row: e.row, col: e.col }))
    );
    if (blockerRes.clearedChocolate.length > 0) {
      onChocolateDestroyed(true);
    }

    // 5. Apply gravity
    const grav = GravityEngine.applyGravity(grid, config.allowedColors);
    for (const ing of grav.collectedIngredients) {
      if (ing.type === 'CHERRY') progress.cherriesCollected++;
      if (ing.type === 'NUT') progress.nutsCollected++;
    }

    // 6. Calculate score
    const stepScore = ScoreCalculator.calculateStepScore(
      clearedEvents,
      clearedJellies.length,
      blockerRes.damagedFrosting.length,
      blockerRes.clearedChocolate.length,
      grav.collectedIngredients.length,
      'NONE',
      comboCount
    );
    progress.score += stepScore;

    return {
      clearedCandies: clearedEvents,
      createdSpecials,
      clearedJellies,
      damagedFrosting: blockerRes.damagedFrosting,
      clearedChocolate: blockerRes.clearedChocolate,
      collectedIngredients: grav.collectedIngredients,
      drops: grav.drops,
      spawns: grav.spawns,
      scoreEarned: stepScore,
      comboCount,
    };
  }

  /**
   * Spreads 1 chocolate to an adjacent normal candy if chocolate exists and none was destroyed.
   */
  private static spreadChocolate(grid: Tile[][]): GridPosition | undefined {
    const rows = grid.length;
    const cols = grid[0].length;
    const chocolateTiles: GridPosition[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].hasChocolate) {
          chocolateTiles.push({ row: r, col: c });
        }
      }
    }

    if (chocolateTiles.length === 0) return undefined;

    // Shuffle chocolates to pick a random one
    const shuffled = [...chocolateTiles].sort(() => Math.random() - 0.5);
    const neighbors = [
      { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
    ];

    for (const ch of shuffled) {
      for (const n of neighbors) {
        const nr = ch.row + n.r;
        const nc = ch.col + n.c;
        if (BoardManager.isValidCoord(grid, nr, nc)) {
          const target = grid[nr][nc];
          if (
            target.isPlayable && 
            target.candy && 
            !target.hasChocolate && 
            target.frostingLayer === 0 &&
            !target.candy.isIngredient
          ) {
            target.candy = null;
            target.hasChocolate = true;
            return { row: nr, col: nc };
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Evaluates if all objectives in the level configuration have been met.
   */
  public static checkWinCondition(config: LevelConfig, progress: ObjectiveProgress): boolean {
    for (const obj of config.objectives) {
      switch (obj.type) {
        case 'SCORE':
          if (obj.targetScore && progress.score < obj.targetScore) return false;
          break;
        case 'JELLY':
          if (progress.jelliesCleared < progress.totalJellies) return false;
          break;
        case 'INGREDIENTS':
          if (progress.totalCherries > 0 && progress.cherriesCollected < progress.totalCherries) return false;
          if (progress.totalNuts > 0 && progress.nutsCollected < progress.totalNuts) return false;
          break;
        case 'BLOCKERS':
          if (progress.blockersCleared < progress.totalBlockers) return false;
          break;
        case 'COLLECT_COLOR':
          if (obj.targetColors) {
            for (const [col, required] of Object.entries(obj.targetColors)) {
              const collected = progress.colorsCollected[col as CandyColor] || 0;
              if (collected < (required || 0)) return false;
            }
          }
          break;
      }
    }
    return true;
  }
}
