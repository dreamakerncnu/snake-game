import React from 'react';
import { GameStats } from '../types/game';
import { DESSERT_NAMES } from '../game/drawing';

interface DesktopWrapperProps {
  children: React.ReactNode;
  stats: GameStats;
}

export const DesktopWrapper: React.FC<DesktopWrapperProps> = ({ children, stats }) => {
  return (
    <div className="relative w-full h-[100dvh] bg-[#221316] overflow-hidden flex items-center justify-center">
      {/* Background Japanese Patisserie Ambient Wallpaper */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C28876_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Atmospheric Soft Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      {/* Main Layout Container (Desktop Split: Left Guide | Center Phone Shell | Right Buffs) */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex items-center justify-center p-0 lg:p-4 gap-8">
        {/* Left Side Panel (Desktop only: Patisserie Handbook & Milestones) */}
        <aside className="hidden xl:flex flex-col justify-between w-72 h-[840px] bg-[#2E1A1E]/80 backdrop-blur-md rounded-3xl p-5 border border-amber-900/40 text-amber-100/90 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-900/40">
              <span className="text-xl">🍵</span>
              <div>
                <h3 className="font-display text-sm font-bold text-amber-200">洋菓子手冊</h3>
                <p className="text-[10px] text-amber-300/60">8 款和風甜點輪流登場</p>
              </div>
            </div>

            {/* Sweets List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🥞</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.souffle_pancake}</span>
                </span>
                <span className="text-[10px] text-amber-400">熔岩黃油</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🍓</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.strawberry_shortcake}</span>
                </span>
                <span className="text-[10px] text-rose-300">鮮切草莓</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🍃</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.matcha_millefeuille}</span>
                </span>
                <span className="text-[10px] text-emerald-300">宇治抹茶</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🌸</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.macaron_pink}</span>
                </span>
                <span className="text-[10px] text-pink-300">玫瑰蕾絲</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🌿</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.macaron_mint}</span>
                </span>
                <span className="text-[10px] text-teal-300">沁爽薄荷</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🍮</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.caramel_pudding}</span>
                </span>
                <span className="text-[10px] text-amber-400">琥珀焦糖</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🫐</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.blueberry_tart}</span>
                </span>
                <span className="text-[10px] text-purple-300">香酥果撻</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/40 border border-amber-900/30">
                <span className="flex items-center gap-2">
                  <span>🍫</span>
                  <span className="font-medium text-amber-200">{DESSERT_NAMES.chocolate_roll}</span>
                </span>
                <span className="text-[10px] text-amber-500">生巧生乳</span>
              </div>
            </div>
          </div>

          {/* Milestones Footnote */}
          <div className="pt-3 border-t border-amber-900/40 text-[11px] text-amber-200/70">
            <span className="font-semibold text-amber-300">稱號階梯成就：</span>
            <div className="mt-1 leading-relaxed">
              每達 10 層解鎖稱號（見習生、新手、達人、抹茶師、大師、洋菓子之神）並發射全彩彩帶砲！
            </div>
          </div>
        </aside>

        {/* Center: High-Precision Mobile Phone Frame */}
        <main className="relative w-full h-[100dvh] lg:h-[880px] lg:max-w-[440px] bg-black lg:rounded-[44px] shadow-2xl overflow-hidden flex flex-col border-0 lg:border-[8px] lg:border-[#382327]">
          {/* Subtle Dynamic Phone Speaker / Camera Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/60 rounded-full z-30 pointer-events-none hidden lg:block" />

          {/* Phone Screen Viewport */}
          <div className="relative w-full h-full overflow-hidden bg-[#FFF5EC]">
            {children}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full z-30 pointer-events-none hidden lg:block" />
        </main>

        {/* Right Side Panel (Desktop only: Power-up mechanics & keyboard shortcuts) */}
        <aside className="hidden xl:flex flex-col justify-between w-72 h-[840px] bg-[#2E1A1E]/80 backdrop-blur-md rounded-3xl p-5 border border-amber-900/40 text-amber-100/90 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-900/40">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="font-display text-sm font-bold text-amber-200">特殊道具機制</h3>
                <p className="text-[10px] text-amber-300/60">精準置中疊中即可捕獲</p>
              </div>
            </div>

            {/* Buff items showcase */}
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm shadow-xs">
                    🍒
                  </div>
                  <span className="font-bold text-xs text-amber-400">金色櫻桃</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  完美置中時大幅回補蛋糕寬度 <span className="text-amber-300 font-bold">+24px</span>。
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm shadow-xs">
                    ⏰
                  </div>
                  <span className="font-bold text-xs text-cyan-300">焦糖時鐘</span>
                </div>
                <p className="text-[11px] text-cyan-100/80 leading-relaxed">
                  擺鐘擺速降至 <span className="text-cyan-300 font-bold">65% 慢速</span>，維持接下來的 5 次擺盪。
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm shadow-xs">
                    🛡️
                  </div>
                  <span className="font-bold text-xs text-orange-400">保命護盾</span>
                </div>
                <p className="text-[11px] text-orange-100/80 leading-relaxed">
                  裝備 1 次護盾。若裁切或完全丟歪，護盾粉碎吸收，保全甜點寬度不墜亡！
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Strip */}
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-900/50">
            <h4 className="text-xs font-bold text-amber-300 mb-2">操作指引</h4>
            <div className="space-y-1.5 text-[11px] text-amber-200/70 font-mono">
              <div className="flex justify-between items-center">
                <span>空白鍵 / Enter</span>
                <span className="text-amber-300 font-sans">掉落甜點</span>
              </div>
              <div className="flex justify-between items-center">
                <span>P / Escape</span>
                <span className="text-amber-300 font-sans">暫停 / 繼續</span>
              </div>
              <div className="flex justify-between items-center">
                <span>點擊螢幕</span>
                <span className="text-amber-300 font-sans">觸控或滑鼠</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
