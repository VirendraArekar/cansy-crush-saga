import { SCORES } from './constants';
import { ClearedCandyEvent, ComboType } from './types';

export class ScoreCalculator {
  /**
   * Calculates score for a single cascade step.
   */
  public static calculateStepScore(
    clearedCandies: ClearedCandyEvent[],
    clearedJelliesCount: number,
    damagedFrostingCount: number,
    clearedChocolateCount: number,
    collectedIngredientsCount: number,
    comboType: ComboType,
    comboCount: number
  ): number {
    let baseScore = 0;

    // Candy clearances
    for (const item of clearedCandies) {
      if (item.candy.special === 'STRIPED_H' || item.candy.special === 'STRIPED_V') {
        baseScore += SCORES.STRIPED_TRIGGER;
      } else if (item.candy.special === 'WRAPPED') {
        baseScore += SCORES.WRAPPED_TRIGGER;
      } else if (item.candy.special === 'COLOR_BOMB') {
        baseScore += SCORES.COLOR_BOMB_TRIGGER;
      } else {
        baseScore += 60;
      }
    }

    // Special combo bonuses
    switch (comboType) {
      case 'STRIPED_STRIPED': baseScore += SCORES.COMBO_STRIPED_STRIPED; break;
      case 'WRAPPED_WRAPPED': baseScore += SCORES.COMBO_WRAPPED_WRAPPED; break;
      case 'STRIPED_WRAPPED': baseScore += SCORES.COMBO_STRIPED_WRAPPED; break;
      case 'COLOR_BOMB_STRIPED': baseScore += SCORES.COMBO_COLOR_BOMB_STRIPED; break;
      case 'COLOR_BOMB_WRAPPED': baseScore += SCORES.COMBO_COLOR_BOMB_WRAPPED; break;
      case 'COLOR_BOMB_COLOR_BOMB': baseScore += SCORES.COMBO_COLOR_BOMB_COLOR_BOMB; break;
      default: break;
    }

    // Obstacles
    baseScore += clearedJelliesCount * SCORES.JELLY_CLEARED;
    baseScore += damagedFrostingCount * SCORES.FROSTING_HIT;
    baseScore += clearedChocolateCount * SCORES.CHOCOLATE_CLEARED;
    baseScore += collectedIngredientsCount * SCORES.INGREDIENT_COLLECTED;

    // Cascade Multiplier
    const multiplier = 1 + (Math.max(0, comboCount - 1) * 0.5);
    return Math.round(baseScore * multiplier);
  }

  /**
   * Determines star rating achieved based on score and star thresholds.
   */
  public static calculateStars(score: number, starScores: [number, number, number]): number {
    if (score >= starScores[2]) return 3;
    if (score >= starScores[1]) return 2;
    if (score >= starScores[0]) return 1;
    return 0;
  }

  /**
   * Calculates end-game bonus score for remaining moves.
   */
  public static calculateEndGameBonus(remainingMoves: number): number {
    return Math.max(0, remainingMoves) * SCORES.MOVES_REMAINING_BONUS;
  }
}
