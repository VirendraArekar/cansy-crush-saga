import { create } from 'zustand';
import { BoosterType } from '../engine/types';
import { useUserStore } from './userStore';
import { SoundEngine } from '../engine/SoundEngine';
import { toast } from './toastStore';

export interface SweetTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  rewardType: 'COINS' | 'LIVES' | BoosterType;
  rewardAmount: number;
  rewardLabel: string;
  claimed: boolean;
}

interface TaskState {
  tasks: SweetTask[];
  isTasksModalOpen: boolean;
  openTasksModal: () => void;
  closeTasksModal: () => void;
  trackCandyMatch: (color: string, count: number) => void;
  trackSpecialCreated: (type: string) => void;
  trackJellyCleared: (count: number) => void;
  trackLevelWon: () => void;
  claimTask: (taskId: string) => void;
}

const STORAGE_KEY = 'sugar_cascade_tasks';

const INITIAL_TASKS: SweetTask[] = [
  {
    id: 'task_red_candies',
    title: 'Strawberry Craze',
    description: 'Match 40 Strawberry Heart candies',
    icon: '🍓',
    target: 40,
    current: 0,
    rewardType: 'COINS',
    rewardAmount: 150,
    rewardLabel: '150 Coins',
    claimed: false,
  },
  {
    id: 'task_striped_specials',
    title: 'Laser Striper',
    description: 'Create 4 Striped Candies',
    icon: '⚡',
    target: 4,
    current: 0,
    rewardType: 'LOLLIPOP_HAMMER',
    rewardAmount: 1,
    rewardLabel: '1 Lollipop Hammer',
    claimed: false,
  },
  {
    id: 'task_clear_jellies',
    title: 'Jelly Shaker',
    description: 'Clear 15 Jelly tiles',
    icon: '🍮',
    target: 15,
    current: 0,
    rewardType: 'FREE_SWITCH',
    rewardAmount: 1,
    rewardLabel: '1 Free Switch',
    claimed: false,
  },
  {
    id: 'task_color_bombs',
    title: 'Rainbow Blast',
    description: 'Create or use 2 Color Bombs',
    icon: '🌈',
    target: 2,
    current: 0,
    rewardType: 'COLOR_BOMB',
    rewardAmount: 1,
    rewardLabel: '1 Color Bomb',
    claimed: false,
  },
  {
    id: 'task_win_levels',
    title: 'Level Master',
    description: 'Complete 2 game levels with 2+ stars',
    icon: '🏆',
    target: 2,
    current: 0,
    rewardType: 'COINS',
    rewardAmount: 300,
    rewardLabel: '300 Coins + 1 Life',
    claimed: false,
  },
];

function loadSavedTasks(): SweetTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return INITIAL_TASKS;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadSavedTasks(),
  isTasksModalOpen: false,

  openTasksModal: () => set({ isTasksModalOpen: true }),
  closeTasksModal: () => set({ isTasksModalOpen: false }),

  trackCandyMatch: (color, count) => {
    set((state) => {
      const nextTasks = state.tasks.map((t) => {
        if (t.id === 'task_red_candies' && color === 'RED' && !t.claimed) {
          return { ...t, current: Math.min(t.target, t.current + count) };
        }
        return t;
      });
      return { tasks: nextTasks };
    });
  },

  trackSpecialCreated: (type) => {
    set((state) => {
      const nextTasks = state.tasks.map((t) => {
        if (t.id === 'task_striped_specials' && type.startsWith('STRIPED') && !t.claimed) {
          return { ...t, current: Math.min(t.target, t.current + 1) };
        }
        if (t.id === 'task_color_bombs' && type === 'COLOR_BOMB' && !t.claimed) {
          return { ...t, current: Math.min(t.target, t.current + 1) };
        }
        return t;
      });
      return { tasks: nextTasks };
    });
  },

  trackJellyCleared: (count) => {
    set((state) => {
      const nextTasks = state.tasks.map((t) => {
        if (t.id === 'task_clear_jellies' && !t.claimed) {
          return { ...t, current: Math.min(t.target, t.current + count) };
        }
        return t;
      });
      return { tasks: nextTasks };
    });
  },

  trackLevelWon: () => {
    set((state) => {
      const nextTasks = state.tasks.map((t) => {
        if (t.id === 'task_win_levels' && !t.claimed) {
          return { ...t, current: Math.min(t.target, t.current + 1) };
        }
        return t;
      });
      return { tasks: nextTasks };
    });
  },

  claimTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.claimed || task.current < task.target) return;

    SoundEngine.playBooster();

    // Payout reward
    const userStore = useUserStore.getState();
    if (task.rewardType === 'COINS') {
      userStore.addCoins(task.rewardAmount);
    } else if (task.rewardType === 'LIVES') {
      userStore.addLives(task.rewardAmount);
    } else {
      userStore.addBooster(task.rewardType, task.rewardAmount);
    }

    if (task.id === 'task_win_levels') {
      userStore.addLives(1);
    }

    toast.sweet(`Claimed "${task.title}": ${task.rewardLabel}!`, 'Sweet Task Completed', 3200, '⭐');

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)),
    }));
  },
}));

useTaskStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (e) {
    // ignore
  }
});
