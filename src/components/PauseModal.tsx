import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { GameStats } from '../types/game';

interface PauseModalProps {
  stats: GameStats;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 flex flex-col items-center text-center">
        {/* Title */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
          <span className="text-2xl">☕</span>
        </div>
        <h2 className="font-display text-xl font-bold text-amber-950 mb-1">
          烘焙休息室 (暫停)
        </h2>
        <p className="text-xs text-amber-900/60 mb-5">
          深呼吸，聞一聞剛出爐舒芙蕾的焦糖香氣
        </p>

        {/* Current Stats Summary Box */}
        <div className="w-full bg-[#FFF8F3] rounded-2xl p-3.5 mb-6 border border-amber-100 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-800/80 font-medium">當前高度</span>
            <span className="font-mono text-sm font-bold text-amber-950 tabular-nums">
              {stats.heightMeters.toFixed(2)}m
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-amber-200/50 px-1">
            <span className="text-[10px] text-amber-800/80 font-medium">堆疊層數</span>
            <span className="font-mono text-sm font-bold text-amber-950 tabular-nums">
              {stats.score}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-800/80 font-medium">連擊數</span>
            <span className="font-mono text-sm font-bold text-amber-950 tabular-nums">
              {stats.combo}
            </span>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-display text-sm font-bold shadow-md shadow-rose-500/20 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={16} className="fill-white" />
            <span>繼續堆疊 (P / Esc)</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-display text-xs font-bold active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>重新開始</span>
          </button>

          {/* Bottom Row: Mute & Home */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onToggleMute}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? '靜音中' : '音效開'}</span>
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home size={14} />
              <span>回主選單</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
