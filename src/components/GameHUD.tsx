import React from 'react';
import { Pause, Volume2, VolumeX, Shield, Clock, Flame } from 'lucide-react';
import { GameStats } from '../types/game';

interface GameHUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  milestoneBanner?: { title: string; layer: number } | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onPause,
  milestoneBanner,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Height and Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-amber-200/50">
            <span className="text-[11px] font-semibold tracking-wider text-amber-800 uppercase">高度</span>
            <span className="font-mono text-sm font-bold text-amber-950 tabular-nums">
              {stats.heightMeters.toFixed(2)}
            </span>
            <span className="text-[10px] text-amber-700">m</span>
          </div>

          <div className="text-[11px] font-semibold text-amber-900/80 px-1 truncate max-w-[120px]">
            {stats.currentTitle}
          </div>
        </div>

        {/* Center: Current Score & Fever Status */}
        <div className="flex flex-col items-center">
          <div
            className={`font-display text-4xl font-extrabold tabular-nums tracking-tight transition-transform duration-200 ${
              stats.feverActive
                ? 'text-rose-500 scale-110 drop-shadow-md animate-pulse'
                : 'text-amber-950'
            }`}
          >
            {stats.score}
          </div>

          {/* Sweet Fever Indicator */}
          {stats.feverActive ? (
            <div className="flex items-center gap-1 mt-0.5 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm animate-bounce">
              <Flame size={12} className="text-yellow-300 fill-yellow-300" />
              <span>FEVER x2</span>
            </div>
          ) : stats.combo > 1 ? (
            <div className="text-[11px] font-bold text-amber-600 mt-0.5">
              {stats.combo} COMBO!
            </div>
          ) : null}
        </div>

        {/* Right: Audio & Pause Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-9 h-9 rounded-xl bg-white/85 hover:bg-white active:scale-95 transition-all flex items-center justify-center text-amber-900 shadow-xs border border-amber-200/60"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="w-9 h-9 rounded-xl bg-white/85 hover:bg-white active:scale-95 transition-all flex items-center justify-center text-amber-900 shadow-xs border border-amber-200/60"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* Milestone Unlocked Banner Pop-down */}
      {milestoneBanner && (
        <div className="self-center mt-2 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white px-4 py-1.5 rounded-full shadow-lg border border-amber-200/80 flex items-center gap-2">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-extrabold tracking-wide">
              {milestoneBanner.layer} 層達成：解鎖稱號【{milestoneBanner.title}】
            </span>
          </div>
        </div>
      )}

      {/* Bottom Area: Active Buffs & Controls Hint */}
      <div className="w-full flex items-end justify-between">
        {/* Active Buffs Cluster */}
        <div className="flex items-center gap-2">
          {stats.hasShield && (
            <div className="flex items-center gap-1 bg-orange-500/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-md animate-pulse">
              <Shield size={13} className="fill-white" />
              <span>護盾保護中</span>
            </div>
          )}

          {stats.clockSwingsRemaining > 0 && (
            <div className="flex items-center gap-1 bg-cyan-600/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-md">
              <Clock size={13} />
              <span>慢速剩餘 {stats.clockSwingsRemaining} 次</span>
            </div>
          )}
        </div>

        {/* Discrete bottom drop hint */}
        <div className="text-[11px] font-medium text-amber-900/60 bg-white/60 px-2 py-0.5 rounded-md">
          點擊 / 空白鍵 掉落
        </div>
      </div>
    </div>
  );
};
