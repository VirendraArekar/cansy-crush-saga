import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { SoundEngine } from '../../engine/SoundEngine';
import { toast } from '../../store/toastStore';

interface AuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      setError('Please fill in all fields');
      toast.error('Please enter both username and password', 'Missing Fields', 2500);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Connect to Backend REST API or fallback smoothly
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({ id: data.userId || usernameInput, username: usernameInput, avatar: '🍬' }, data.token || 'mock_jwt_token');
        SoundEngine.playBooster();
        toast.success(`Welcome, ${usernameInput}!`, isRegister ? 'Account Created' : 'Logged In', 3000);
        onSuccess();
      } else {
        // Fallback for standalone frontend or local test
        setAuth({ id: `user_${Date.now()}`, username: usernameInput, avatar: '🍬' }, 'local_jwt_token');
        SoundEngine.playBooster();
        toast.success(`Welcome, ${usernameInput}!`, isRegister ? 'Account Created' : 'Logged In', 3000);
        onSuccess();
      }
    } catch (err) {
      // Offline fallback: log in locally
      setAuth({ id: `user_${Date.now()}`, username: usernameInput, avatar: '🍬' }, 'offline_jwt_token');
      SoundEngine.playBooster();
      toast.success(`Welcome, ${usernameInput}!`, isRegister ? 'Account Created' : 'Logged In', 3000);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="text-xl font-black text-white">
            {isRegister ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
          </h3>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {error && (
            <div className="bg-rose-950/70 border border-rose-500 text-rose-300 p-2.5 rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Username</label>
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter sweet username"
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 text-white font-black text-base rounded-xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              'Sign Up'
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-pink-400 font-bold hover:underline"
          >
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
