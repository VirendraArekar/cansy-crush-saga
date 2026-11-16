import { create } from 'zustand';
import { SoundEngine } from '../engine/SoundEngine';

interface SoundState {
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  toggleSfx: () => void;
  toggleMusic: () => void;
  setSfxVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  sfxMuted: false,
  musicMuted: false,
  sfxVolume: 0.8,
  musicVolume: 0.5,

  toggleSfx: () => {
    const next = !get().sfxMuted;
    SoundEngine.setSfxMuted(next);
    set({ sfxMuted: next });
  },

  toggleMusic: () => {
    const next = !get().musicMuted;
    SoundEngine.setMusicMuted(next);
    set({ musicMuted: next });
  },

  setSfxVolume: (vol) => {
    SoundEngine.setSfxVolume(vol);
    set({ sfxVolume: vol });
  },

  setMusicVolume: (vol) => {
    SoundEngine.setMusicVolume(vol);
    set({ musicVolume: vol });
  },
}));
