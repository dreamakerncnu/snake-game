import React from 'react';
import { RotateCcw, Home, Trophy, Flame } from 'lucide-react';
import { GameStats } from '../types/game';

interface GameOverModalProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onHome: () => void;
  isNewRecord: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onPlayAgain,
  onHome,
  isNewRecord,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 flex flex-col items-center text-center">
        {/* Animated Trophy or Fallen Cake Icon */}
        <div className="relative mb-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-3xl">
            {isNewRecord ? '👑' : '🍰'}
          </div>
          {isNewRecord && (
            <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider animate-bounce">
              新紀錄!
            </span>
          )}
        </div>

        <h2 className="font-display text-xl font-bold text-amber-950 mb-0.5">
          {isNewRecord ? '創下全新烘焙傳奇！' : '甜點塔華麗收尾'}
        </h2>
        <p className="text-xs text-amber-900/60 mb-4">
          榮獲稱號：<span className="font-bold text-rose-600">【{stats.currentTitle}】</span>
        </p>

        {/* Scorecard Results Grid */}
        <div className="w-full bg-[#FFF9F5] rounded-2xl p-4 mb-5 border border-amber-100 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
            <span className="text-xs text-amber-800/80 font-medium">最終高度</span>
            <span className="font-mono text-lg font-black text-amber-950 tabular-nums">
              {stats.heightMeters.toFixed(2)}{' '}
              <span className="text-xs font-normal text-amber-700">m</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
            <span className="text-xs text-amber-800/80 font-medium">堆疊層數</span>
            <span className="font-mono text-lg font-black text-rose-600 tabular-nums">
              {stats.score}{' '}
              <span className="text-xs font-normal text-amber-700">層</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-amber-800/80 font-medium">
              <Flame size={13} className="text-orange-500 fill-orange-500" />
              <span>最高連擊</span>
            </div>
            <span className="font-mono text-sm font-bold text-amber-950 tabular-nums">
              {stats.maxCombo}{' '}
              <span className="text-xs font-normal text-amber-700">Combo</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-amber-50/80 px-2.5 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1 text-amber-900 font-semibold">
              <Trophy size={13} className="text-amber-600" />
              <span>歷史最高</span>
            </div>
            <span className="font-mono font-bold text-amber-950 tabular-nums">
              {stats.bestScore} 層
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-display text-sm font-bold shadow-md shadow-rose-500/25 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>再來一盤 (空白鍵 / 點擊)</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-xs font-semibold active:scale-98 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={14} />
            <span>回主選單</span>
          </button>
        </div>
      </div>
    </div>
  );
};
