import { create } from 'zustand';
import { 
  LevelConfig, 
  Tile, 
  GridPosition, 
  ObjectiveProgress, 
  BoosterType, 
  CascadeStep,
  ComboType 
} from '../engine/types';
import { BoardManager } from '../engine/BoardManager';
import { SwapValidator } from '../engine/SwapValidator';
import { CascadeEngine } from '../engine/CascadeEngine';
import { BoosterManager } from '../engine/BoosterManager';
import { SoundEngine } from '../engine/SoundEngine';
import { ScoreCalculator } from '../engine/ScoreCalculator';
import { COMBO_PHRASES } from '../engine/constants';
import { getLevelConfig } from '../levels/levelCatalog';
import { visualBoard } from '../engine/VisualBoard';
import { useUserStore } from './userStore';
import { useTaskStore } from './taskStore';
import { toast } from './toastStore';

export type GameScreen = 
  | 'SPLASH' 
  | 'AUTH' 
  | 'HOME' 
  | 'MAP' 
  | 'PLAYING' 
  | 'SHOP' 
  | 'PROFILE' 
  | 'SETTINGS' 
  | 'LEADERBOARD';

export interface GameState {
  currentScreen: GameScreen;
  levelConfig: LevelConfig;
  grid: Tile[][];
  score: number;
  movesLeft: number;
  timeLeft: number | null;
  stars: number;
  progress: ObjectiveProgress;
  selectedTile: GridPosition | null;
  activeBooster: BoosterType | null;
  freeSwitchFirstTile: GridPosition | null;
  isAnimating: boolean;
  gameStatus: 'PLAYING' | 'PAUSED' | 'WON' | 'LOST';
  comboText: string | null;
  currentSteps: CascadeStep[];
  stepIndex: number;

  // Actions
  setScreen: (screen: GameScreen) => void;
  startLevel: (levelId: number, pregameBoosters?: { colorBomb?: boolean; stripedWrapped?: boolean; extraMoves?: boolean }) => boolean;
  selectTile: (pos: GridPosition) => void;
  activateBooster: (type: BoosterType) => void;
  cancelActiveBooster: () => void;
  tickTimer: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartLevel: () => void;
  nextLevel: () => void;
  addExtraMoves: (count: number) => void;
  executeSwapMove: (posA: GridPosition, posB: GridPosition) => Promise<boolean>;
  startCascadeSequence: (posA: GridPosition, posB: GridPosition, combo: ComboType) => Promise<void>;
  handleLevelWin: () => void;
  handleLevelFail: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: 'SPLASH',
  levelConfig: getLevelConfig(1),
  grid: [],
  score: 0,
  movesLeft: 25,
  timeLeft: null,
  stars: 0,
  progress: {
    score: 0,
    jelliesCleared: 0,
    totalJellies: 0,
    cherriesCollected: 0,
    totalCherries: 0,
    nutsCollected: 0,
    totalNuts: 0,
    blockersCleared: 0,
    totalBlockers: 0,
    colorsCollected: {},
    targetColors: {},
  },
  selectedTile: null,
  activeBooster: null,
  freeSwitchFirstTile: null,
  isAnimating: false,
  gameStatus: 'PLAYING',
  comboText: null,
  currentSteps: [],
  stepIndex: 0,

  setScreen: (screen) => set({ currentScreen: screen }),

