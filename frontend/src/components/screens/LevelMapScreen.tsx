import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Star, Lock, Trophy, Heart, Coins } from 'lucide-react';
import { LEVEL_CATALOG } from '../../levels/levelCatalog';
import { useUserStore } from '../../store/userStore';
import { SoundEngine } from '../../engine/SoundEngine';

interface LevelMapScreenProps {
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({
  onSelectLevel,
  onBack,
}) => {
  const { unlockedLevel, levelStars, lives, coins } = useUserStore();
  const currentLevelRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the current level node on map open
  useEffect(() => {
    if (currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-y-auto bg-gradient-to-b from-sky-600 via-pink-500 to-indigo-950 flex flex-col select-none">
      {/* Whimsical Candy Kingdom Saga Road Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-white/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full bg-pink-400/25 blur-3xl" />
        <div className="absolute bottom-16 right-1/4 w-72 h-72 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.04)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.04)_75%)] bg-[length:48px_48px] pointer-events-none" />
      </div>
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 w-full max-w-lg mx-auto bg-slate-900/90 backdrop-blur-md border-b border-indigo-500/30 px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 font-black text-white text-base">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>SAGA MAP</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold text-rose-300">
            <Heart className="w-3.5 h-3.5 fill-rose-400" /> {lives}
          </div>
          <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300">
            <Coins className="w-3.5 h-3.5" /> {coins}
          </div>
        </div>
      </div>

      {/* Map Nodes (Winding S-curve Path) */}
      <div className="relative w-full max-w-md mx-auto py-8 px-4 flex flex-col gap-8">
        {LEVEL_CATALOG.map((level, idx) => {
          const isUnlocked = level.id <= unlockedLevel;
          const isCurrent = level.id === unlockedLevel;
          const stars = levelStars[level.id] || 0;

          // S-curve lateral offset: -40px to +40px oscillation
          const offset = Math.sin(idx * 0.7) * 75;

          const isNewEpisode = idx % 10 === 0;

          return (
            <React.Fragment key={level.id}>
              {/* Episode Header Landmark */}
              {isNewEpisode && (
                <div className="w-full flex items-center justify-center my-3">
                  <div className="bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border border-white/20">
                    {level.episode} (Levels {idx + 1} - {Math.min(100, idx + 10)})
                  </div>
                </div>
              )}

              {/* Node Item */}
              <div
                ref={isCurrent ? currentLevelRef : undefined}
                className="flex flex-col items-center justify-center"
                style={{ transform: `translateX(${offset}px)` }}
              >
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    SoundEngine.playSelect();
                    onSelectLevel(level.id);
                  }}
                  className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-4 ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-amber-400 to-pink-500 border-white scale-110 shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-pulse'
                      : isUnlocked
                      ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 border-indigo-300 hover:scale-105 active:scale-95'
                      : 'bg-slate-800/80 border-slate-700 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <span className="text-xl font-black text-white drop-shadow">
                      {level.id}
                    </span>
                  ) : (
                    <Lock className="w-6 h-6 text-slate-500" />
                  )}
                </button>

                {/* Stars underneath unlocked node */}
                {isUnlocked && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
