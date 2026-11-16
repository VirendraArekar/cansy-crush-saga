import React from 'react';
import { X, Trophy, Star, Award, Shield, User, Copy, Check } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { toast } from '../../store/toastStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = ['🍭', '🍬', '🍫', '🍩', '🧁', '🍪', '🍓', '🍒'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { username, avatar, userId, unlockedLevel, levelStars, highScores, boosters } = useUserStore();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  const totalScore = Object.values(highScores).reduce((sum, s) => sum + s, 0);
  const totalBoosters = Object.values(boosters).reduce((sum, b) => sum + b, 0);

  const copyId = () => {
    navigator.clipboard?.writeText(userId);
    setCopied(true);
    toast.info('Player ID copied to clipboard!', 'Copied', 2000);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xl font-black text-white">PLAYER PROFILE</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Display */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl border-4 border-white/20">
            {avatar}
          </div>
        </div>

        <div className="text-center">
          <h4 className="text-xl font-black text-white">{username}</h4>
          <button
            onClick={copyId}
            className="text-[10px] text-slate-400 hover:text-slate-200 font-mono mt-0.5 flex items-center justify-center gap-1 transition"
          >
            ID: {userId.substring(0, 14)}... {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl flex flex-col items-center">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xl font-black text-white">{unlockedLevel}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Level Reached</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl flex flex-col items-center">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300 mb-1" />
            <span className="text-xl font-black text-white">{totalStars}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Stars Collected</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl flex flex-col items-center">
            <Award className="w-5 h-5 text-pink-400 mb-1" />
            <span className="text-xl font-black text-white">{totalScore.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Score</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl flex flex-col items-center">
            <Shield className="w-5 h-5 text-indigo-400 mb-1" />
            <span className="text-xl font-black text-white">{totalBoosters}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Boosters Owned</span>
          </div>
        </div>
      </div>
    </div>
  );
};
