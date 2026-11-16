import React, { useState } from 'react';
import { X, Play, Star, Heart, Move, Clock, Check, Sparkles } from 'lucide-react';
import { LevelConfig } from '../../engine/types';
import { useUserStore } from '../../store/userStore';
import { SoundEngine } from '../../engine/SoundEngine';
import { toast } from '../../store/toastStore';

export interface PreGameBoosters {
  colorBomb: boolean;
  stripedWrapped: boolean;
  extraMoves: boolean;
}

interface LevelGoalModalProps {
  isOpen: boolean;
  levelConfig: LevelConfig;
  onPlay: (boosters: PreGameBoosters) => void;
  onClose: () => void;
  onOpenLivesShop?: () => void;
}

export const LevelGoalModal: React.FC<LevelGoalModalProps> = ({
  isOpen,
  levelConfig,
  onPlay,
  onClose,
  onOpenLivesShop,
}) => {
  const { lives, levelStars, highScores, boosters } = useUserStore();

  const [selectedBoosters, setSelectedBoosters] = useState<PreGameBoosters>({
    colorBomb: false,
    stripedWrapped: false,
    extraMoves: false,
  });

  if (!isOpen) return null;

  const earnedStars = levelStars[levelConfig.id] || 0;
  const highScore = highScores[levelConfig.id] || 0;
  const hasLives = lives > 0;

  const difficultyColors = {
    EASY: 'from-emerald-500 to-green-600 border-green-400',
    MEDIUM: 'from-blue-500 to-indigo-600 border-blue-400',
    HARD: 'from-purple-500 to-pink-600 border-pink-400',
    EXPERT: 'from-rose-600 to-red-700 border-red-400',
  }[levelConfig.difficulty || 'EASY'];

  const toggleBooster = (key: keyof PreGameBoosters) => {
    SoundEngine.playSelect();
    const willEnable = !selectedBoosters[key];
    setSelectedBoosters(prev => ({
      ...prev,
      [key]: willEnable,
    }));

    if (willEnable) {
      if (key === 'colorBomb') {
        toast.sweet('Color Bomb booster equipped for this level!', 'Pre-Game Booster', 2000, '💣');
      } else if (key === 'stripedWrapped') {
        toast.sweet('Striped + Wrapped combo equipped for this level!', 'Pre-Game Booster', 2000, '🎁');
      } else if (key === 'extraMoves') {
        toast.sweet('+3 Extra Moves equipped for this level!', 'Pre-Game Booster', 2000, '➕');
      }
    } else {
      toast.info('Booster unequipped.', undefined, 1500);
    }
  };

  const handleStart = () => {
    SoundEngine.playSwap();
    onPlay(selectedBoosters);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-950 via-slate-900 to-purple-950 border-4 border-amber-500/70 rounded-3xl p-5 shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex flex-col items-center gap-3.5 text-center select-none">
        
        {/* Header with Difficulty Pill */}
        <div className="w-full flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">
              {levelConfig.episode}
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-white drop-shadow">Level {levelConfig.id}</h3>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${difficultyColors} border shadow`}>
                {levelConfig.difficulty || 'EASY'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Stars Record */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((star) => (
            <div key={star} className="relative">
              <Star
                className={`w-9 h-9 transition-transform duration-300 ${
                  star <= earnedStars
                    ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                    : 'text-slate-700/80 stroke-slate-600'
                }`}
              />
            </div>
          ))}
        </div>
        {highScore > 0 && (
          <span className="text-xs text-amber-200/90 font-semibold -mt-2">
            Best: <strong className="text-amber-300 font-black">{highScore.toLocaleString()}</strong> pts
          </span>
        )}

        {/* Objectives Box */}
        <div className="w-full bg-slate-900/80 border-2 border-amber-500/30 rounded-2xl p-3.5 flex flex-col gap-2 shadow-inner">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Objectives
          </span>

          <div className="flex flex-col gap-1.5 text-xs text-left">
            {levelConfig.objectives.map((obj, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 font-medium">
                {obj.type === 'SCORE' && (
                  <>
                    <span className="text-lg">⭐</span>
                    <span>Reach target: <strong className="text-amber-300 font-bold">{obj.targetScore?.toLocaleString()}</strong></span>
                  </>
                )}
                {obj.type === 'JELLY' && (
                  <>
                    <span className="text-lg">🍮</span>
                    <span>Clear all <strong className="text-pink-400 font-bold">{obj.totalJellies}</strong> Jellies!</span>
                  </>
                )}
                {obj.type === 'BLOCKERS' && (
                  <>
                    <span className="text-lg">🍪</span>
                    <span>Break all <strong className="text-amber-400 font-bold">{obj.totalBlockers}</strong> Frosting & Chocolate!</span>
                  </>
                )}
                {obj.type === 'INGREDIENTS' && (
                  <>
                    <span className="text-lg">🍒</span>
                    <span>Drop down all Cherries & Hazelnuts to the bottom!</span>
                  </>
                )}
                {obj.type === 'COLLECT_COLOR' && obj.targetColors && (
                  <>
                    <span className="text-lg">🍬</span>
                    <span>
                      Collect:{' '}
                      {Object.entries(obj.targetColors).map(([c, cnt]) => `${cnt} ${c}`).join(', ')}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-around border-t border-slate-700/60 pt-2 text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1 text-pink-300">
              <Move className="w-3.5 h-3.5" /> {levelConfig.moveLimit} Moves
            </span>
            {levelConfig.timeLimitSeconds && (
              <span className="flex items-center gap-1 text-amber-300">
                <Clock className="w-3.5 h-3.5" /> {levelConfig.timeLimitSeconds}s Limit
              </span>
            )}
          </div>
        </div>

        {/* Pre-Game Boosters Tray (Like Actual Game!) */}
        <div className="w-full flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left px-1">
            Pre-Game Boosters
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Color Bomb Pre-booster */}
            <button
              type="button"
              onClick={() => toggleBooster('colorBomb')}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition ${
                selectedBoosters.colorBomb
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl drop-shadow">💣</span>
              <span className="text-[10px] font-bold text-white leading-tight">Color Bomb</span>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                selectedBoosters.colorBomb ? 'bg-amber-400 text-slate-950 font-black' : 'border border-slate-600'
              }`}>
                {selectedBoosters.colorBomb && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Striped & Wrapped Combo */}
            <button
              type="button"
              onClick={() => toggleBooster('stripedWrapped')}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition ${
                selectedBoosters.stripedWrapped
                  ? 'bg-pink-500/20 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.6)]'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl drop-shadow">🎁</span>
              <span className="text-[10px] font-bold text-white leading-tight">Striped+Wrap</span>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                selectedBoosters.stripedWrapped ? 'bg-pink-400 text-slate-950 font-black' : 'border border-slate-600'
              }`}>
                {selectedBoosters.stripedWrapped && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* +3 Extra Moves */}
            <button
              type="button"
              onClick={() => toggleBooster('extraMoves')}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition ${
                selectedBoosters.extraMoves
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl drop-shadow">➕</span>
              <span className="text-[10px] font-bold text-white leading-tight">+3 Moves</span>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                selectedBoosters.extraMoves ? 'bg-emerald-400 text-slate-950 font-black' : 'border border-slate-600'
              }`}>
                {selectedBoosters.extraMoves && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Play Button */}
        {hasLives ? (
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 text-white font-black text-lg rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.5)] border-2 border-white/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" /> PLAY (1 <Heart className="w-4 h-4 fill-rose-300 text-rose-300 inline" />)
          </button>
        ) : (
          <button
            onClick={() => {
              toast.warning('You have 0 lives! Watch an ad or wait for regeneration.', 'No Lives Remaining', 3000);
              onOpenLivesShop?.();
            }}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            No Lives Left! Get More Lives
          </button>
        )}
      </div>
    </div>
  );
};
