import React from 'react';
import { X, Coins, ShoppingBag, Video, Check } from 'lucide-react';
import { BoosterType } from '../../engine/types';
import { BOOSTER_CONFIGS } from '../../engine/constants';
import { useUserStore } from '../../store/userStore';
import { SoundEngine } from '../../engine/SoundEngine';
import { toast } from '../../store/toastStore';

interface BoosterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAdForCoins: () => void;
}

export const BoosterShopModal: React.FC<BoosterShopModalProps> = ({
  isOpen,
  onClose,
  onWatchAdForCoins,
}) => {
  const { coins, boosters, deductCoins, addBooster } = useUserStore();
  const [boughtNotice, setBoughtNotice] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (type: BoosterType, cost: number) => {
    if (deductCoins(cost)) {
      SoundEngine.playBooster();
      addBooster(type, 1);
      setBoughtNotice(type);
      toast.success(`Purchased 1x ${BOOSTER_CONFIGS[type].name}!`, 'Shop Purchase', 2500);
      setTimeout(() => setBoughtNotice(null), 1500);
    } else {
      toast.error('Not enough coins! Watch a sponsored video to earn free coins.', 'Shop', 2500);
    }
  };

  const boosterTypes: BoosterType[] = [
    'LOLLIPOP_HAMMER',
    'FREE_SWITCH',
    'COLOR_BOMB',
    'STRIPED_BRUSH',
    'EXTRA_MOVES',
    'SHUFFLE',
    'EXTRA_TIME',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-black text-white">BOOSTER SHOP</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black text-amber-300">
              <Coins className="w-4 h-4" /> {coins}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free coins reward promo */}
        <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-purple-200">Need more coins?</span>
            <span className="text-sm font-black text-amber-300">+150 Coins for FREE!</span>
          </div>
          <button
            onClick={onWatchAdForCoins}
            className="py-1.5 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Video className="w-4 h-4" /> Watch Ad
          </button>
        </div>

        {/* Booster Cards List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
          {boosterTypes.map((type) => {
            const config = BOOSTER_CONFIGS[type];
            const currentOwned = boosters[type] || 0;
            const canAfford = coins >= config.cost;
            const justBought = boughtNotice === type;

            return (
              <div
                key={type}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
                  {config.icon}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm truncate">
                      {config.name}
                    </span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full font-bold">
                      Owned: {currentOwned}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight truncate">
                    {config.description}
                  </span>
                </div>

                <button
                  onClick={() => handlePurchase(type, config.cost)}
                  disabled={!canAfford}
                  className={`py-2 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 ${
                    justBought
                      ? 'bg-emerald-600 text-white'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {justBought ? (
                    <>
                      <Check className="w-4 h-4" /> Added!
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5" /> {config.cost}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
