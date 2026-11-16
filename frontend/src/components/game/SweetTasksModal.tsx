import React from 'react';
import { X, Check, Gift, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTaskStore } from '../../store/taskStore';

export const SweetTasksModal: React.FC = () => {
  const { tasks, isTasksModalOpen, closeTasksModal, claimTask } = useTaskStore();

  if (!isTasksModalOpen) return null;

  const handleClaim = (taskId: string) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF2A6D', '#FFD700', '#00E676', '#05D9E8'],
    });
    claimTask(taskId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-pink-500/50 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-black text-white">SWEET TASKS</h3>
          </div>
          <button
            onClick={closeTasksModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-500/40 p-3 rounded-2xl flex items-center gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h4 className="text-xs font-bold text-pink-200 uppercase tracking-wide">
              Complete Tasks In-Game
            </h4>
            <p className="text-xs text-white font-medium">
              Earn free coins, extra lives, and powerful boosters!
            </p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {tasks.map((task) => {
            const isCompleted = task.current >= task.target;
            const progressPercent = Math.min(100, Math.round((task.current / task.target) * 100));

            return (
              <div
                key={task.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex flex-col gap-2.5 hover:border-pink-500/40 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-white text-sm">
                        {task.title}
                      </span>
                      <span className="text-xs text-slate-400">
                        {task.description}
                      </span>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <div className="bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-xl text-xs font-black text-amber-300 shrink-0">
                    {task.rewardLabel}
                  </div>
                </div>

                {/* Progress bar and Claim button row */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>Progress</span>
                      <span className="text-pink-300">
                        {task.current} / {task.target}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action button */}
                  {task.claimed ? (
                    <span className="py-1.5 px-3 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(task.id)}
                      className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-black text-xs rounded-xl shadow-lg shadow-green-600/40 flex items-center gap-1.5 animate-bounce transition active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Claim!
                    </button>
                  ) : (
                    <span className="py-1.5 px-3 bg-slate-800/80 text-slate-500 font-semibold text-xs rounded-xl">
                      {progressPercent}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
