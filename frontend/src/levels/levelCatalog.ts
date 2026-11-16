import { LevelConfig, CandyColor } from '../engine/types';

const EPISODES = [
  'Sugar Shores',
  'Jelly Jungle',
  'Frosting Falls',
  'Chocolate Canyon',
  'Caramel Cove',
  'Peppermint Peaks',
  'Lollipop Lagoon',
  'Gummy Galaxy',
  'Toffee Town',
  'Rainbow Realm',
];

export function generate100Levels(): LevelConfig[] {
  const levels: LevelConfig[] = [];
  const baseColors: CandyColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE'];

  for (let i = 1; i <= 100; i++) {
    const episodeIndex = Math.floor((i - 1) / 10);
    const episode = EPISODES[Math.min(EPISODES.length - 1, episodeIndex)];

    let difficulty: LevelConfig['difficulty'] = 'EASY';
    if (i > 80) difficulty = 'EXPERT';
    else if (i > 45) difficulty = 'HARD';
    else if (i > 15) difficulty = 'MEDIUM';

    const moves = Math.max(16, 32 - Math.floor(i / 6));
    const starScores: [number, number, number] = [
      1200 + i * 350,
      2400 + i * 650,
      4000 + i * 1100,
    ];

    // Colors count: early levels have 4 colors for easier combos, later levels 5 or 6 colors
    const colorCount = i <= 5 ? 4 : i <= 20 ? 5 : 6;
    const allowedColors = baseColors.slice(0, colorCount);

    let objectives: LevelConfig['objectives'] = [];
    let layout: string[] | undefined = undefined;
    let initialIngredients: LevelConfig['initialIngredients'] = undefined;
    let timeLimitSeconds: number | undefined = undefined;

    // Type of level determines layout and objectives
    if (i <= 5) {
      // Tutorial & score levels
      objectives = [
        { type: 'SCORE', targetScore: starScores[0] },
      ];
      if (i > 2) {
        objectives.push({
          type: 'COLLECT_COLOR',
          targetColors: { RED: 15 + i * 2, BLUE: 15 + i * 2 },
        });
      }
    } else if (i <= 25) {
      // Jelly levels (Single and Double Jelly)
      const isDouble = i > 15;
      const jToken = isDouble ? 'J2' : 'J1';
      
      // Board with jelly in center 4x4 or 6x6
      layout = [];
      let totalJellies = 0;
      for (let r = 0; r < 8; r++) {
        const rowTokens: string[] = [];
        for (let c = 0; c < 8; c++) {
          if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
            rowTokens.push(jToken);
            totalJellies++;
          } else {
            rowTokens.push('#');
          }
        }
        layout.push(rowTokens.join(' '));
      }

      objectives = [
        { type: 'JELLY', totalJellies },
        { type: 'SCORE', targetScore: starScores[0] },
      ];
    } else if (i <= 50) {
      // Frosting Blocker levels
      const fToken = i > 40 ? 'F3' : i > 30 ? 'F2' : 'F1';
      layout = [];
      let totalBlockers = 0;

      for (let r = 0; r < 8; r++) {
        const rowTokens: string[] = [];
        for (let c = 0; c < 8; c++) {
          // Bottom rows or checkerboard blockers
          if (r >= 5 && (c >= 2 && c <= 5)) {
            rowTokens.push(fToken);
            totalBlockers++;
          } else if (r === 3 && (c === 0 || c === 7)) {
            rowTokens.push('.'); // Cutout non-playable corners
          } else {
            rowTokens.push('#');
          }
        }
        layout.push(rowTokens.join(' '));
      }

      objectives = [
        { type: 'BLOCKERS', totalBlockers },
        { type: 'SCORE', targetScore: starScores[0] },
      ];
    } else if (i <= 70) {
      // Chocolate Levels
      layout = [];
      let chocolateCount = 0;
      for (let r = 0; r < 8; r++) {
        const rowTokens: string[] = [];
        for (let c = 0; c < 8; c++) {
          if (r === 7 && (c === 3 || c === 4)) {
            rowTokens.push('C');
            chocolateCount++;
          } else {
            rowTokens.push('#');
          }
        }
        layout.push(rowTokens.join(' '));
      }

      objectives = [
        { type: 'BLOCKERS', totalBlockers: chocolateCount },
        {
          type: 'COLLECT_COLOR',
          targetColors: { GREEN: 25, YELLOW: 25 },
        },
        { type: 'SCORE', targetScore: starScores[0] },
      ];
    } else if (i <= 85) {
      // Ingredients Levels (Cherries & Acorns)
      initialIngredients = [
        { row: 0, col: 2, type: 'CHERRY' },
        { row: 0, col: 5, type: 'NUT' },
      ];
      if (i > 78) {
        initialIngredients.push({ row: 1, col: 4, type: 'CHERRY' });
      }

      objectives = [
        { 
          type: 'INGREDIENTS', 
          totalIngredients: { 
            cherry: i > 78 ? 2 : 1, 
            nut: 1 
          } 
        },
        { type: 'SCORE', targetScore: starScores[0] },
      ];
    } else if (i <= 92) {
      // Timed fast-action levels!
      timeLimitSeconds = 60 + (i % 3) * 15;
      objectives = [
        { type: 'SCORE', targetScore: starScores[0] },
        {
          type: 'COLLECT_COLOR',
          targetColors: { RED: 30, PURPLE: 25 },
        },
      ];
    } else {
      // Levels 93-100: Grandmaster multi-objective levels!
      layout = [];
      let totalJellies = 0;
      for (let r = 0; r < 8; r++) {
        const rowTokens: string[] = [];
        for (let c = 0; c < 8; c++) {
          if ((r === 6 || r === 7) && (c >= 1 && c <= 6)) {
            rowTokens.push('J2');
            totalJellies++;
          } else if (r === 4 && (c === 3 || c === 4)) {
            rowTokens.push('C');
          } else {
            rowTokens.push('#');
          }
        }
        layout.push(rowTokens.join(' '));
      }

      initialIngredients = [
        { row: 0, col: 3, type: 'CHERRY' },
      ];

      objectives = [
        { type: 'JELLY', totalJellies },
        { type: 'INGREDIENTS', totalIngredients: { cherry: 1, nut: 0 } },
        { type: 'SCORE', targetScore: starScores[0] },
      ];
    }

    levels.push({
      id: i,
      name: `Level ${i}`,
      episode,
      difficulty,
      rows: 8,
      cols: 8,
      moveLimit: moves,
      timeLimitSeconds,
      starScores,
      allowedColors,
      objectives,
      layout,
      initialIngredients,
    });
  }

  return levels;
}

export const LEVEL_CATALOG: LevelConfig[] = generate100Levels();

export function getLevelConfig(levelId: number): LevelConfig {
  const found = LEVEL_CATALOG.find(l => l.id === levelId);
  return found || LEVEL_CATALOG[0];
}
