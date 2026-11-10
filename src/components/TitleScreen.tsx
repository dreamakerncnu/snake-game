import React from 'react';
import { Play, Volume2, VolumeX, Flame, Shield, Clock } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  bestScore: number;
  bestCombo: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  bestScore,
  bestCombo,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between items-center p-6 text-center select-none bg-gradient-to-b from-[#FFF5EC] via-[#FFEBEF] to-[#FCE7F3] overflow-y-auto">
      {/* Top Bar inside Phone Frame */}
      <div className="w-full flex justify-between items-center">
        <div className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest">
          和風洋菓子物語
        </div>
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white active:scale-95 transition-all flex items-center justify-center text-amber-900 shadow-xs border border-amber-200/60"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke inline SVG Title Lockup */}
      <div className="my-auto flex flex-col items-center max-w-xs">
        {/* Animated Pendulum Mini Illustration */}
        <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Top Gear Anchor */}
            <circle cx="50" cy="12" r="8" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <circle cx="50" cy="12" r="3" fill="#FFFFFF" />

            {/* Swinging String with Motion */}
            <g className="origin-top animate-[spin_3s_ease-in-out_infinite_alternate]" style={{ transformOrigin: '50px 12px' }}>
              <line x1="50" y1="12" x2="50" y2="60" stroke="#D4AF37" strokeWidth="2.5" />
              {/* Hanging Souffle Cake */}
              <rect x="25" y="60" width="50" height="24" rx="7" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              <rect x="30" y="64" width="40" height="4" rx="2" fill="#FEF3C7" />
              {/* Butter Cube */}
              <rect x="44" y="55" width="12" height="9" rx="2" fill="#FDE047" stroke="#EAB308" strokeWidth="1" />
              {/* Cherry */}
              <circle cx="50" cy="50" r="5" fill="#EF4444" />
              <path d="M50 45 C52 40, 56 40, 58 42" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Bespoke SVG Title Lockup */}
        <div className="relative mb-2">
          <svg viewBox="0 0 320 80" className="w-68 h-auto drop-shadow-sm">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BE123C" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="48"
              textAnchor="middle"
              className="font-display font-black text-3xl"
              fill="url(#titleGrad)"
              stroke="#FFFFFF"
              strokeWidth="4"
              paintOrder="stroke fill"
              letterSpacing="2"
            >
              甜蜜擺鐘甜點塔
            </text>
            <text
              x="50%"
              y="72"
              textAnchor="middle"
              className="font-display font-bold text-xs"
              fill="#9F1239"
              letterSpacing="4"
            >
              SWEET STACKER
            </text>
          </svg>
        </div>

        <p className="text-xs text-amber-950/70 font-medium leading-relaxed max-w-[240px] mb-5">
          在舒芙蕾與馬卡龍的甜香中，看準擺鐘擺盪時機，堆疊出無與倫比的和風洋菓子之塔！
        </p>

        {/* Start Game CTA Button */}
        <button
          onClick={onStart}
          className="group relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-display text-base font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play size={18} className="fill-white group-hover:scale-110 transition-transform" />
          <span>開始烘焙堆疊</span>
        </button>

        {/* Single Flat Control Hint Line */}
        <div className="mt-3 text-[11px] text-amber-900/60 font-medium">
          點擊螢幕 / 空白鍵 掉落 · P / Esc 暫停
        </div>
      </div>

      {/* Bottom Showcase: High Scores & Buffs Overview */}
      <div className="w-full flex flex-col gap-3">
        {/* Record Strip */}
        <div className="bg-white/70 backdrop-blur-xs rounded-xl p-2.5 border border-amber-200/60 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-800 font-semibold uppercase">歷史最高層數</span>
            <span className="font-mono text-base font-extrabold text-amber-950 tabular-nums">
              {bestScore} <span className="text-xs font-normal text-amber-700">層</span>
            </span>
          </div>
          <div className="h-6 w-px bg-amber-200/80" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-800 font-semibold uppercase">最佳連擊</span>
            <span className="font-mono text-base font-extrabold text-amber-950 tabular-nums">
              {bestCombo} <span className="text-xs font-normal text-amber-700">Combo</span>
            </span>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-amber-900/75">
          <span className="flex items-center gap-1">🍒 寬度回補</span>
          <span>·</span>
          <span className="flex items-center gap-1">⏰ 焦糖慢速</span>
          <span>·</span>
          <span className="flex items-center gap-1">🛡️ 護盾保命</span>
        </div>
      </div>
    </div>
  );
};
