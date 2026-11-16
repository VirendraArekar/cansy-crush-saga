import React, { useState, useEffect } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { GameHUD } from '../game/GameHUD';
import { BoosterBar } from '../game/BoosterBar';
import { PauseModal } from '../game/PauseModal';
import { LevelWinModal } from '../game/LevelWinModal';
import { LevelFailModal } from '../game/LevelFailModal';
import { BoosterShopModal } from '../game/BoosterShopModal';
import { RewardedAdModal } from '../game/RewardedAdModal';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { toast } from '../../store/toastStore';

export const GameplayScreen: React.FC = () => {
  const {
    levelConfig,
    grid,
    score,
    movesLeft,
    timeLeft,
    stars,
    progress,
    selectedTile,
    activeBooster,
    isAnimating,
    gameStatus,
    comboText,
    selectTile,
    activateBooster,
    cancelActiveBooster,
    tickTimer,
    pauseGame,
    resumeGame,
    restartLevel,
    nextLevel,
    setScreen,
    addExtraMoves,
    executeSwapMove,
  } = useGameStore();

  const { addCoins, addLives, deductCoins } = useUserStore();

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [rewardedAdTarget, setRewardedAdTarget] = useState<'MOVES' | 'LIVES' | 'COINS' | null>(null);

  // Timer interval for timed levels
  useEffect(() => {
    if (timeLeft === null || gameStatus !== 'PLAYING') return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, gameStatus, tickTimer]);

  const handleBuyMoves = () => {
    if (deductCoins(120)) {
      addExtraMoves(5);
    } else {
      toast.error('Not enough coins to buy extra moves!', 'Coins Needed', 2500);
    }
  };

  const handleWatchAdForMoves = () => {
    setRewardedAdTarget('MOVES');
  };

  const handleRewardGranted = () => {
    if (rewardedAdTarget === 'MOVES') {
      addExtraMoves(5);
    } else if (rewardedAdTarget === 'LIVES') {
      addLives(1);
    } else if (rewardedAdTarget === 'COINS') {
      addCoins(150);
    }
    setRewardedAdTarget(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-600 via-pink-500 to-indigo-950 flex flex-col justify-between py-1.5 select-none">
      {/* Whimsical Candy Kingdom Landscape Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Glowing Clouds */}
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-white/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 rounded-full bg-pink-400/25 blur-3xl" />
        {/* Candy Cane Stripe Texture Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.04)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.04)_75%)] bg-[length:48px_48px] pointer-events-none" />
      </div>
      {/* Floating Combo Splash Text */}
      {comboText && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-in zoom-in-50 duration-300">
          <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(255,42,109,0.9)] animate-bounce">
            {comboText}
          </span>
        </div>
      )}

      {/* Top HUD */}
      <GameHUD
        levelConfig={levelConfig}
        score={score}
        movesLeft={movesLeft}
        timeLeft={timeLeft}
        stars={stars}
        progress={progress}
        onPause={pauseGame}
      />

      {/* Center Game Canvas Board */}
      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        <GameCanvas
          grid={grid}
          selectedTile={selectedTile}
          onTileClick={selectTile}
          onSwapMove={executeSwapMove}
          isAnimating={isAnimating}
          activeBooster={activeBooster}
        />
      </div>

      {/* Bottom Boosters Toolbar */}
      <BoosterBar
        activeBooster={activeBooster}
        onActivate={activateBooster}
        onCancel={cancelActiveBooster}
        onOpenShop={() => setIsShopOpen(true)}
      />

      {/* Modals */}
      <PauseModal
        isOpen={gameStatus === 'PAUSED'}
        onResume={resumeGame}
        onRestart={restartLevel}
        onHome={() => setScreen('MAP')}
      />

      <LevelWinModal
        isOpen={gameStatus === 'WON'}
        score={score}
        stars={stars}
        levelConfig={levelConfig}
        onNext={nextLevel}
        onRestart={restartLevel}
        onHome={() => setScreen('MAP')}
      />

      <LevelFailModal
        isOpen={gameStatus === 'LOST'}
        score={score}
        onBuyMoves={handleBuyMoves}
        onWatchAdForMoves={handleWatchAdForMoves}
        onRetry={restartLevel}
        onGiveUp={() => setScreen('MAP')}
      />

      <BoosterShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onWatchAdForCoins={() => setRewardedAdTarget('COINS')}
      />

      <RewardedAdModal
        isOpen={rewardedAdTarget !== null}
        rewardTitle={
          rewardedAdTarget === 'MOVES'
            ? '+5 Extra Moves'
            : rewardedAdTarget === 'LIVES'
            ? '+1 Free Life'
            : '+150 Free Coins'
        }
        onRewardGranted={handleRewardGranted}
        onClose={() => setRewardedAdTarget(null)}
      />
    </div>
  );
};
