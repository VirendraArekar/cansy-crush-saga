import React from 'react';
import { Star, Pause, Clock, Check } from 'lucide-react';
import { LevelConfig, ObjectiveProgress, CandyColor } from '../../engine/types';

interface GameHUDProps {
  levelConfig: LevelConfig;
  score: number;
  movesLeft: number;
  timeLeft: number | null;
  stars: number;
  progress: ObjectiveProgress;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelConfig,
  score,
  movesLeft,
  timeLeft,
  stars,
  progress,
  onPause,
}) => {
  const [star1, star2, star3] = levelConfig.starScores;
  const maxScore = star3 * 1.15;
  const progressPercent = Math.min(100, (score / maxScore) * 100);

  // Check objective completions
  const isJellyDone = progress.totalJellies > 0 && progress.jelliesCleared >= progress.totalJellies;
  const isBlockersDone = progress.totalBlockers > 0 && progress.blockersCleared >= progress.totalBlockers;
  const totalIngNeeded = progress.totalCherries + progress.totalNuts;
  const totalIngGot = progress.cherriesCollected + progress.nutsCollected;
  const isIngDone = totalIngNeeded > 0 && totalIngGot >= totalIngNeeded;

  return (
    <div className="w-full max-w-[480px] mx-auto px-3 py-1 flex flex-col gap-1.5 select-none">
      {/* Top Row: Episode Name, Chunky Candy Moves Medallion, and Pause */}
      <div className="flex items-center justify-between">
        {/* Episode & Level Badge */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase drop-shadow">
            {levelConfig.episode}
          </span>
          <h2 className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
            Level {levelConfig.id}
          </h2>
        </div>

        {/* Candy Crush Style Chunky Moves / Timer Medallion */}
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-pink-600 p-0.5 shadow-[0_4px_15px_rgba(244,63,94,0.6)] border-2 border-amber-300 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950/80 flex flex-col items-center justify-center">
              {timeLeft !== null ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="text-base font-black text-white leading-none drop-shadow">
                    {timeLeft}s
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[8px] font-black tracking-widest text-pink-300 uppercase leading-none">
                    MOVES
                  </span>
                  <span className="text-xl font-black text-white leading-none drop-shadow">
                    {movesLeft}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="w-9 h-9 rounded-full bg-slate-800/90 border-2 border-amber-400/40 flex items-center justify-center text-amber-200 hover:bg-slate-700 transition active:scale-95 shadow-md"
        >
          <Pause className="w-4 h-4 fill-amber-200" />
        </button>
      </div>

      {/* 3-Star Candy Score Bar */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between text-[11px] text-amber-200/90 font-bold px-1">
          <span>Score: <strong className="text-white text-xs font-black">{score.toLocaleString()}</strong></span>
          <span>Target: <strong className="text-amber-300 text-xs font-black">{star1.toLocaleString()}</strong></span>
        </div>

        <div className="relative w-full bg-amber-950/60 rounded-full h-4 p-0.5 border-2 border-amber-500/50 shadow-inner">
          {/* Glowing Syrup Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Star Milestones */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-300 ${
              stars >= 1
                ? 'scale-125 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,1)]'
                : 'text-slate-600'
            }`}
            style={{ left: `${(star1 / maxScore) * 100}%` }}
          >
            <Star className="w-4 h-4" />
          </div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-300 ${
              stars >= 2
                ? 'scale-125 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,1)]'
                : 'text-slate-600'
            }`}
            style={{ left: `${(star2 / maxScore) * 100}%` }}
          >
            <Star className="w-4 h-4" />
          </div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-300 ${
              stars >= 3
                ? 'scale-125 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,1)]'
                : 'text-slate-600'
            }`}
            style={{ left: `${(star3 / maxScore) * 100}%` }}
          >
            <Star className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Candy Crush Authentic Target Objectives Badges */}
      <div className="flex flex-wrap items-center gap-1.5 justify-center py-0.5">
        {progress.totalJellies > 0 && (
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
              isJellyDone
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                : 'bg-pink-950/70 border-pink-500/50 text-pink-200'
            }`}
          >
            <span>🍮 Jellies:</span>
            {isJellyDone ? (
              <span className="flex items-center text-emerald-400"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
            ) : (
              <strong className="text-white">
                {Math.max(0, progress.totalJellies - progress.jelliesCleared)} left
              </strong>
            )}
          </div>
        )}

        {progress.totalBlockers > 0 && (
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
              isBlockersDone
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-200'
            }`}
          >
            <span>🍪 Blockers:</span>
            {isBlockersDone ? (
              <span className="flex items-center text-emerald-400"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
            ) : (
              <strong className="text-white">
                {Math.max(0, progress.totalBlockers - progress.blockersCleared)} left
              </strong>
            )}
          </div>
        )}

        {totalIngNeeded > 0 && (
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
              isIngDone
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
            }`}
          >
            <span>🍒 Ingredients:</span>
            {isIngDone ? (
              <span className="flex items-center text-emerald-400"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
            ) : (
              <strong className="text-white">
                {Math.max(0, totalIngNeeded - totalIngGot)} left
              </strong>
            )}
          </div>
        )}

        {Object.entries(progress.targetColors).map(([col, target]) => {
          const current = progress.colorsCollected[col as CandyColor] || 0;
          const isColorDone = current >= target;
          return (
            <div
              key={col}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
                isColorDone
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                  : 'bg-indigo-950/70 border-indigo-500/50 text-indigo-200'
              }`}
            >
              <span>🍬 {col}:</span>
              {isColorDone ? (
                <span className="flex items-center text-emerald-400"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              ) : (
                <strong className="text-white">
                  {Math.max(0, target - current)} left
                </strong>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
