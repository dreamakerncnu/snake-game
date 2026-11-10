# 《甜蜜擺鐘甜點塔》（Sweet Stacker）完整跨平台實作計畫書

本計畫書旨在提供一份**高完整度、可獨立移植**的軟體架構與遊戲引擎實作規格。任何 AI Studio 實例或工程師皆可依照本份計畫書，從零開始構建出一套具備日系舒芙蕾甜點美學、純 Canvas 2D 物理裁切、Web Audio API 合成音效、道具增益、以及連擊狂熱機制的完整 Web 應用程式。

---

## 1. 核心概念與體驗定位

- **遊戲類型**：物理擺鐘休閒益智堆疊遊戲（Casual Physics Stacker）。
- **視覺風格**：日系精緻和風洋菓子美學（柔和馬卡龍配色、舒芙蕾蓬鬆質感、奶油滴落、白玉珍珠底盤）。
- **零外部素材依賴（Zero External Assets）**：所有甜點、擺鐘、奶油碎屑、光暈、道具底盤與字型描邊均由 **HTML5 Canvas 2D API** 即時演算法繪製；所有音效均由瀏覽器原生 **Web Audio API** 即時振盪器合成。
- **響應式容器**：桌面環境呈現和風甜點店壁紙與操作指引；中央主體為 `440px × 880px`（支援 `100dvh`）的直式手機擬真外框，觸控與滑鼠、鍵盤體驗無縫融合。

---

## 2. 技術棧與專案結構

### A. 推薦依賴與版本
- **核心框架**：React 19 + TypeScript 5
- **建置工具**：Vite 6+
- **樣式系統**：Tailwind CSS v4（`@import "tailwindcss";`）
- **圖示庫**：`lucide-react`（`Play`, `Pause`, `RotateCcw`, `Volume2`, `VolumeX`, `Home`, `Flame`, `Smartphone` 等）

### B. 元件階層架構

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  • 狀態機控制: GameState ('MENU'|'PLAYING'|'PAUSED'...)│
│  • 全域最高分與最佳連擊 LocalStorage 讀寫              │
│  • 全域鍵盤快捷鍵 (P / Escape 暫停, 空白鍵/Enter 掉落) │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       (暫停時渲染)                       │ (Menu / GameOver 渲染)
                ▼                        ▼
 ┌────────────────────────┐    ┌────────────────────────┐
 │     PauseModal.tsx     │    │ TitleScreen / GameOver │
 └────────────────────────┘    └────────────────────────┘
                │                        │
                ├────────────────────────┘
                ▼
 ┌──────────────────────────────────────────────────────┐
 │                    GameHUD.tsx                       │
 │  • 頂部塔高(m)標籤、中心層數計分、FEVER 狀態、暫停按鈕│
 │  • 當前道具增益徽章 (護盾、慢速次數)、解鎖稱號橫幅   │
 └──────────────────────────┬───────────────────────────┘
                            ▼
 ┌──────────────────────────────────────────────────────┐
 │                   GameCanvas.tsx                     │
 │  • 60fps requestAnimationFrame 物理迴圈與相機跟隨   │
 │  • 擺鐘調和運動、裁切演算法、碎片旋轉下墜物理        │
 │  • 多色系背景漸層平滑插值、粒子與浮動文字系統        │
 └──────────────────────────────────────────────────────┘
