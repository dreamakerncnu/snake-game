import React, { useCallback, useEffect, useRef } from 'react';
import { SoundManager } from '../audio/SoundManager';
import {
  Block,
  Debris,
  DessertType,
  FloatingText,
  GameState,
  GameStats,
  ItemType,
  Particle,
  PowerUpItem,
} from '../types/game';
import {
  DESSERT_NAMES,
  drawBasePlate,
  drawDebris,
  drawDessertBlock,
  drawFloatingText,
  drawParticle,
  drawPendulumArm,
  drawPowerUpItem,
} from './drawing';

const DESSERT_CYCLE: DessertType[] = [
  'souffle_pancake',
  'strawberry_shortcake',
  'matcha_millefeuille',
  'macaron_pink',
  'macaron_mint',
  'caramel_pudding',
  'blueberry_tart',
  'chocolate_roll',
];

const MILESTONES: Record<number, string> = {
  10: '甜點見習生',
  20: '舒芙蕾新手',
  30: '戚風蛋糕達人',
  40: '宇治抹茶師',
  50: '千層蛋糕匠人',
  60: '法式甜點大師',
  70: '皇家甜點名家',
  80: '米其林三星甜點神',
  90: '傳奇洋菓子之神',
};

interface GameCanvasProps {
  gameState: GameState;
  onUpdateStats: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
  onMilestoneUnlock: (title: string, layer: number) => void;
  bestScore: number;
  bestCombo: number;
}

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 880;
const BLOCK_HEIGHT = 36;
const INITIAL_BLOCK_WIDTH = 180;
const PENDULUM_L = 160;
const MAX_ANGLE = 0.65; // ~37 degrees
const BASE_OMEGA = 2.5; // rad/s
const SLOW_OMEGA = 1.625; // 65% slow
const GRAVITY = 1600; // px/s^2
const INITIAL_DROP_VY = 180; // px/s

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onUpdateStats,
  onGameOver,
  onMilestoneUnlock,
  bestScore,
  bestCombo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Simulation State (Isolated from React re-renders)
  const stateRef = useRef({
    score: 0,
    combo: 0,
    maxCombo: 0,
    feverActive: false,
    hasShield: false,
    clockSwingsRemaining: 0,
    currentTitle: '初入廚房',

    // Camera
    cameraY: 0,
    targetCameraY: 0,

    // Pendulum & Current Block
    pendulumTime: 0,
    isDropping: false,
    droppingY: 0,
    droppingVy: 0,
    currentBlockX: 0,
    currentBlockWidth: INITIAL_BLOCK_WIDTH,
    currentDessertType: DESSERT_CYCLE[0],

    // Stacks & Debris
    blocks: [] as Block[],
    debrisList: [] as Debris[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    items: [] as PowerUpItem[],
    encounteredItems: new Set<ItemType>(),

    // Screen Shake
    shakeTime: 0,
    shakeIntensity: 0,

    // Timing
    lastFrameTime: 0,
    gameOverTriggered: false,
    gameOverTimer: null as ReturnType<typeof setTimeout> | null,

    // Spawning interval
    nextItemAtLayer: 3,
  });

  const sound = SoundManager.getInstance();

  // Reset or initialize game
  const resetGame = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOverTimer) {
      clearTimeout(s.gameOverTimer);
      s.gameOverTimer = null;
    }

    s.score = 0;
    s.combo = 0;
    s.maxCombo = 0;
    s.feverActive = false;
    s.hasShield = false;
    s.clockSwingsRemaining = 0;
    s.currentTitle = '初入廚房';

    s.cameraY = 0;
    s.targetCameraY = 0;

    s.pendulumTime = 0;
    s.isDropping = false;
    s.droppingY = 0;
    s.droppingVy = 0;
    s.currentBlockWidth = INITIAL_BLOCK_WIDTH;
    s.currentDessertType = DESSERT_CYCLE[1];

    // Initial base porcelain plate + first starting dessert block
    const basePlateY = 740;
    const firstBlockY = basePlateY - BLOCK_HEIGHT;

    s.blocks = [
      {
        id: 'base-plate',
        x: (CANVAS_WIDTH - 220) / 2,
        y: basePlateY,
        width: 220,
        height: 44,
        dessertType: 'souffle_pancake',
        layer: 0,
        isBase: true,
      },
      {
        id: 'layer-1',
        x: (CANVAS_WIDTH - INITIAL_BLOCK_WIDTH) / 2,
        y: firstBlockY,
        width: INITIAL_BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        dessertType: DESSERT_CYCLE[0],
        layer: 1,
      },
    ];

    s.debrisList = [];
    s.particles = [];
    s.floatingTexts = [];
    s.items = [];
    s.encounteredItems.clear();

    s.shakeTime = 0;
    s.shakeIntensity = 0;
    s.gameOverTriggered = false;
    s.nextItemAtLayer = 3 + Math.floor(Math.random() * 3);

    onUpdateStats({
      score: 1,
      heightMeters: 0.12,
      combo: 0,
      maxCombo: 0,
      bestScore,
      bestCombo,
      feverActive: false,
      hasShield: false,
      clockSwingsRemaining: 0,
      currentTitle: '初入廚房',
    });
  }, [bestScore, bestCombo, onUpdateStats]);

  // Drop Action Handler
  const handleDrop = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== 'PLAYING' || s.isDropping || s.gameOverTriggered) return;

    sound.init();
    s.isDropping = true;
    s.droppingVy = INITIAL_DROP_VY;

    // If clock swings active, decrement
    if (s.clockSwingsRemaining > 0) {
      s.clockSwingsRemaining -= 1;
    }
  }, [gameState, sound]);

  // Add Confetti Ribbon Explosion
  const triggerConfettiRibbons = useCallback((cx: number, cy: number) => {
    const s = stateRef.current;
    const colors = ['#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899', '#EAB308'];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.4;
      const speed = 180 + Math.random() * 260;
      s.particles.push({
        id: `ribbon-${Date.now()}-${i}`,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 150,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0,
        alpha: 1,
        maxLife: 2.2,
        life: 0,
        isRibbon: true,
        width: 12 + Math.random() * 10,
        height: 5 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 16,
      });
    }
  }, []);

  // Add Golden/Emerald Spark Particles
  const triggerSparks = useCallback((cx: number, cy: number, color: string, count = 24) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 150;
      s.particles.push({
        id: `spark-${Date.now()}-${i}`,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        color,
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        maxLife: 0.8,
        life: 0,
      });
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDrop]);

  // Handle Game State Transitions (e.g. restart on PLAYING)
  useEffect(() => {
    if (gameState === 'PLAYING' && stateRef.current.blocks.length === 0) {
      resetGame();
    }
  }, [gameState, resetGame]);

  // Main 60fps Physics & Render Loop
  useEffect(() => {
    let animId: number;

    const render = (timestamp: number) => {
      const s = stateRef.current;

      if (!s.lastFrameTime) {
        s.lastFrameTime = timestamp;
      }

      // Safe delta time clamped to 50ms (avoids massive jumps after pause/blur)
      const rawDt = (timestamp - s.lastFrameTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      s.lastFrameTime = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // If paused, maintain static rendering without advancing physics
      const isPaused = gameState === 'PAUSED';

      // -------------------------------------------------------------
      // 1. PHYSICS UPDATE (Only when PLAYING)
      // -------------------------------------------------------------
      if (gameState === 'PLAYING' && !isPaused) {
        // Screen Shake decay
        if (s.shakeIntensity > 0) {
          s.shakeTime += dt;
          s.shakeIntensity = Math.max(0, s.shakeIntensity - dt * 25);
        }

        // Camera Lerp
        s.cameraY += (s.targetCameraY - s.cameraY) * 0.12;

        // Current target block (uppermost block stacked)
        const targetBlock = s.blocks[s.blocks.length - 1];
        const targetTopY = targetBlock ? targetBlock.y : 700;

        // Pendulum Anchor Coordinates
        const pivotX = CANVAS_WIDTH / 2;
        const pivotY = s.cameraY + 50;

        // Pendulum Harmonic Frequency
        const currentOmega = s.clockSwingsRemaining > 0 ? SLOW_OMEGA : BASE_OMEGA;

        if (!s.isDropping) {
          s.pendulumTime += dt;
          const theta = MAX_ANGLE * Math.sin(currentOmega * s.pendulumTime);
          s.currentBlockX = pivotX + PENDULUM_L * Math.sin(theta) - s.currentBlockWidth / 2;
          s.droppingY = pivotY + PENDULUM_L * Math.cos(theta) - BLOCK_HEIGHT / 2;
        } else {
          // Falling under gravity
          s.droppingVy += GRAVITY * dt;
          s.droppingY += s.droppingVy * dt;

          // Check for collision with target top surface
          if (s.droppingY + BLOCK_HEIGHT >= targetTopY) {
            s.isDropping = false;
            const dropBottomY = targetTopY;
            const landingY = dropBottomY - BLOCK_HEIGHT;

            const dropX = s.currentBlockX;
            const dropW = s.currentBlockWidth;
            const targetX = targetBlock.x;
            const targetW = targetBlock.width;

            // Horizontal overlap
            const overlapLeft = Math.max(dropX, targetX);
            const overlapRight = Math.min(dropX + dropW, targetX + targetW);
            const overlapWidth = overlapRight - overlapLeft;

            const dropCenterX = dropX + dropW / 2;
            const targetCenterX = targetX + targetW / 2;
            const centerDelta = Math.abs(dropCenterX - targetCenterX);

            // =========================================================
            // SCENARIO A: COMPLETE MISS (W_overlap <= 0)
            // =========================================================
            if (overlapWidth <= 0) {
              if (s.hasShield) {
                // SUGAR SHIELD SAVES THE RUN!
                s.hasShield = false;
                sound.playShieldShatter();
                triggerSparks(dropCenterX, landingY, '#EA580C', 35);
                s.floatingTexts.push({
                  id: `shield-save-${Date.now()}`,
                  text: '🛡️ 護盾抵消失誤！',
                  x: CANVAS_WIDTH / 2,
                  y: landingY - 20,
                  vy: -45,
                  alpha: 1,
                  color: '#EA580C',
                  fontSize: 18,
                });

                // Force safe re-alignment on top of target
                const newBlock: Block = {
                  id: `block-${Date.now()}`,
                  x: targetX,
                  y: landingY,
                  width: targetW,
                  height: BLOCK_HEIGHT,
                  dessertType: s.currentDessertType,
                  layer: s.blocks.length,
                };
                s.blocks.push(newBlock);
                s.score += 1;
                handlePostStack(newBlock);
              } else {
                // TUMBLING FALL & GAME OVER
                const isRight = dropX > targetX;
                s.debrisList.push({
                  id: `miss-fall-${Date.now()}`,
                  x: dropX,
                  y: landingY,
                  width: dropW,
                  height: BLOCK_HEIGHT,
                  vx: (isRight ? 1 : -1) * (80 + Math.random() * 30),
                  vy: -80,
                  rotation: 0,
                  vRot: (isRight ? 1 : -1) * (5 + Math.random() * 2),
                  dessertType: s.currentDessertType,
                  opacity: 1,
                });

                sound.playGameOver();
                s.gameOverTriggered = true;

                s.gameOverTimer = setTimeout(() => {
                  onGameOver({
                    score: s.score,
                    heightMeters: Number((s.score * 0.12).toFixed(2)),
                    combo: s.combo,
                    maxCombo: s.maxCombo,
                    bestScore: Math.max(bestScore, s.score),
                    bestCombo: Math.max(bestCombo, s.maxCombo),
                    feverActive: false,
                    hasShield: false,
                    clockSwingsRemaining: 0,
                    currentTitle: s.currentTitle,
                  });
                }, 800);
              }
            }
            // =========================================================
            // SCENARIO B: HIT OR PERFECT STACK
            // =========================================================
            else {
              const isPerfect = centerDelta <= 4.5;

              if (isPerfect) {
                // PERFECT STACK!
                s.combo += 1;
                s.maxCombo = Math.max(s.maxCombo, s.combo);
                s.feverActive = s.combo >= 3;

                // Width restoration if combo >= 2
                let restoredWidth = targetW;
                if (s.combo >= 2 && targetW < INITIAL_BLOCK_WIDTH) {
                  restoredWidth = Math.min(INITIAL_BLOCK_WIDTH, targetW + 8);
                  triggerSparks(targetCenterX, landingY, '#10B981', 18);
                  s.floatingTexts.push({
                    id: `restore-${Date.now()}`,
                    text: '+8px 寬度回補!',
                    x: targetCenterX,
                    y: landingY - 32,
                    vy: -40,
                    alpha: 1,
                    color: '#10B981',
                    fontSize: 14,
                  });
                }

                // Perfect sparks
                triggerSparks(targetCenterX, landingY, '#F59E0B', 22);

                if (s.feverActive) {
                  sound.playFeverLand(s.combo);
                  s.score += 2; // double points during fever
                  s.floatingTexts.push({
                    id: `fever-${Date.now()}`,
                    text: `FEVER! x2 (${s.combo} COMBO)`,
                    x: targetCenterX,
                    y: landingY - 14,
                    vy: -55,
                    alpha: 1,
                    color: '#F43F5E',
                    fontSize: 17,
                  });
                } else {
                  sound.playLand(s.combo, true);
                  s.score += 1;
                  s.floatingTexts.push({
                    id: `perfect-${Date.now()}`,
                    text: `PERFECT! ${s.combo > 1 ? `${s.combo} COMBO` : ''}`,
                    x: targetCenterX,
                    y: landingY - 14,
                    vy: -50,
                    alpha: 1,
                    color: '#F59E0B',
                    fontSize: 16,
                  });
                }

                const newBlock: Block = {
                  id: `block-${Date.now()}`,
                  x: targetCenterX - restoredWidth / 2,
                  y: landingY,
                  width: restoredWidth,
                  height: BLOCK_HEIGHT,
                  dessertType: s.currentDessertType,
                  layer: s.blocks.length,
                };
                s.currentBlockWidth = restoredWidth;
                s.blocks.push(newBlock);
                handlePostStack(newBlock);
              } else {
                // SLICED DROP
                if (s.hasShield) {
                  // Shield protects against slice!
                  s.hasShield = false;
                  sound.playShieldShatter();
                  triggerSparks(targetCenterX, landingY, '#EA580C', 26);
                  s.floatingTexts.push({
                    id: `shield-absorb-${Date.now()}`,
                    text: '🛡️ 護盾吸收裁切！完整保留',
                    x: CANVAS_WIDTH / 2,
                    y: landingY - 20,
                    vy: -45,
                    alpha: 1,
                    color: '#EA580C',
                    fontSize: 15,
                  });

                  const newBlock: Block = {
                    id: `block-${Date.now()}`,
                    x: targetX,
                    y: landingY,
                    width: targetW,
                    height: BLOCK_HEIGHT,
                    dessertType: s.currentDessertType,
                    layer: s.blocks.length,
                  };
                  s.blocks.push(newBlock);
                  s.score += 1;
                  handlePostStack(newBlock);
                } else {
                  // Normal slice
                  sound.playSlice();
                  s.combo = 0;
                  s.feverActive = false;

                  const isRightSlice = dropX > targetX;
                  const debrisWidth = dropW - overlapWidth;

                  // Create sliced debris
                  if (debrisWidth > 1) {
                    const debrisX = isRightSlice ? overlapRight : dropX;
                    const vx = (isRightSlice ? 1 : -1) * (130 + Math.random() * 30);
                    const vRot = (isRightSlice ? 1 : -1) * (8 + Math.random() * 3);

                    s.debrisList.push({
                      id: `debris-${Date.now()}`,
                      x: debrisX,
                      y: landingY,
                      width: debrisWidth,
                      height: BLOCK_HEIGHT,
                      vx,
                      vy: -50,
                      rotation: 0,
                      vRot,
                      dessertType: s.currentDessertType,
                      opacity: 1,
                    });
                  }

                  s.score += 1;
                  s.currentBlockWidth = overlapWidth;

                  const newBlock: Block = {
                    id: `block-${Date.now()}`,
                    x: overlapLeft,
                    y: landingY,
                    width: overlapWidth,
                    height: BLOCK_HEIGHT,
                    dessertType: s.currentDessertType,
                    layer: s.blocks.length,
                  };
                  s.blocks.push(newBlock);

                  s.floatingTexts.push({
                    id: `slice-${Date.now()}`,
                    text: 'SLICE',
                    x: overlapLeft + overlapWidth / 2,
                    y: landingY - 10,
                    vy: -35,
                    alpha: 1,
                    color: '#94A3B8',
                    fontSize: 13,
                  });

                  handlePostStack(newBlock);
                }
              }
            }
          }
        }

        // Subroutine: Post-stack item collection, camera target, and milestone checking
        function handlePostStack(newBlock: Block) {
          // 1. Check Power-Up collection
          const activeItem = s.items.find((it) => !it.collected && it.layerIndex === newBlock.layer - 1);
          if (activeItem) {
            activeItem.collected = true;
            sound.playItemCollect(activeItem.type);

            if (activeItem.type === 'cherry') {
              const boosted = Math.min(INITIAL_BLOCK_WIDTH, newBlock.width + 24);
              newBlock.width = boosted;
              s.currentBlockWidth = boosted;
              triggerSparks(newBlock.x + newBlock.width / 2, newBlock.y, '#F59E0B', 30);
              s.floatingTexts.push({
                id: `cherry-boost-${Date.now()}`,
                text: '🍒 金色櫻桃 +24px 寬度!',
                x: CANVAS_WIDTH / 2,
                y: newBlock.y - 25,
                vy: -50,
                alpha: 1,
                color: '#F59E0B',
                fontSize: 16,
              });
            } else if (activeItem.type === 'clock') {
              s.clockSwingsRemaining = 5;
              triggerSparks(newBlock.x + newBlock.width / 2, newBlock.y, '#06B6D4', 30);
              s.floatingTexts.push({
                id: `clock-boost-${Date.now()}`,
                text: '⏰ 焦糖時鐘 65% 慢速 (5次)!',
                x: CANVAS_WIDTH / 2,
                y: newBlock.y - 25,
                vy: -50,
                alpha: 1,
                color: '#06B6D4',
                fontSize: 16,
              });
            } else if (activeItem.type === 'shield') {
              s.hasShield = true;
              triggerSparks(newBlock.x + newBlock.width / 2, newBlock.y, '#EA580C', 30);
              s.floatingTexts.push({
                id: `shield-boost-${Date.now()}`,
                text: '🛡️ 獲得保命護盾 1 次！',
                x: CANVAS_WIDTH / 2,
                y: newBlock.y - 25,
                vy: -50,
                alpha: 1,
                color: '#EA580C',
                fontSize: 16,
              });
            }
          }

          // 2. Next dessert cycle
          const nextIndex = (newBlock.layer + 1) % DESSERT_CYCLE.length;
          s.currentDessertType = DESSERT_CYCLE[nextIndex];

          // 3. Camera Smooth Lerp target
          s.targetCameraY = Math.min(0, newBlock.y - CANVAS_HEIGHT * 0.62);

          // 4. Milestone Celebration (every 10 layers)
          if (newBlock.layer > 0 && newBlock.layer % 10 === 0) {
            const milestoneTitle = MILESTONES[newBlock.layer] || '傳奇洋菓子之神';
            s.currentTitle = milestoneTitle;
            sound.playMilestone();
            s.shakeIntensity = 12; // screen shake
            triggerConfettiRibbons(CANVAS_WIDTH / 2, newBlock.y);
            onMilestoneUnlock(milestoneTitle, newBlock.layer);
          }

          // 5. Spawn new Power-Up on top surface
          if (newBlock.layer >= s.nextItemAtLayer) {
            const types: ItemType[] = ['cherry', 'clock', 'shield'];
            const chosenType = types[Math.floor(Math.random() * types.length)];
            const isFirst = !s.encounteredItems.has(chosenType);
            if (isFirst) {
              s.encounteredItems.add(chosenType);
            }

            s.items.push({
              id: `item-${Date.now()}`,
              type: chosenType,
              x: newBlock.x + newBlock.width / 2,
              y: newBlock.y - 44, // 44px above cake top surface
              layerIndex: newBlock.layer,
              collected: false,
              spawnTime: timestamp,
              firstEncounter: isFirst,
            });

            s.nextItemAtLayer = newBlock.layer + 3 + Math.floor(Math.random() * 3);
          }

          // 6. Sync HUD Stats
          onUpdateStats({
            score: s.score,
            heightMeters: Number((s.score * 0.12).toFixed(2)),
            combo: s.combo,
            maxCombo: s.maxCombo,
            bestScore: Math.max(bestScore, s.score),
            bestCombo: Math.max(bestCombo, s.maxCombo),
            feverActive: s.feverActive,
            hasShield: s.hasShield,
            clockSwingsRemaining: s.clockSwingsRemaining,
            currentTitle: s.currentTitle,
          });
        }

        // Update Debris
        for (let i = s.debrisList.length - 1; i >= 0; i--) {
          const deb = s.debrisList[i];
          deb.vy += GRAVITY * dt;
          deb.x += deb.vx * dt;
          deb.y += deb.vy * dt;
          deb.rotation += deb.vRot * dt;

          if (deb.y > s.cameraY + CANVAS_HEIGHT + 100) {
            s.debrisList.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.isRibbon) {
            p.vy += 300 * dt; // gravity for ribbon
            if (p.rotation !== undefined && p.vRot !== undefined) {
              p.rotation += p.vRot * dt;
            }
          }
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.alpha -= dt * 0.9;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }
      }

      // -------------------------------------------------------------
      // 2. CANVAS RENDERING
      // -------------------------------------------------------------
      ctx.save();

      // Screen Shake offset
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (s.shakeIntensity > 0) {
        shakeOffsetX = (Math.random() - 0.5) * s.shakeIntensity;
        shakeOffsetY = (Math.random() - 0.5) * s.shakeIntensity;
      }

      // Background Gradient based on tower height
      const heightFactor = Math.min(1, s.score / 60);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      if (heightFactor < 0.3) {
        // Morning Warm Bakery (Warm Cream to Pastel Pink)
        bgGrad.addColorStop(0, '#FFF5EB');
        bgGrad.addColorStop(1, '#FFE4E6');
      } else if (heightFactor < 0.7) {
        // Sunset Patisserie (Pastel Peach to Lavender Lilac)
        bgGrad.addColorStop(0, '#FED7AA');
        bgGrad.addColorStop(0.5, '#FBCFE8');
        bgGrad.addColorStop(1, '#DDD6FE');
      } else {
        // Royal Starry Night Dessert (Indigo to Deep Plum)
        bgGrad.addColorStop(0, '#312E81');
        bgGrad.addColorStop(0.5, '#4C1D95');
        bgGrad.addColorStop(1, '#701A75');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle atmospheric confection sparkles in background
      ctx.fillStyle = heightFactor > 0.7 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(244, 63, 94, 0.1)';
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 47 + timestamp * 0.02) % CANVAS_WIDTH);
        const sy = ((i * 83 + timestamp * 0.015) % CANVAS_HEIGHT);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Apply Camera Viewport Transform
      ctx.translate(shakeOffsetX, -s.cameraY + shakeOffsetY);

      // A. Draw Stacked Blocks
      for (const block of s.blocks) {
        if (block.isBase) {
          drawBasePlate(ctx, block.x, block.y, block.width, block.height);
        } else {
          drawDessertBlock(ctx, block.x, block.y, block.width, block.height, block.dessertType);
        }
      }

      // B. Draw Power-Up Items on Tower Surface
      for (const item of s.items) {
        drawPowerUpItem(ctx, item, timestamp);
      }

      // C. Draw Tumbling Debris
      for (const deb of s.debrisList) {
        drawDebris(ctx, deb);
      }

      // D. Draw Pendulum Arm & Active Dropping/Swinging Block
      const pivotX = CANVAS_WIDTH / 2;
      const pivotY = s.cameraY + 50;
      const topBlock = s.blocks[s.blocks.length - 1];
      const targetSurfaceY = topBlock ? topBlock.y : 700;

      if (!s.gameOverTriggered) {
        drawPendulumArm(
          ctx,
          pivotX,
          pivotY,
          s.currentBlockX + s.currentBlockWidth / 2,
          s.droppingY,
          targetSurfaceY
        );

        drawDessertBlock(
          ctx,
          s.currentBlockX,
          s.droppingY,
          s.currentBlockWidth,
          BLOCK_HEIGHT,
          s.currentDessertType
        );
      }

      // E. Draw Particles & Confetti Ribbons
      for (const p of s.particles) {
        drawParticle(ctx, p);
      }

      // F. Draw Floating Texts
      for (const ft of s.floatingTexts) {
        drawFloatingText(ctx, ft);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, bestScore, bestCombo, onGameOver, onMilestoneUnlock, onUpdateStats, sound, triggerConfettiRibbons, triggerSparks]);

  return (
    <div
      className="relative w-full h-full cursor-pointer select-none overflow-hidden touch-none"
      onClick={handleDrop}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block object-contain"
        style={{
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
        }}
      />
    </div>
  );
};
