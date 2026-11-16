import { create } from 'zustand';
import { BoosterType, UserInventory } from '../engine/types';
import { LIFE_REGENERATION_TIME_MS, MAX_LIVES } from '../engine/constants';

interface UserState extends UserInventory {
  userId: string;
  username: string;
  avatar: string;
  isGuest: boolean;
  token: string | null;

  // Actions
  setAuth: (user: { id: string; username: string; avatar?: string }, token: string) => void;
  logout: () => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  useLife: () => boolean;
  addLives: (count: number) => void;
  checkLifeRegen: () => void;
  addBooster: (type: BoosterType, count: number) => void;
  consumeBooster: (type: BoosterType) => boolean;
  recordLevelCompletion: (levelId: number, score: number, stars: number) => void;
}

const STORAGE_KEY = 'sugar_cascade_user_data';

function loadPersistedState(): Partial<UserState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return {};
}

const initialSaved = loadPersistedState();

export const useUserStore = create<UserState>((set, get) => ({
  userId: initialSaved.userId || `guest_${Math.random().toString(36).substring(2, 9)}`,
  username: initialSaved.username || 'SweetAdventurer',
  avatar: initialSaved.avatar || '🍭',
  isGuest: initialSaved.isGuest ?? true,
  token: initialSaved.token || null,

  coins: initialSaved.coins ?? 650,
  lives: initialSaved.lives ?? 5,
  maxLives: MAX_LIVES,
  lastLifeRegenTime: initialSaved.lastLifeRegenTime ?? Date.now(),
  unlockedLevel: initialSaved.unlockedLevel ?? 1,
  levelStars: initialSaved.levelStars ?? {},
  highScores: initialSaved.highScores ?? {},
  boosters: initialSaved.boosters ?? {
    EXTRA_MOVES: 3,
    LOLLIPOP_HAMMER: 3,
    FREE_SWITCH: 2,
    COLOR_BOMB: 2,
    STRIPED_BRUSH: 3,
    SHUFFLE: 3,
    EXTRA_TIME: 2,
  },

  setAuth: (user, token) => {
    set({
      userId: user.id,
      username: user.username,
      avatar: user.avatar || '🍭',
      isGuest: false,
      token,
    });
  },

  logout: () => {
    set({
      userId: `guest_${Math.random().toString(36).substring(2, 9)}`,
      username: 'SweetAdventurer',
      isGuest: true,
      token: null,
    });
  },

  addCoins: (amount) => {
    set((state) => {
      const nextCoins = state.coins + amount;
      return { coins: nextCoins };
    });
  },

  deductCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set({ coins: coins - amount });
    return true;
  },

  useLife: () => {
    get().checkLifeRegen();
    const { lives } = get();
    if (lives <= 0) return false;
    set({
      lives: lives - 1,
      lastLifeRegenTime: lives === MAX_LIVES ? Date.now() : get().lastLifeRegenTime,
    });
    return true;
  },

  addLives: (count) => {
    set((state) => ({
      lives: Math.min(state.maxLives, state.lives + count),
    }));
  },

  checkLifeRegen: () => {
    const { lives, maxLives, lastLifeRegenTime } = get();
    if (lives >= maxLives) return;

    const now = Date.now();
    const elapsed = now - lastLifeRegenTime;
    const livesToAdd = Math.floor(elapsed / LIFE_REGENERATION_TIME_MS);

    if (livesToAdd > 0) {
      const nextLives = Math.min(maxLives, lives + livesToAdd);
      const leftoverTime = elapsed % LIFE_REGENERATION_TIME_MS;
      set({
        lives: nextLives,
        lastLifeRegenTime: nextLives >= maxLives ? now : now - leftoverTime,
      });
    }
  },

  addBooster: (type, count) => {
    set((state) => ({
      boosters: {
        ...state.boosters,
        [type]: (state.boosters[type] || 0) + count,
      },
    }));
  },

  consumeBooster: (type) => {
    const { boosters } = get();
    const current = boosters[type] || 0;
    if (current <= 0) return false;

    set({
      boosters: {
        ...boosters,
        [type]: current - 1,
      },
    });
    return true;
  },

  recordLevelCompletion: (levelId, score, stars) => {
    set((state) => {
      const currentStars = state.levelStars[levelId] || 0;
      const currentHigh = state.highScores[levelId] || 0;

      const nextStars = { ...state.levelStars, [levelId]: Math.max(currentStars, stars) };
      const nextHigh = { ...state.highScores, [levelId]: Math.max(currentHigh, score) };
      const nextUnlocked = Math.max(state.unlockedLevel, levelId + 1);

      return {
        levelStars: nextStars,
        highScores: nextHigh,
        unlockedLevel: nextUnlocked,
      };
    });
  },
}));

// Automatically persist user changes to localStorage
useUserStore.subscribe((state) => {
  try {
    const toSave = {
      userId: state.userId,
      username: state.username,
      avatar: state.avatar,
      isGuest: state.isGuest,
      token: state.token,
      coins: state.coins,
      lives: state.lives,
      lastLifeRegenTime: state.lastLifeRegenTime,
      unlockedLevel: state.unlockedLevel,
      levelStars: state.levelStars,
      highScores: state.highScores,
      boosters: state.boosters,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // ignore
  }
});