```

---

## 3. 物理引擎與核心數學公式

### A. 擺鐘調和震盪（Pendulum Harmonic Motion）
擺鐘以頂部懸吊點為圓心左右擺動，其運動公式為簡諧調和函數：
$$\theta(t) = \theta_{\max} \cdot \sin(\omega \cdot t)$$
- 最大擺動角度：$\theta_{\max} = 0.65\text{ rad} \approx 37^\circ$
- 基本角速度：$\omega = 2.5\text{ rad/s}$（若觸發「焦糖時鐘」則變為 $1.625\text{ rad/s}$，即 $65\%$ 慢速）
- 擺臂長度：$L = 160\text{ px}$
- 擺鐘錨點（懸吊中心）：$(x_{\text{pivot}}, y_{\text{pivot}}) = \left(\frac{W_{\text{canvas}}}{2}, Y_{\text{camera}} + 50\right)$
- 甜點懸掛座標：
  $$x_{\text{dessert}} = x_{\text{pivot}} + L \cdot \sin(\theta) - \frac{W_{\text{current}}}{2}$$
  $$y_{\text{dessert}} = y_{\text{pivot}} + L \cdot \cos(\theta) - \frac{H_{\text{block}}}{2}$$

### B. 垂直下墜與重力（Drop & Gravity）
- 甜點初速度：$v_y = 180\text{ px/s}$，水平初速度 $v_x = 0$
- 重力加速度：$g = 1600\text{ px/s}^2$
- 每一幀位移更新：
  $$v_y \leftarrow v_y + g \cdot \Delta t, \quad y \leftarrow y + v_y \cdot \Delta t$$

### C. 裁切與重疊演算法（Slicing & Overlap）
當下墜甜點底部接觸塔頂表面 $Y_{\text{target}}$ 時進行幾何相交計算：
- 下墜方塊邊界：$[x_{\text{drop}}, x_{\text{drop}} + W_{\text{drop}}]$
- 塔頂方塊邊界：$[x_{\text{target}}, x_{\text{target}} + W_{\text{target}}]$
- 重疊區間：
  $$x_{\text{overlap\_left}} = \max(x_{\text{drop}}, x_{\text{target}})$$
  $$x_{\text{overlap\_right}} = \min(x_{\text{drop}} + W_{\text{drop}}, x_{\text{target}} + W_{\text{target}})$$
  $$W_{\text{overlap}} = x_{\text{overlap\_right}} - x_{\text{overlap\_left}}$$

1. **完美判定（Perfect Stack）**：
   - 中心偏移量：$|\Delta x_{\text{center}}| = \left|\frac{x_{\text{drop}} + x_{\text{drop}} + W_{\text{drop}}}{2} - \frac{x_{\text{target}} + x_{\text{target}} + W_{\text{target}}}{2}\right| \le 4.5\text{ px}$
   - 回饋：不進行裁切，方塊寬度維持 $W_{\text{target}}$，觸發完美音階、金色星芒粒子與寬度回補。
2. **正常裁切（Trimmed Slice）**：
   - 裁下多餘部分轉換為獨立碎片（`Debris`），保留裁切側之水平衝量 $v_x = \pm(120 \sim 160)\text{ px/s}$、角速度 $v_{\text{rot}} = \pm(7 \sim 11)\text{ rad/s}$ 及自然重力翻滾下落。
   - 新頂層寬度縮減為 $W_{\text{overlap}}$。
3. **完全未命中（Miss Drop & Tumbling Fall）**：
   - 若 $W_{\text{overlap}} \le 0$，判定為完全丟歪；
   - 若無護盾防禦，將**整塊甜點**轉化為翻滾碎片（`Debris`）：$v_x = \pm(70 \sim 110)\text{ px/s}$，$v_{\text{rot}} = \pm(4.5 \sim 6.5)\text{ rad/s}$，讓甜點旋轉下墜出螢幕外。
   - 延遲 $800\text{ms}$ 平滑喚出結算視窗（`GameOverModal`）。

### D. 平滑相機追焦（Smooth Camera Lerp）
- 塔高每增加一層，目標相機視野向上推移：
  $$Y_{\text{targetCamera}} = \min(0, Y_{\text{topBlock}} - H_{\text{canvas}} \times 0.62)$$
- 每一幀以線性插值緩動追隨：
  $$Y_{\text{camera}} \leftarrow Y_{\text{camera}} + (Y_{\text{targetCamera}} - Y_{\text{camera}}) \times 0.12$$

---

## 4. 遊戲機制與激勵循環

### A. 連擊（Combo）與寬度回補
- **連擊判定**：連續精準置中（$|\Delta x_{\text{center}}| \le 4.5\text{ px}$）時累計 Combo。
- **寬度回補**：當 `combo >= 2` 時，每次完美置中自動回補寬度 $+8\text{ px}$（最多補滿初始寬度 $180\text{ px}$），並噴發翡翠綠光芒粒子。

### B. 甜點狂熱模式（Sweet Fever）
- 當 `combo >= 3` 時啟動狂熱狀態：
  - 每次放置獲得 **雙倍得分（+2 分）**。
  - HUD 與計分呈現玫瑰粉紅霓虹脈衝動畫。
  - 落地聲升級為高頻輕脆的鈴鐺連擊音。

### C. 階梯稱號成就（Tier Milestones）
- 每逢 10 層（10, 20, 30, 40, 50, 60, 70, 80, 90, 100+）觸發：
  - 解鎖專屬和風稱號（「甜點見習生」、「舒芙蕾新手」、「戚風蛋糕達人」、「宇治抹茶師」、「千層蛋糕匠人」、「法式甜點大師」等）。
  - 全螢幕彩帶噴射（Confetti Ribbon Cannon）。
  - 畫面震動與榮譽金黃色橫幅。

---

## 5. 甜點道具系統規格

道具每隔 $3 \sim 5$ 層隨機出現在**下方塔頂已堆疊甜點的表面**（非擺鐘上，視野乾淨）。玩家在下墜堆疊時**完美命中（置中）**即可捕獲：

| 道具名稱 | 圖示 | 主題色 | 功能規格說明 |
| :--- | :---: | :---: | :--- |
| **金色櫻桃** (Golden Cherry) | 🍒 | `#F59E0B` | 完美疊中時立即大幅回補寬度 **+24px**。 |
| **焦糖時鐘** (Slow Clock) | ⏰ | `#06B6D4` | 擺鐘擺速降至 **65% 慢速**，維持接下來的 **5 次擺盪**。 |
| **保命護盾** (Sugar Shield) | 🛡️ | `#EA580C` | 裝備 1 次護盾。若裁切或完全丟歪，護盾粉碎並強制修復整塊寬度，免於墜亡。 |

