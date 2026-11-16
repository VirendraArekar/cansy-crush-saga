import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { toast } from '../../store/toastStore';

interface RewardedAdModalProps {
  isOpen: boolean;
  rewardTitle: string;
  onRewardGranted: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  rewardTitle,
  onRewardGranted,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(5);
      setRewardClaimed(false);
      return;
    }

    setSecondsLeft(5);
    setRewardClaimed(false);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = () => {
    setRewardClaimed(true);
    toast.sweet(`Sponsored reward earned: ${rewardTitle}!`, 'Reward Claimed', 3000, '🎉');
    onRewardGranted();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
        {/* AdMob Banner Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-black">
              Ad
            </span>
            <span>Google AdMob Sponsored Partner</span>
          </div>
          <span className="text-xs font-mono font-bold text-pink-400">
            {secondsLeft > 0 ? `Reward in ${secondsLeft}s` : 'Reward Ready!'}
          </span>
        </div>

        {/* Video Player Mockup */}
        <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center shadow-lg mb-2">
              <Play className="w-7 h-7 text-white fill-white ml-1 animate-pulse" />
            </div>
            <h4 className="text-lg font-black text-white drop-shadow">
              Sugar Cascade Saga
            </h4>
            <p className="text-xs text-purple-100 font-medium">
              Sweet Match-3 Adventure!
            </p>
          </div>
        </div>

        {/* Reward Description */}
        <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/40 px-4 py-2 rounded-2xl text-xs text-indigo-200">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Reward: <strong className="text-white">{rewardTitle}</strong></span>
        </div>

        {/* Claim or Waiting Button */}
        {secondsLeft > 0 ? (
          <div className="w-full py-3 bg-slate-800 text-slate-400 font-bold text-sm rounded-xl flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            Viewing Sponsored Ad ({secondsLeft}s)...
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={rewardClaimed}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-black text-base rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition active:scale-95 animate-bounce"
          >
            {rewardClaimed ? (
              <>
                <CheckCircle className="w-5 h-5" /> Reward Claimed!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" /> Claim {rewardTitle}!
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
