/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats } from './types/game';
import { SoundManager } from './audio/SoundManager';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { DesktopWrapper } from './components/DesktopWrapper';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return SoundManager.getInstance().getIsMuted();
  });

  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sweet_stacker_best_score');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [bestCombo, setBestCombo] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sweet_stacker_best_combo');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    heightMeters: 0,
    combo: 0,
    maxCombo: 0,
    bestScore: 0,
    bestCombo: 0,
    feverActive: false,
    hasShield: false,
    clockSwingsRemaining: 0,
    currentTitle: '初入廚房',
  });

  const [isNewRecord, setIsNewRecord] = useState(false);
  const [milestoneBanner, setMilestoneBanner] = useState<{
    title: string;
    layer: number;
  } | null>(null);

  const sound = SoundManager.getInstance();

  // Sync initial best stats
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      bestScore,
      bestCombo,
    }));
  }, [bestScore, bestCombo]);

  // Handle Mute Toggle
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, [sound]);

  // Handle Start / Restart
  const handleStartGame = useCallback(() => {
    sound.init();
    setIsNewRecord(false);
    setGameState('PLAYING');
  }, [sound]);

  const handleRestart = useCallback(() => {
    sound.init();
    setIsNewRecord(false);
    setGameState('PLAYING');
  }, [sound]);

  const handleResume = useCallback(() => {
    setGameState('PLAYING');
  }, []);

  const handlePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    }
  }, [gameState]);

  const handleGoHome = useCallback(() => {
    setGameState('MENU');
  }, []);

  // Update Game Stats from physics engine
  const handleUpdateStats = useCallback(
    (newStats: GameStats) => {
      setStats(newStats);

      // Check if new best score achieved during the run
      if (newStats.score > bestScore) {
        setBestScore(newStats.score);
        try {
          localStorage.setItem('sweet_stacker_best_score', newStats.score.toString());
        } catch {
          // ignore
        }
      }

      if (newStats.maxCombo > bestCombo) {
        setBestCombo(newStats.maxCombo);
        try {
          localStorage.setItem('sweet_stacker_best_combo', newStats.maxCombo.toString());
        } catch {
          // ignore
        }
      }
    },
    [bestScore, bestCombo]
  );

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalStats: GameStats) => {
      const isNew = finalStats.score > bestScore;
      setIsNewRecord(isNew);
      if (isNew) {
        setBestScore(finalStats.score);
        try {
          localStorage.setItem('sweet_stacker_best_score', finalStats.score.toString());
        } catch {
          // ignore
        }
      }
      setStats(finalStats);
      setGameState('GAMEOVER');
    },
    [bestScore]
  );

  // Handle Milestone Unlock Banner
  const handleMilestoneUnlock = useCallback((title: string, layer: number) => {
    setMilestoneBanner({ title, layer });
    setTimeout(() => {
      setMilestoneBanner(null);
    }, 3800);
  }, []);

  // Keyboard shortcut listener for Pause (P / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleToggleMute]);

  return (
    <DesktopWrapper stats={stats}>
      {/* 60fps Physics & Canvas Engine */}
      <GameCanvas
        gameState={gameState}
        onUpdateStats={handleUpdateStats}
        onGameOver={handleGameOver}
        onMilestoneUnlock={handleMilestoneUnlock}
        bestScore={bestScore}
        bestCombo={bestCombo}
      />

      {/* In-Game HUD (Only during active gameplay or pause) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          milestoneBanner={milestoneBanner}
        />
      )}

      {/* Title Screen Overlay */}
      {gameState === 'MENU' && (
        <TitleScreen
          onStart={handleStartGame}
          bestScore={bestScore}
          bestCombo={bestCombo}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Pause Modal Overlay */}
      {gameState === 'PAUSED' && (
        <PauseModal
          stats={stats}
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleGoHome}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal Overlay */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onPlayAgain={handleRestart}
          onHome={handleGoHome}
          isNewRecord={isNewRecord}
        />
      )}
    </DesktopWrapper>
  );
}