### 道具視覺設計規範（無障礙高對比）
1. **懸浮高度**：道具垂直懸浮於蛋糕頂部上方 $44\text{ px}$ 處，完全不遮擋蛋糕表面邊界與瞄準線。
2. **實心不透明圖標底盤**：
   - 直徑 $42\text{ px}$ 的 **100% 實心不透明純白底盤（#FFFFFF）**，搭配道具主題色邊框（$2.5\text{ px}$）與柔和下沉陰影。
   - Emoji 保持 $100\%$ 原色飽和與立體感。
3. **右側雙行純文字說明（嚴格首次登場）**：
   - 僅在該道具於該局遊戲**首次生成**時，直接排列在圖標**右側**展示 $4.0\text{ 秒}$ 後平滑淡出。
   - 第 1 行：粗體名稱（道具主題色 + $4\text{ px}$ 純白描邊）。
   - 第 2 行：效果簡介（深焙咖啡色 + $3.5\text{ px}$ 純白描邊）。
   - 徹底去除背景深色色塊，確保視野完全通透。
   - 第二次或之後生成同一道具時，自動隱藏說明，維持乾淨圖標。

---

## 6. 純程式碼 Web Audio API 合成音效引擎

完全不需要外部 `.mp3` 或 `.wav` 音檔，直接利用瀏覽器 `AudioContext` 合成：

```typescript
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. 五聲音階完美落地（隨 Combo 遞增 C4->D5 音高）
  playLand(combo: number, isPerfect: boolean) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const pitch = isPerfect ? scale[Math.min(combo, scale.length - 1)] : 220;

    osc.type = isPerfect ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(pitch, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isPerfect ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // 2. 裁切音效（低沈扎實白噪音/方波模擬脆落）
  playSlice() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 3. 狂熱落地音（雙音琶音）
  playFeverLand(combo: number) {
    this.playLand(combo, true);
    setTimeout(() => this.playLand(combo + 2, true), 60);
  }

  // 4. 護盾粉碎吸收、時鐘滴答、失誤失敗聲效皆依此模式實作
}
```

