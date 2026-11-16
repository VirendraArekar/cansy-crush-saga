import React from 'react';
import { X, Volume2, VolumeX, Music, User, RotateCcw, ShieldCheck } from 'lucide-react';
import { useSoundStore } from '../../store/soundStore';
import { useUserStore } from '../../store/userStore';
import { toast } from '../../store/toastStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { sfxMuted, musicMuted, sfxVolume, musicVolume, toggleSfx, toggleMusic, setSfxVolume, setMusicVolume } = useSoundStore();
  const { username, isGuest, logout } = useUserStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xl font-black text-white">SETTINGS</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Effects Slider & Toggle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-200">
            <span className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-400" /> Sound Effects
            </span>
            <button
              onClick={() => {
                toggleSfx();
                toast.info(!sfxMuted ? 'Sound effects muted' : 'Sound effects unmuted', 'SFX', 1800);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition ${
                !sfxMuted ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {!sfxMuted ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxMuted ? 0 : sfxVolume}
            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Music Slider & Toggle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-200">
            <span className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" /> Background Music
            </span>
            <button
              onClick={() => {
                toggleMusic();
                toast.info(!musicMuted ? 'Background music muted' : 'Background music playing', 'Music', 1800);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition ${
                !musicMuted ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {!musicMuted ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicMuted ? 0 : musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Account Info */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-pink-400" />
              <div>
                <span className="text-sm font-bold text-white block">{username}</span>
                <span className="text-[10px] text-slate-400">
                  {isGuest ? 'Guest Account (Local)' : 'Cloud Synced'}
                </span>
              </div>
            </div>
            {isGuest ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black rounded-xl shadow transition"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={logout}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Version info */}
        <div className="text-center text-[10px] text-slate-500">
          Sugar Cascade Saga v1.0.0 (Production Release)
        </div>
      </div>
    </div>
  );
};