  startLevel: (levelId, pregameBoosters) => {
    const userStore = useUserStore.getState();
    if (userStore.lives <= 0) {
      toast.error('No lives remaining! Please wait for life regeneration or watch a rewarded video.', 'Out of Lives');
      return false;
    }

    const config = getLevelConfig(levelId);
    const initialGrid = BoardManager.initializeBoard(config);

    // Apply pre-game boosters if selected
    let moves = config.moveLimit;
    if (pregameBoosters?.extraMoves) {
      moves += 3;
    }

    if (pregameBoosters?.colorBomb) {
      for (let r = 0; r < initialGrid.length; r++) {
        let placed = false;
        for (let c = 0; c < initialGrid[0].length; c++) {
          const t = initialGrid[r][c];
          if (t.isPlayable && t.candy && t.candy.special === 'NONE' && !t.candy.isIngredient) {
            t.candy.special = 'COLOR_BOMB';
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }

    if (pregameBoosters?.stripedWrapped) {
      let placed = false;
      for (let r = 0; r < initialGrid.length && !placed; r++) {
        for (let c = 0; c < initialGrid[0].length - 1 && !placed; c++) {
          const t1 = initialGrid[r][c];
          const t2 = initialGrid[r][c + 1];
          if (
            t1.isPlayable && t1.candy && t1.candy.special === 'NONE' && !t1.candy.isIngredient &&
            t2.isPlayable && t2.candy && t2.candy.special === 'NONE' && !t2.candy.isIngredient
          ) {
            t1.candy.special = 'STRIPED_H';
            t2.candy.special = 'WRAPPED';
            placed = true;
          }
        }
      }
    }

    // Count initial objectives
    let totalJellies = 0;
    let totalBlockers = 0;
    let totalCherries = 0;
    let totalNuts = 0;
    const targetColors: Record<string, number> = {};

    for (const obj of config.objectives) {
      if (obj.type === 'JELLY') totalJellies = obj.totalJellies || 0;
      if (obj.type === 'BLOCKERS') totalBlockers = obj.totalBlockers || 0;
      if (obj.type === 'INGREDIENTS') {
        totalCherries = obj.totalIngredients?.cherry || 0;
        totalNuts = obj.totalIngredients?.nut || 0;
      }
      if (obj.type === 'COLLECT_COLOR' && obj.targetColors) {
        Object.assign(targetColors, obj.targetColors);
      }
    }

    const progress: ObjectiveProgress = {
      score: 0,
      jelliesCleared: 0,
      totalJellies,
      cherriesCollected: 0,
      totalCherries,
      nutsCollected: 0,
      totalNuts,
      blockersCleared: 0,
      totalBlockers,
      colorsCollected: {},
      targetColors,
    };

    set({
      currentScreen: 'PLAYING',
      levelConfig: config,
      grid: initialGrid,
      score: 0,
      movesLeft: moves,
      timeLeft: config.timeLimitSeconds ?? null,
      stars: 0,
      progress,
      selectedTile: null,
      activeBooster: null,
      freeSwitchFirstTile: null,
      isAnimating: false,
      gameStatus: 'PLAYING',
      comboText: null,
      currentSteps: [],
      stepIndex: 0,
    });

    visualBoard.syncFromGrid(initialGrid, true);
    SoundEngine.startBGM();
    return true;
  },

  selectTile: (pos) => {
    const { 
      isAnimating, 
      gameStatus, 
      activeBooster, 
      freeSwitchFirstTile, 
      selectedTile, 
      grid, 
      levelConfig, 
      progress, 
      movesLeft 
    } = get();

    if (isAnimating || gameStatus !== 'PLAYING') return;

    // --- CASE 1: ACTIVE BOOSTER IN PROGRESS ---
    if (activeBooster) {
      if (activeBooster === 'LOLLIPOP_HAMMER') {
        const consumed = useUserStore.getState().consumeBooster('LOLLIPOP_HAMMER');
        if (consumed) {
          SoundEngine.playBooster();
          toast.sweet('Lollipop Hammer smashed the target tile!', 'Booster Used', 2000, '🔨');
          const nextGrid = BoardManager.cloneGrid(grid);
          BoosterManager.useLollipopHammer(nextGrid, pos);
          set({ grid: nextGrid, activeBooster: null });

          // Run cascade check
          get().startCascadeSequence(pos, pos, 'NONE');
        }
        return;
      }

      if (activeBooster === 'FREE_SWITCH') {
        if (!freeSwitchFirstTile) {
          SoundEngine.playSelect();
          toast.info('First candy selected. Tap an adjacent candy to swap!', 'Free Switch', 2000);
          set({ freeSwitchFirstTile: pos });
        } else {
          const consumed = useUserStore.getState().consumeBooster('FREE_SWITCH');
          if (consumed) {
            SoundEngine.playBooster();
            toast.sweet('Candies freely switched!', 'Booster Used', 2000, '🔄');
            const nextGrid = BoardManager.cloneGrid(grid);
            BoosterManager.useFreeSwitch(nextGrid, freeSwitchFirstTile, pos);
            set({ grid: nextGrid, activeBooster: null, freeSwitchFirstTile: null });

            // Check if matches or cascades trigger
            get().startCascadeSequence(freeSwitchFirstTile, pos, 'NONE');
          }
        }
        return;
      }

      if (activeBooster === 'STRIPED_BRUSH') {
        const consumed = useUserStore.getState().consumeBooster('STRIPED_BRUSH');
        if (consumed) {
          SoundEngine.playBooster();
          toast.sweet('Candy transformed into a Striped Laser Candy!', 'Booster Used', 2000, '🖌️');
          const nextGrid = BoardManager.cloneGrid(grid);
          BoosterManager.useStripedBrush(nextGrid, pos);
          set({ grid: nextGrid, activeBooster: null });
        }
        return;
      }

      return;
    }

    // --- CASE 2: REGULAR CANDY SELECTION / SWAPPING ---
    if (!selectedTile) {
      // First tile selected
      SoundEngine.playSelect();
      set({ selectedTile: pos });
      return;
    }

    // If user tapped same tile again, unselect
    if (selectedTile.row === pos.row && selectedTile.col === pos.col) {
      set({ selectedTile: null });
      return;
    }

    // If adjacent: execute swap with authentic smooth animations!
    if (SwapValidator.isAdjacent(selectedTile, pos)) {
      get().executeSwapMove(selectedTile, pos);
      return;
    }

    // If not adjacent, simply select new tile
    SoundEngine.playSelect();
    set({ selectedTile: pos });
  },

  executeSwapMove: async (posA: GridPosition, posB: GridPosition) => {
    const { isAnimating, gameStatus, grid } = get();
    if (isAnimating || gameStatus !== 'PLAYING') return false;

    set({ isAnimating: true, selectedTile: null });

    const validation = SwapValidator.isValidSwap(grid, posA, posB);
    if (!validation.valid) {
      // Smooth invalid swap slide & bounce back
      await visualBoard.animateInvalidSwap(posA, posB);
      set({ isAnimating: false });
      return false;
    }

    // Smooth valid swap slide
    SoundEngine.playSwap();
    await visualBoard.animateSwap(posA, posB);

    // Physically swap candies in memory grid
    const workingGrid = BoardManager.cloneGrid(grid);
    if (validation.combo === 'NONE') {
      const temp = workingGrid[posA.row][posA.col].candy;
      workingGrid[posA.row][posA.col].candy = workingGrid[posB.row][posB.col].candy;
      workingGrid[posB.row][posB.col].candy = temp;
    }

    // Run cascade reactions
    await get().startCascadeSequence(posA, posB, validation.combo);
    return true;
  },

  // Internal orchestrator for cascading animation playback
  startCascadeSequence: async (posA: GridPosition, posB: GridPosition, combo: ComboType) => {
    set({ isAnimating: true, selectedTile: null });
    const { grid, levelConfig, progress, movesLeft } = get();
    const clonedGrid = BoardManager.cloneGrid(grid);

    const turnResult = CascadeEngine.executeMove(
      clonedGrid,
      posA,
      posB,
      combo,
      levelConfig,
      progress,
      movesLeft
    );

    // Animate each cascade step sequentially
    for (let currentStep = 0; currentStep < turnResult.steps.length; currentStep++) {
      const step = turnResult.steps[currentStep];

      // Audio triggers
      if (combo !== 'NONE' && currentStep === 0) {
        SoundEngine.playCombo();
      } else {
        SoundEngine.playMatch(step.comboCount);
      }

      // Track task progress
      const taskStore = useTaskStore.getState();
      for (const evt of step.clearedCandies) {
        taskStore.trackCandyMatch(evt.candy.color, 1);
      }
      for (const spec of step.createdSpecials) {
        taskStore.trackSpecialCreated(spec.candy.special);
      }
      if (step.clearedJellies.length > 0) {
        taskStore.trackJellyCleared(step.clearedJellies.length);
      }

      // Floating combo text
      if (step.comboCount >= 2) {
        const phraseIdx = Math.min(COMBO_PHRASES.length - 1, step.comboCount - 2);
        set({ comboText: COMBO_PHRASES[phraseIdx] });
        setTimeout(() => set({ comboText: null }), 1200);
      }

      // Smooth step animation: Pop -> Drop -> Bounce
      await visualBoard.animateCascadeStep(step);
      await new Promise((r) => setTimeout(r, 60));
    }

    // All cascade steps finished!
    const nextMoves = Math.max(0, movesLeft - 1);
    const finalScore = turnResult.finalObjectiveProgress.score;
    const stars = ScoreCalculator.calculateStars(finalScore, levelConfig.starScores);

    set({
      grid: clonedGrid,
      score: finalScore,
      movesLeft: nextMoves,
      stars,
      progress: turnResult.finalObjectiveProgress,
      isAnimating: false,
    });

    if (turnResult.shuffled) {
      set({ comboText: 'SHUFFLE!' });
      visualBoard.syncFromGrid(clonedGrid, true);
      toast.warning('No possible matches detected! Board automatically reshuffled.', 'Board Reshuffle', 3000);
      setTimeout(() => set({ comboText: null }), 1200);
    }

    if (turnResult.isWon) {
      get().handleLevelWin();
    } else if (turnResult.isLost) {
      get().handleLevelFail();
    }
  },

  activateBooster: (type) => {
    const { grid, isAnimating, gameStatus } = get();
    if (isAnimating || gameStatus !== 'PLAYING') return;

    const userStore = useUserStore.getState();
    const count = userStore.boosters[type] || 0;
    if (count <= 0) {
      toast.warning(`You have no ${type.replace(/_/g, ' ').toLowerCase()} boosters! Get more from the shop.`, 'No Boosters');
      return;
    }

    if (type === 'EXTRA_MOVES') {
      if (userStore.consumeBooster('EXTRA_MOVES')) {
        SoundEngine.playBooster();
        toast.sweet('+5 Extra Moves added to your move counter!', 'Extra Moves Added', 2500, '➕');
        set((state) => ({ movesLeft: state.movesLeft + 5 }));
      }
      return;
    }

    if (type === 'EXTRA_TIME') {
      if (userStore.consumeBooster('EXTRA_TIME')) {
        SoundEngine.playBooster();
        toast.sweet('+15 Seconds added to the level timer!', 'Extra Time Added', 2500, '⏱️');
        set((state) => ({ timeLeft: (state.timeLeft || 0) + 15 }));
      }
      return;
    }

    if (type === 'SHUFFLE') {
      if (userStore.consumeBooster('SHUFFLE')) {
        SoundEngine.playBooster();
        toast.sweet('Board candies reshuffled!', 'Shuffle Booster', 2500, '🔀');
        const nextGrid = BoardManager.cloneGrid(grid);
        BoosterManager.useShuffleBooster(nextGrid);
        visualBoard.syncFromGrid(nextGrid, true);
        set({ grid: nextGrid });
      }
      return;
    }

    if (type === 'COLOR_BOMB') {
      if (userStore.consumeBooster('COLOR_BOMB')) {
        SoundEngine.playBooster();
        toast.sweet('Color Bomb booster placed on the board!', 'Color Bomb Ready', 2500, '💣');
        const nextGrid = BoardManager.cloneGrid(grid);
        BoosterManager.useColorBombBooster(nextGrid);
        visualBoard.syncFromGrid(nextGrid, true);
        set({ grid: nextGrid });
      }
      return;
    }

    // Boosters requiring target tile selection
    SoundEngine.playSelect();
    if (type === 'LOLLIPOP_HAMMER') {
      toast.info('Lollipop Hammer: Tap any tile or blocker to smash it!', 'Lollipop Hammer', 3000, '🔨');
    } else if (type === 'FREE_SWITCH') {
      toast.info('Free Switch: Tap any 2 candies to swap them without matching!', 'Free Switch', 3000, '🔄');
    } else if (type === 'STRIPED_BRUSH') {
      toast.info('Striped Brush: Tap any candy to convert it into a Striped Candy!', 'Striped Brush', 3000, '🖌️');
    }
    set({ activeBooster: type, freeSwitchFirstTile: null, selectedTile: null });
  },

  cancelActiveBooster: () => {
    set({ activeBooster: null, freeSwitchFirstTile: null });
  },

  tickTimer: () => {
    const { timeLeft, gameStatus, levelConfig, progress } = get();
    if (gameStatus !== 'PLAYING' || timeLeft === null) return;

    if (timeLeft <= 1) {
      const isWon = CascadeEngine.checkWinCondition(levelConfig, progress);
      if (isWon) {
        get().handleLevelWin();
      } else {
        get().handleLevelFail();
      }
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  pauseGame: () => {
    set({ gameStatus: 'PAUSED' });
  },

  resumeGame: () => {
    set({ gameStatus: 'PLAYING' });
  },

  restartLevel: () => {
    const { levelConfig } = get();
    get().startLevel(levelConfig.id);
  },

  nextLevel: () => {
    const { levelConfig } = get();
    get().startLevel(levelConfig.id + 1);
  },

  addExtraMoves: (count) => {
    toast.sweet(`+${count} Extra Moves added! Keep crushing!`, 'Moves Added', 2500, '➕');
    set((state) => ({
      movesLeft: state.movesLeft + count,
      gameStatus: 'PLAYING',
    }));
  },

  handleLevelWin: () => {
    const { score, levelConfig, movesLeft, grid } = get();
    useTaskStore.getState().trackLevelWon();

    // If player has moves remaining, trigger authentic Sugar Crush!
    if (movesLeft > 0) {
      set({ comboText: 'SUGAR CRUSH!', isAnimating: true });
      SoundEngine.playCombo();
      toast.sweet('Sugar Rush! Remaining moves turned into special striped candies!', 'Sugar Rush! 🍬', 3500, '🎉');

      let remaining = movesLeft;
      const currentGrid = BoardManager.cloneGrid(grid);
      let currentScore = score;

      const sugarCrushInterval = setInterval(() => {
        if (remaining > 0) {
          remaining--;
          currentScore += 1000;
          SoundEngine.playSelect();

          // Pick a random playable normal candy to turn into striped
          const candidates: { r: number; c: number }[] = [];
          for (let r = 0; r < currentGrid.length; r++) {
            for (let c = 0; c < currentGrid[0].length; c++) {
              const t = currentGrid[r][c];
              if (t.isPlayable && t.candy && t.candy.special === 'NONE' && !t.candy.isIngredient) {
                candidates.push({ r, c });
              }
            }
          }

          if (candidates.length > 0) {
            const picked = candidates[Math.floor(Math.random() * candidates.length)];
            currentGrid[picked.r][picked.c].candy!.special = Math.random() > 0.5 ? 'STRIPED_H' : 'STRIPED_V';
            visualBoard.syncFromGrid(currentGrid);
          }

          set({
            grid: [...currentGrid],
            movesLeft: remaining,
            score: currentScore,
          });
        } else {
          clearInterval(sugarCrushInterval);

          // Detonate all striped candies with lasers!
          SoundEngine.playStripe();
          currentScore += 3000;
          const finalStars = Math.max(1, ScoreCalculator.calculateStars(currentScore, levelConfig.starScores));

          useUserStore.getState().recordLevelCompletion(levelConfig.id, currentScore, finalStars);
          useUserStore.getState().addCoins(100 + finalStars * 50);
          toast.sweet(`Level ${levelConfig.id} Cleared with ${finalStars} Star${finalStars > 1 ? 's' : ''}!`, 'Level Completed! 🏆', 4000, '⭐');

          setTimeout(() => {
            SoundEngine.playWin();
            set({
              score: currentScore,
              stars: finalStars,
              gameStatus: 'WON',
              isAnimating: false,
              comboText: null,
            });
          }, 800);
        }
      }, 180);

      return;
    }

    // Otherwise normal win
    SoundEngine.playWin();
    const finalStars = Math.max(1, ScoreCalculator.calculateStars(score, levelConfig.starScores));
    useUserStore.getState().recordLevelCompletion(levelConfig.id, score, finalStars);
    useUserStore.getState().addCoins(100 + finalStars * 50);
    toast.sweet(`Level ${levelConfig.id} Cleared with ${finalStars} Star${finalStars > 1 ? 's' : ''}!`, 'Level Completed! 🏆', 4000, '⭐');

    set({
      score,
      stars: finalStars,
      gameStatus: 'WON',
    });
  },

  handleLevelFail: () => {
    SoundEngine.playFail();
    useUserStore.getState().useLife();
    toast.error('Out of moves! Complete all level objectives to win.', 'Level Failed', 3500);
    set({ gameStatus: 'LOST' });
  },
}));