---

## 7. 8 種日系甜點 Canvas 2D 幾何繪製規範

每一塊方塊均根據甜點類型（`DessertType`）進行客製化繪製：
1. **舒芙蕾鬆餅（souffle_pancake）**：金黃蛋香雙層蛋糕體、頂部黃油熔塊、淋面糖漿。
2. **草莓鮮奶油蛋糕（strawberry_shortcake）**：乳白海綿夾心、新鮮切片草莓顆粒、奶油花紋。
3. **宇治抹茶千層（matcha_millefeuille）**：深淺交替的細緻抹茶餅皮層次、頂部灑落糖粉點綴。
4. **覆盆子粉紅馬卡龍（macaron_pink）**：粉紅蛋白霜蕾絲裙邊（Pied）、飽滿玫瑰甘納許夾心。
5. **薄荷清爽馬卡龍（macaron_mint）**：粉綠外殼、純白薄荷奶油夾層。
6. **焦糖布丁（caramel_pudding）**：琥珀焦糖淋醬層、嫩黃布丁體與圓弧高光。
7. **藍莓果撻（blueberry_tart）**：烘焙焦香酥皮底、紫藍果醬與藍莓果粒點綴。
8. **生巧克力蛋糕卷（chocolate_roll）**：濃郁深棕可可蛋糕體、中央螺旋滑順奶油夾心。
9. **奶油滴落效果（Cream Drips）**：裁切時在切口側繪製自然下垂的波浪奶油滴珠。

---

## 8. 狀態機與暫停功能規格

### A. 狀態定義
```typescript
type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
```

### B. 暫停與復原行為準則
1. **60fps 迴圈時間保護**：
   暫停時維持 `requestAnimationFrame` 渲染凍結後的靜態畫布，但跳過所有物理推進邏輯；在解除暫停時，將 `lastFrameTime = performance.now()` 重新校正，徹底避免產生大於 $50\text{ms}$ 的時間突波（Time Drift）。
2. **操作攔截**：暫停期間禁用螢幕點擊與鍵盤下墜觸發。
3. **快捷鍵雙向響應**：實體鍵盤按下 `P` 鍵或 `Escape` 鍵，在 `PLAYING` 與 `PAUSED` 之間即時切換。
4. **暫停面板（PauseModal）**：提供當前高度（公尺）、層數與連擊摘要，以及「繼續遊戲」、「重新開始」、「回主選單」與「音效開關」四大完整互動選項。

---

## 9. 驗證與驗收檢查清單

- [ ] **啟動與首頁**：進入畫面可見日系標題與「開始遊戲」按鈕，桌面寬螢幕具備甜點店氛圍排版。
- [ ] **擺鐘擺動穩定性**：擺鐘左右來回循環擺盪，擺速均勻，直垂對齊虛線清晰指向塔頂。
- [ ] **精準疊合與裁切**：
  - 置中誤差 $\le 4.5\text{px}$ 觸發 Perfect 音階與金色星芒。
  - 誤差 $> 4.5\text{px}$ 準確裁下多餘部分，碎片翻滾旋轉墜落，邊緣帶有奶油痕跡。
- [ ] **失誤不滯空**：完全未疊中時，整塊方塊自然翻滾加速墜出螢幕底部，約 0.8 秒後彈出 Game Over 視窗。
- [ ] **道具互動與呈現**：
  - 道具座落於下方堆疊表面，高於表面 $44\text{px}$。
  - 100% 實心不透明純白底盤，首見時右側顯現雙行說明文字，4 秒後淡出。
  - 同一局第二次出現相同道具時，說明文字隱藏不重複干擾。
- [ ] **暫停功能**：點擊 HUD 暫停或按鍵盤 `P`/`Esc` 畫面即刻凍結，彈出 PauseModal，可無縫繼續。
- [ ] **音效健全**：五聲音階順暢演奏，靜音切換全域即時生效。
