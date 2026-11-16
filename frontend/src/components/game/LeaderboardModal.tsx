import React, { useState } from 'react';
import { X, Trophy, Medal, Crown, Flame, Users, Globe } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardPlayer {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  score: number;
  isCurrentUser?: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'GLOBAL' | 'WEEKLY' | 'FRIENDS'>('GLOBAL');
  const { username, avatar, unlockedLevel, highScores } = useUserStore();

  if (!isOpen) return null;

  const userTotalScore = Object.values(highScores).reduce((sum, s) => sum + s, 0) || 45200;

  // Mock initial competitors with varied scores
  const globalLeaderboard: LeaderboardPlayer[] = [
    { rank: 1, username: 'SugarQueen', avatar: '👑', level: 98, score: 984500 },
    { rank: 2, username: 'CandyCrusherX', avatar: '🍬', level: 92, score: 875200 },
    { rank: 3, username: 'JellyKnight', avatar: '🍫', level: 86, score: 790400 },
    { rank: 4, username: 'SweetTooth99', avatar: '🍩', level: 78, score: 654000 },
    { rank: 5, username: username, avatar, level: unlockedLevel, score: userTotalScore, isCurrentUser: true },
    { rank: 6, username: 'GummyBearHero', avatar: '🧁', level: 65, score: 512000 },
    { rank: 7, username: 'BerryBlaster', avatar: '🍓', level: 54, score: 430100 },
  ].sort((a, b) => b.score - a.score).map((p, idx) => ({ ...p, rank: idx + 1 }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-black text-white">LEADERBOARD</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-800/80 p-1 border border-slate-700">
          <button
            onClick={() => setTab('GLOBAL')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
              tab === 'GLOBAL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Global
          </button>
          <button
            onClick={() => setTab('WEEKLY')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
              tab === 'WEEKLY' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Weekly
          </button>
          <button
            onClick={() => setTab('FRIENDS')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
              tab === 'FRIENDS' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Friends
          </button>
        </div>

        {/* Ranking List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {globalLeaderboard.map((player) => {
            const isTop3 = player.rank <= 3;
            return (
              <div
                key={player.username}
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  player.isCurrentUser
                    ? 'bg-indigo-950/80 border-indigo-400 shadow-md ring-2 ring-indigo-500/40'
                    : 'bg-slate-800/70 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="w-7 text-center font-black text-sm">
                    {player.rank === 1 ? (
                      <Crown className="w-6 h-6 text-amber-400 mx-auto" />
                    ) : player.rank === 2 ? (
                      <Medal className="w-6 h-6 text-slate-300 mx-auto" />
                    ) : player.rank === 3 ? (
                      <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                    ) : (
                      <span className="text-slate-400">#{player.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shadow">
                    {player.avatar}
                  </div>

                  {/* Name and Level */}
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-white flex items-center gap-1">
                      {player.username}
                      {player.isCurrentUser && (
                        <span className="text-[9px] bg-pink-500 text-white px-1.5 rounded-full font-bold">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Level {player.level}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-sm font-black text-amber-300 block">
                    {player.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Points
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
