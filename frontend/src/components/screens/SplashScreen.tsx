import React from 'react';
import { Play, MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useSoundStore } from '../../store/soundStore';
import { SoundEngine } from '../../engine/SoundEngine';

interface SplashScreenProps {
  onStart: () => void;
  onOpenMap: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onOpenMap }) => {
  const { sfxMuted, toggleSfx } = useSoundStore();

  const handlePlayClick = () => {
    SoundEngine.playSelect();
    onStart();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-sky-600 via-pink-500 to-indigo-950 flex flex-col items-center justify-between p-6 select-none">
      {/* Decorative Floating Confections in background */}
      <div className="absolute top-10 left-8 text-5xl opacity-40 animate-bounce">🍭</div>
      <div className="absolute top-28 right-10 text-6xl opacity-30 animate-pulse">🍬</div>
      <div className="absolute bottom-32 left-12 text-5xl opacity-30 animate-bounce">🍩</div>
      <div className="absolute bottom-20 right-14 text-6xl opacity-40 animate-pulse">🧁</div>

      {/* Top audio toggle */}
      <div className="w-full max-w-md flex justify-end z-10">
        <button
          onClick={toggleSfx}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow hover:bg-slate-800 transition"
        >
          {!sfxMuted ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </button>
      </div>

      {/* Main Branding Logo & Title */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        {/* Animated Brand Emblem */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse border-4 border-white/30">
            <span className="text-6xl filter drop-shadow">🍭</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow">
            Match-3
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-400 drop-shadow-[0_4px_16px_rgba(244,63,94,0.5)] tracking-tight">
          SUGAR CASCADE
        </h1>
        <p className="text-sm md:text-base font-bold text-purple-200 mt-1 flex items-center gap-1.5 tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-300" /> Sweet Puzzle Adventure
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3.5 z-10 mb-4">
        <button
          onClick={handlePlayClick}
          className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-white font-black text-xl rounded-2xl shadow-xl shadow-pink-500/40 flex items-center justify-center gap-3 transition transform active:scale-95"
        >
          <Play className="w-6 h-6 fill-white" /> PLAY NOW
        </button>

        <button
          onClick={onOpenMap}
          className="w-full py-3.5 px-6 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-extrabold text-base rounded-2xl border-2 border-indigo-500/40 shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          <MapPin className="w-5 h-5 text-indigo-400" /> LEVEL MAP (100 Levels)
        </button>

        <div className="text-center text-[11px] text-slate-500 font-medium">
          Production Full-Stack Match-3 Puzzle Game
        </div>
      </div>
    </div>
  );
};
