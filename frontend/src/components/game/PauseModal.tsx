import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { useSoundStore } from '../../store/soundStore';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onHome,
}) => {
  const { sfxMuted, musicMuted, toggleSfx, toggleMusic } = useSoundStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5">
        <h3 className="text-2xl font-black text-white tracking-wide">GAME PAUSED</h3>

        {/* Audio quick toggles */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSfx}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition ${
              !sfxMuted
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Toggle Sound Effects"
          >
            {!sfxMuted ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleMusic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition ${
              !musicMuted
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Toggle Music"
          >
            <Music className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" /> Resume
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5" /> Retry Level
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Home className="w-5 h-5" /> Quit to Map
          </button>
        </div>
      </div>
    </div>
  );
};
