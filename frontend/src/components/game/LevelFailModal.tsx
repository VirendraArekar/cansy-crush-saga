import React from 'react';
import { RotateCcw, Home, PlusCircle, Video, Coins } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface LevelFailModalProps {
  isOpen: boolean;
  score: number;
  onBuyMoves: () => void;
  onWatchAdForMoves: () => void;
  onRetry: () => void;
  onGiveUp: () => void;
}

export const LevelFailModal: React.FC<LevelFailModalProps> = ({
  isOpen,
  score,
  onBuyMoves,
  onWatchAdForMoves,
  onRetry,
  onGiveUp,
}) => {
  const { coins, lives } = useUserStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-rose-600/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        {/* Banner */}
        <div className="bg-rose-600 text-white font-black px-6 py-1.5 rounded-full text-sm uppercase tracking-widest shadow-md">
          Out of Moves!
        </div>

        <h2 className="text-3xl font-black text-rose-400 drop-shadow-md">
          LEVEL FAILED
        </h2>
        <p className="text-xs text-slate-400">
          You almost had it! Score achieved: <strong className="text-white">{score.toLocaleString()}</strong>
        </p>

        {/* Continue Options (+5 Extra Moves) */}
        <div className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Keep Playing with +5 Extra Moves
          </span>

          {/* Option A: Buy with coins */}
          <button
            onClick={onBuyMoves}
            disabled={coins < 120}
            className={`w-full py-2.5 px-4 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition ${
              coins >= 120
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md hover:from-amber-400 active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> +5 Moves (120 Coins)
            <span className="text-xs font-semibold ml-auto flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {coins}
            </span>
          </button>

          {/* Option B: Watch rewarded video ad */}
          <button
            onClick={onWatchAdForMoves}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <Video className="w-4 h-4 text-pink-300" /> Watch Ad for +5 Moves (Free)
          </button>
        </div>

        {/* Retry or Quit */}
        <div className="flex gap-2 w-full mt-1">
          <button
            onClick={onRetry}
            disabled={lives <= 0}
            className={`flex-1 py-3 font-bold rounded-xl border flex items-center justify-center gap-1.5 text-sm transition ${
              lives > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> Retry ({lives} ❤️)
          </button>

          <button
            onClick={onGiveUp}
            className="flex-1 py-3 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold rounded-xl border border-rose-800/50 flex items-center justify-center gap-1.5 text-sm transition"
          >
            <Home className="w-4 h-4" /> Give Up
          </button>
        </div>
      </div>
    </div>
  );
};
