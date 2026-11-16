import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, Home, RotateCcw, Trophy, Coins } from 'lucide-react';
import { LevelConfig } from '../../engine/types';

interface LevelWinModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  levelConfig: LevelConfig;
  onNext: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const LevelWinModal: React.FC<LevelWinModalProps> = ({
  isOpen,
  score,
  stars,
  levelConfig,
  onNext,
  onRestart,
  onHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti bursts!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF2A6D', '#05D9E8', '#00E676', '#FFEA00', '#9B5DE5'],
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const earnedCoins = 100 + stars * 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-sm bg-gradient-to-b from-indigo-900 to-slate-950 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        {/* Banner */}
        <div className="bg-amber-400 text-slate-950 font-black px-6 py-1.5 rounded-full text-sm uppercase tracking-widest shadow-md">
          Level {levelConfig.id} Complete!
        </div>

        <h2 className="text-3xl font-black text-white drop-shadow-lg tracking-wide">
          SUGAR RUSH!
        </h2>

        {/* 3 Animated Stars */}
        <div className="flex items-center gap-3 my-2">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transform transition-all duration-500 ${
                starIdx <= stars
                  ? 'scale-125 text-amber-300 fill-amber-300 animate-bounce'
                  : 'text-slate-600 scale-90'
              }`}
            >
              <Star className="w-12 h-12 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </div>
          ))}
        </div>

        {/* Score & Rewards Card */}
        <div className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" /> Final Score:
            </span>
            <strong className="text-xl font-black text-amber-300">
              {score.toLocaleString()}
            </strong>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" /> Reward:
            </span>
            <strong className="text-lg font-black text-emerald-400">
              +{earnedCoins} Coins
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={onNext}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-black text-lg rounded-2xl shadow-lg shadow-pink-500/40 flex items-center justify-center gap-2 transition active:scale-95"
          >
            Next Level <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 text-sm transition"
            >
              <RotateCcw className="w-4 h-4" /> Replay
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 text-sm transition"
            >
              <Home className="w-4 h-4" /> Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
