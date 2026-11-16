import { CandyColor, BoosterType } from './types';

export const CANDY_THEME: Record<CandyColor, {
  name: string;
  fill: string;
  glow: string;
  border: string;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'hexagon';
}> = {
  RED: {
    name: 'Strawberry Heart',
    fill: '#FF2A6D',
    glow: 'rgba(255, 42, 109, 0.6)',
    border: '#B30043',
    shape: 'circle',
  },
  BLUE: {
    name: 'Blueberry Drop',
    fill: '#05D9E8',
    glow: 'rgba(5, 217, 232, 0.6)',
    border: '#008B9B',
    shape: 'square',
  },
  GREEN: {
    name: 'Lime Clover',
    fill: '#00E676',
    glow: 'rgba(0, 230, 118, 0.6)',
    border: '#009624',
    shape: 'triangle',
  },
  YELLOW: {
    name: 'Lemon Star',
    fill: '#FFEA00',
    glow: 'rgba(255, 234, 0, 0.6)',
    border: '#C79A00',
    shape: 'star',
  },
  ORANGE: {
    name: 'Orange Sunburst',
    fill: '#FF8A00',
    glow: 'rgba(255, 138, 0, 0.6)',
    border: '#C45700',
    shape: 'diamond',
  },
  PURPLE: {
    name: 'Grape Cluster',
    fill: '#9B5DE5',
    glow: 'rgba(155, 93, 229, 0.6)',
    border: '#6B21A8',
    shape: 'hexagon',
  },
};

export const SCORES = {
  MATCH_3: 60,
  MATCH_4: 120,
  MATCH_5_LINE: 250,
  MATCH_T_OR_L: 200,
  STRIPED_TRIGGER: 300,
  WRAPPED_TRIGGER: 600,
  COLOR_BOMB_TRIGGER: 1000,
  COMBO_STRIPED_STRIPED: 2500,
  COMBO_WRAPPED_WRAPPED: 4000,
  COMBO_STRIPED_WRAPPED: 5000,
  COMBO_COLOR_BOMB_STRIPED: 6000,
  COMBO_COLOR_BOMB_WRAPPED: 8000,
  COMBO_COLOR_BOMB_COLOR_BOMB: 12000,
  JELLY_CLEARED: 100,
  FROSTING_HIT: 50,
  FROSTING_DESTROYED: 150,
  CHOCOLATE_CLEARED: 100,
  INGREDIENT_COLLECTED: 1500,
  MOVES_REMAINING_BONUS: 1000, // Per leftover move on win
};

export const BOOSTER_CONFIGS: Record<BoosterType, {
  name: string;
  description: string;
  icon: string;
  cost: number;
  inGameTargetRequired: boolean;
}> = {
  EXTRA_MOVES: {
    name: 'Extra Moves',
    description: 'Add 5 extra moves to your current level',
    icon: '➕5',
    cost: 150,
    inGameTargetRequired: false,
  },
  LOLLIPOP_HAMMER: {
    name: 'Lollipop Hammer',
    description: 'Smash and remove any single candy or blocker',
    icon: '🔨',
    cost: 200,
    inGameTargetRequired: true,
  },
  FREE_SWITCH: {
    name: 'Free Switch',
    description: 'Swap any two adjacent candies without matching',
    icon: '🔄',
    cost: 250,
    inGameTargetRequired: true, // Needs 2 tiles selected
  },
  COLOR_BOMB: {
    name: 'Color Bomb',
    description: 'Spawn a Rainbow Color Bomb on the board',
    icon: '🌈',
    cost: 300,
    inGameTargetRequired: false,
  },
  STRIPED_BRUSH: {
    name: 'Striped Brush',
    description: 'Paint any candy into a powerful striped candy',
    icon: '🖌️',
    cost: 180,
    inGameTargetRequired: true,
  },
  SHUFFLE: {
    name: 'Shuffle Board',
    description: 'Reshuffle all regular candies on the board',
    icon: '🔀',
    cost: 120,
    inGameTargetRequired: false,
  },
  EXTRA_TIME: {
    name: 'Extra Time',
    description: 'Add 15 seconds to timed levels',
    icon: '⏳+15s',
    cost: 150,
    inGameTargetRequired: false,
  },
};

export const LIFE_REGENERATION_TIME_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_LIVES = 5;

export const COMBO_PHRASES = [
  'Sweet!',
  'Tasty!',
  'Delicious!',
  'Sugar Rush!',
  'Divine!',
  'Unbelievable!',
];
