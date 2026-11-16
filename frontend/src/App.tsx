import React, { useState } from 'react';
import { useGameStore, GameScreen } from './store/gameStore';
import { useUserStore } from './store/userStore';
import { SplashScreen } from './components/screens/SplashScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { LevelMapScreen } from './components/screens/LevelMapScreen';
import { GameplayScreen } from './components/screens/GameplayScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { LevelGoalModal } from './components/game/LevelGoalModal';
import { BoosterShopModal } from './components/game/BoosterShopModal';
import { ProfileModal } from './components/game/ProfileModal';
import { SettingsModal } from './components/game/SettingsModal';
import { LeaderboardModal } from './components/game/LeaderboardModal';
import { RewardedAdModal } from './components/game/RewardedAdModal';
import { SweetTasksModal } from './components/game/SweetTasksModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { useTaskStore } from './store/taskStore';
import { getLevelConfig } from './levels/levelCatalog';

export const App: React.FC = () => {
  const { currentScreen, setScreen, startLevel } = useGameStore();
  const { unlockedLevel, addLives } = useUserStore();
  const { openTasksModal } = useTaskStore();

  const [selectedMapLevel, setSelectedMapLevel] = useState<number | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [adRewardType, setAdRewardType] = useState<'LIVES' | null>(null);

  const handleStartLevel = (levelId: number, boosters?: any) => {
    setSelectedMapLevel(null);
    startLevel(levelId, boosters);
  };

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen') as GameScreen | null;
      const modalParam = params.get('modal');

      if (screenParam) {
        setScreen(screenParam);
        if (screenParam === 'PLAYING') {
          startLevel(1);
        }
      }
      if (modalParam === 'GOAL') setSelectedMapLevel(1);
      if (modalParam === 'SHOP') setIsShopOpen(true);
      if (modalParam === 'PROFILE') setIsProfileOpen(true);
      if (modalParam === 'SETTINGS') setIsSettingsOpen(true);
      if (modalParam === 'LEADERBOARD') setIsLeaderboardOpen(true);
      if (modalParam === 'TASKS') openTasksModal();
      if (modalParam === 'AD') setAdRewardType('LIVES');
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 text-white font-sans overflow-hidden flex items-center justify-center">
      {/* Desktop Ambient Background Wallpaper with Floating Confections */}
      <div className="hidden lg:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-purple-950 to-black pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-20 text-7xl opacity-20 animate-bounce">🍭</div>
        <div className="absolute bottom-20 left-32 text-8xl opacity-15 animate-pulse">🍬</div>
        <div className="absolute top-24 right-28 text-7xl opacity-20 animate-bounce">🧁</div>
        <div className="absolute bottom-16 right-36 text-8xl opacity-15 animate-pulse">🍩</div>
      </div>

      {/* Main Responsive Game Viewport (Mobile-first, Max-width 480px) */}
      <div className="relative w-full h-full max-w-[480px] bg-slate-950 shadow-[0_0_60px_rgba(0,0,0,0.8)] border-x border-indigo-500/20 flex flex-col overflow-hidden">
        {/* Top-Left Toast Notifications */}
        <ToastContainer />

        {/* Active Screen */}
        {currentScreen === 'SPLASH' && (
          <SplashScreen
            onStart={() => setScreen('HOME')}
            onOpenMap={() => setScreen('MAP')}
          />
        )}

        {currentScreen === 'HOME' && (
          <HomeScreen
            onPlayNextLevel={() => setSelectedMapLevel(unlockedLevel)}
            onOpenMap={() => setScreen('MAP')}
            onOpenShop={() => setIsShopOpen(true)}
            onOpenTasks={openTasksModal}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onWatchAdForLives={() => setAdRewardType('LIVES')}
          />
        )}

      {currentScreen === 'MAP' && (
        <LevelMapScreen
          onSelectLevel={(levelId) => setSelectedMapLevel(levelId)}
          onBack={() => setScreen('HOME')}
        />
      )}

      {currentScreen === 'PLAYING' && <GameplayScreen />}

      {currentScreen === 'AUTH' && (
        <AuthScreen
          onSuccess={() => setScreen('HOME')}
          onCancel={() => setScreen('HOME')}
        />
      )}

      {/* Global Modals */}
      {selectedMapLevel !== null && (
        <LevelGoalModal
          isOpen={true}
          levelConfig={getLevelConfig(selectedMapLevel)}
          onPlay={(boosters) => handleStartLevel(selectedMapLevel, boosters)}
          onClose={() => setSelectedMapLevel(null)}
          onOpenLivesShop={() => {
            setSelectedMapLevel(null);
            setAdRewardType('LIVES');
          }}
        />
      )}

      <BoosterShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onWatchAdForCoins={() => {
          setIsShopOpen(false);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setScreen('AUTH');
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <RewardedAdModal
        isOpen={adRewardType !== null}
        rewardTitle="+1 Free Life"
        onRewardGranted={() => {
          addLives(1);
          setAdRewardType(null);
        }}
        onClose={() => setAdRewardType(null)}
      />

      <SweetTasksModal />
      </div>
    </div>
  );
};

export default App;
