import { describe, it, expect } from 'vitest';
import { ScoreCalculator } from '../src/engine/ScoreCalculator';
import { BoardManager } from '../src/engine/BoardManager';
import { ClearedCandyEvent } from '../src/engine/types';

describe('ScoreCalculator', () => {
  it('calculates score with combo multipliers correctly', () => {
    const dummyEvents: ClearedCandyEvent[] = [
      { row: 0, col: 0, candy: BoardManager.createCandy('RED', 0, 0), reason: 'MATCH' },
      { row: 0, col: 1, candy: BoardManager.createCandy('RED', 0, 1), reason: 'MATCH' },
      { row: 0, col: 2, candy: BoardManager.createCandy('RED', 0, 2), reason: 'MATCH' },
    ];

    // comboCount 1 -> 3 * 60 = 180
    const score1 = ScoreCalculator.calculateStepScore(dummyEvents, 0, 0, 0, 0, 'NONE', 1);
    expect(score1).toBe(180);

    // comboCount 2 -> 180 * 1.5 = 270
    const score2 = ScoreCalculator.calculateStepScore(dummyEvents, 0, 0, 0, 0, 'NONE', 2);
    expect(score2).toBe(270);
  });

  it('calculates star ratings correctly', () => {
    const thresholds: [number, number, number] = [1000, 2500, 5000];

    expect(ScoreCalculator.calculateStars(500, thresholds)).toBe(0);
    expect(ScoreCalculator.calculateStars(1000, thresholds)).toBe(1);
    expect(ScoreCalculator.calculateStars(2600, thresholds)).toBe(2);
    expect(ScoreCalculator.calculateStars(6000, thresholds)).toBe(3);
  });

  it('calculates end-game bonus for leftover moves', () => {
    const bonus = ScoreCalculator.calculateEndGameBonus(5);
    expect(bonus).toBe(5000);
  });
});
