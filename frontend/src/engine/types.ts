export type CandyColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'PURPLE';

export const ALL_CANDY_COLORS: CandyColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE'];

export type SpecialType = 'NONE' | 'STRIPED_H' | 'STRIPED_V' | 'WRAPPED' | 'COLOR_BOMB';

export type BlockerType = 'NONE' | 'FROSTING_1' | 'FROSTING_2' | 'FROSTING_3' | 'CHOCOLATE';

export type IngredientType = 'NONE' | 'CHERRY' | 'NUT';

export interface Candy {
  id: string;
  color: CandyColor;
  special: SpecialType;
  isIngredient?: boolean;
  ingredientType?: IngredientType;
  row: number;
  col: number;
  key: string;
}

export interface Tile {
  row: number;
  col: number;
  isPlayable: boolean;
  candy: Candy | null;
  jellyLayer: number; // 0 = none, 1 = single jelly, 2 = double jelly
  frostingLayer: number; // 0 = none, 1 = 1-hit, 2 = 2-hit, 3 = 3-hit
  hasChocolate: boolean;
  isSpawner: boolean;
}

export interface GridPosition {
  row: number;
  col: number;
}

export type MatchShape = 'HORIZONTAL_3' | 'HORIZONTAL_4' | 'HORIZONTAL_5' | 
                         'VERTICAL_3' | 'VERTICAL_4' | 'VERTICAL_5' | 
                         'T_SHAPE' | 'L_SHAPE' | 'CROSS' | 'COLOR_BOMB' |
                         'SQUARE_2X2' | 'GROUP_MATCH';

export interface MatchGroup {
  tiles: GridPosition[];
  color: CandyColor;
  shape: MatchShape;
  createdSpecial?: {
    position: GridPosition;
    type: SpecialType;
    color: CandyColor;
  };
}

export type ComboType = 
  | 'STRIPED_STRIPED'
  | 'WRAPPED_WRAPPED'
  | 'STRIPED_WRAPPED'
  | 'COLOR_BOMB_STRIPED'
  | 'COLOR_BOMB_WRAPPED'
  | 'COLOR_BOMB_COLOR_BOMB'
  | 'COLOR_BOMB_NORMAL'
  | 'NONE';

export interface ClearedCandyEvent {
  row: number;
  col: number;
  candy: Candy;
  reason: 'MATCH' | 'STRIPED' | 'WRAPPED' | 'COLOR_BOMB' | 'COMBO' | 'HAMMER' | 'OBJECTIVE';
}

export interface DropEvent {
  fromRow: number;
  toRow: number;
  col: number;
  candyId: string;
}

export interface SpawnEvent {
  row: number;
  col: number;
  candy: Candy;
}

export interface CascadeStep {
  clearedCandies: ClearedCandyEvent[];
  createdSpecials: { position: GridPosition; candy: Candy }[];
  clearedJellies: GridPosition[];
  damagedFrosting: { position: GridPosition; remaining: number }[];
  clearedChocolate: GridPosition[];
  collectedIngredients: { position: GridPosition; type: IngredientType }[];
  drops: DropEvent[];
  spawns: SpawnEvent[];
  scoreEarned: number;
  comboCount: number;
  chocolateSpread?: GridPosition;
}

export type ObjectiveType = 'SCORE' | 'JELLY' | 'INGREDIENTS' | 'BLOCKERS' | 'COLLECT_COLOR';

export interface LevelObjective {
  type: ObjectiveType;
  targetScore?: number;
  totalJellies?: number;
  totalIngredients?: { cherry: number; nut: number };
  totalBlockers?: number;
  targetColors?: Partial<Record<CandyColor, number>>;
}

export interface ObjectiveProgress {
  score: number;
  jelliesCleared: number;
  totalJellies: number;
  cherriesCollected: number;
  totalCherries: number;
  nutsCollected: number;
  totalNuts: number;
  blockersCleared: number;
  totalBlockers: number;
  colorsCollected: Partial<Record<CandyColor, number>>;
  targetColors: Partial<Record<CandyColor, number>>;
}

export interface LevelConfig {
  id: number;
  name: string;
  episode: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  rows: number;
  cols: number;
  moveLimit: number;
  timeLimitSeconds?: number;
  starScores: [number, number, number]; // 1, 2, 3 stars
  allowedColors: CandyColor[];
  objectives: LevelObjective[];
  layout?: string[]; // '.' = empty, '#' = tile, 'J' = single jelly, 'D' = double jelly, 'C' = chocolate, 'F1'..'F3' = frosting, 'I' = ingredient
  initialIngredients?: { row: number; col: number; type: IngredientType }[];
}

export type BoosterType = 
  | 'EXTRA_MOVES' 
  | 'LOLLIPOP_HAMMER' 
  | 'FREE_SWITCH' 
  | 'COLOR_BOMB' 
  | 'STRIPED_BRUSH' 
  | 'SHUFFLE' 
  | 'EXTRA_TIME';

export interface UserInventory {
  coins: number;
  lives: number;
  maxLives: number;
  lastLifeRegenTime: number; // timestamp ms
  boosters: Record<BoosterType, number>;
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelId -> stars
  highScores: Record<number, number>; // levelId -> score
}
