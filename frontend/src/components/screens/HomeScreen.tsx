import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Coins, 
  Play, 
  MapPin, 
  ShoppingBag, 
  Trophy, 
  User, 
  Settings, 
  Gift, 
  Sparkles,
  Clock,
  Target 
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useTaskStore } from '../../store/taskStore';
import { LIFE_REGENERATION_TIME_MS, MAX_LIVES } from '../../engine/constants';
import { SoundEngine } from '../../engine/SoundEngine';
import { toast } from '../../store/toastStore';

interface HomeScreenProps {
  onPlayNextLevel: () => void;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onOpenTasks: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onWatchAdForLives: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlayNextLevel,
  onOpenMap,
  onOpenShop,
  onOpenTasks,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenSettings,
  onWatchAdForLives,
}) => {
  const { tasks } = useTaskStore();
  const claimableCount = tasks.filter(t => !t.claimed && t.current >= t.target).length;
  const { 
    coins, 
    lives, 
    maxLives, 
    lastLifeRegenTime, 
    unlockedLevel, 
    avatar, 
    username, 
    addCoins, 
    addLives,
    checkLifeRegen 
  } = useUserStore();

  const [timeUntilNextLife, setTimeUntilNextLife] = useState<string>('');
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);

  // Periodic life regen updater
  useEffect(() => {
    checkLifeRegen();

    const interval = setInterval(() => {
      checkLifeRegen();
      if (lives < maxLives) {
        const now = Date.now();
        const diff = Math.max(0, LIFE_REGENERATION_TIME_MS - (now - lastLifeRegenTime));
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeUntilNextLife(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      } else {
        setTimeUntilNextLife('FULL');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lives, maxLives, lastLifeRegenTime, checkLifeRegen]);

  const handleClaimDailyReward = () => {
    if (dailyClaimed) return;
    SoundEngine.playBooster();
    addCoins(250);
    addLives(2);
    setDailyClaimed(true);
    toast.sweet('Daily Gift Claimed: +250 Coins and +2 Lives! 🍬', 'Daily Sweet Gift', 3500, '🎁');
  };

  return (
    <div className="relative w-full h-screen overflow-y-auto bg-gradient-to-b from-sky-600 via-pink-500 to-indigo-950 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Whimsical Candy Kingdom Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-white/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute bottom-16 left-1/4 w-80 h-80 rounded-full bg-pink-400/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.04)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.04)_75%)] bg-[length:48px_48px] pointer-events-none" />
      </div>
      {/* Top Header Bar: User, Lives, Coins, Settings */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-2 z-10">
        {/* User Avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 hover:border-pink-500/50 p-1.5 pr-3 rounded-full shadow transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-sm shadow">
            {avatar}
          </div>
          <span className="text-xs font-black text-white truncate max-w-[80px]">
            {username}
          </span>
        </button>

        {/* Lives Counter & Regen Timer */}
        <button
          onClick={onWatchAdForLives}
          className="flex items-center gap-1.5 bg-rose-950/70 border border-rose-500/50 hover:bg-rose-900/70 px-3 py-1 rounded-full shadow transition active:scale-95"
          title="Click to get free lives"
        >
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
          <span className="text-xs font-black text-white">{lives}/{maxLives}</span>
          {lives < maxLives && (
            <span className="text-[10px] text-rose-300 font-mono flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {timeUntilNextLife}
            </span>
          )}
        </button>

        {/* Coins Badge */}
        <button
          onClick={onOpenShop}
          className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/50 hover:bg-amber-900/70 px-3 py-1 rounded-full shadow transition active:scale-95"
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-amber-300">{coins}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Main Center Area: Level Progress & Play Button */}
      <div className="w-full max-w-sm mx-auto my-auto flex flex-col items-center text-center gap-5 z-10 py-4">
        {/* Daily Bonus Reward Banner */}
        <div className="w-full bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-indigo-900/80 border-2 border-pink-400/40 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400 flex items-center justify-center text-2xl">
              🎁
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Daily Sweet Gift</h4>
              <p className="text-xs text-pink-200">250 Coins + 2 Lives!</p>
            </div>
          </div>
          <button
            onClick={handleClaimDailyReward}
            disabled={dailyClaimed}
            className={`py-2 px-3.5 rounded-xl font-black text-xs transition ${
              !dailyClaimed
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md animate-bounce'
                : 'bg-slate-800 text-slate-500 cursor-default'
            }`}
          >
            {!dailyClaimed ? 'Claim!' : 'Claimed'}
          </button>
        </div>

        {/* Current Level Card */}
        <div className="relative w-full bg-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-3xl shadow-lg border-4 border-white/20">
            🍬
          </div>
          <span className="text-xs font-black text-pink-400 uppercase tracking-widest">
            Ready to Play
          </span>
          <h2 className="text-3xl font-black text-white drop-shadow">
            Level {unlockedLevel}
          </h2>

          <button
            onClick={onPlayNextLevel}
            className="w-full py-4 px-6 mt-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-black text-xl rounded-2xl shadow-xl shadow-green-600/40 flex items-center justify-center gap-2.5 transition active:scale-95"
          >
            <Play className="w-6 h-6 fill-white" /> PLAY
          </button>
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-around bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-2xl z-10">
        <button
          onClick={onOpenMap}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-pink-400 transition"
        >
          <MapPin className="w-5 h-5 text-pink-400" />
          <span className="text-[10px] font-bold">Map</span>
        </button>

        <button
          onClick={onOpenShop}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400 transition"
        >
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">Shop</span>
        </button>

        <button
          onClick={onOpenTasks}
          className="relative flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
        >
          <Target className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold">Tasks</span>
          {claimableCount > 0 && (
            <span className="absolute -top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-400 transition"
        >
          <Trophy className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] font-bold">Rankings</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-purple-400 transition"
        >
          <User className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
};
