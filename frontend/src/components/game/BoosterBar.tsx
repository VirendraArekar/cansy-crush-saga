import React from 'react';
import { BoosterType } from '../../engine/types';
import { BOOSTER_CONFIGS } from '../../engine/constants';
import { useUserStore } from '../../store/userStore';

interface BoosterBarProps {
  activeBooster: BoosterType | null;
  onActivate: (type: BoosterType) => void;
  onCancel: () => void;
  onOpenShop: () => void;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  activeBooster,
  onActivate,
  onCancel,
  onOpenShop,
}) => {
  const boosters = useUserStore((s) => s.boosters);

  const boosterList: BoosterType[] = [
    'LOLLIPOP_HAMMER',
    'FREE_SWITCH',
    'COLOR_BOMB',
    'STRIPED_BRUSH',
    'SHUFFLE',
    'EXTRA_MOVES',
  ];

  return (
    <div className="w-full max-w-[480px] mx-auto px-2 py-1 flex flex-col items-center gap-1">
      {/* Active Booster Banner */}
      {activeBooster && (
        <div className="w-full flex items-center justify-between bg-amber-500/30 border-2 border-amber-400 px-3 py-1.5 rounded-xl text-xs text-amber-200 animate-pulse shadow-lg">
          <span>Tap a tile to use <strong>{BOOSTER_CONFIGS[activeBooster].name}</strong></span>
          <button
            onClick={onCancel}
            className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Boosters Row Container */}
      <div className="w-full bg-slate-900/90 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl px-2 py-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between w-full gap-1.5">
          {boosterList.map((type) => {
            const config = BOOSTER_CONFIGS[type];
            const count = boosters[type] || 0;
            const isActive = activeBooster === type;

            return (
              <button
                key={type}
                onClick={() => {
                  if (count > 0) {
                    if (isActive) onCancel();
                    else onActivate(type);
                  } else {
                    onOpenShop();
                  }
                }}
                className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition transform active:scale-90 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.8)] border-2 border-white'
                    : count > 0
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 border border-slate-700 text-white shadow'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500'
                }`}
                title={config.description}
              >
                <span className="text-xl leading-none drop-shadow">{config.icon}</span>
                <span className="text-[9px] font-bold mt-0.5 truncate max-w-full">
                  {config.name.split(' ')[0]}
                </span>

                {/* Count badge */}
                <span
                  className={`absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow ${
                    count > 0
                      ? 'bg-pink-600 text-white border border-pink-400'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {count > 0 ? count : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
