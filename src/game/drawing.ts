import { Block, Debris, DessertType, FloatingText, Particle, PowerUpItem } from '../types/game';

// Color themes for items
export const ITEM_THEMES = {
  cherry: {
    color: '#F59E0B',
    emoji: '🍒',
    name: '金色櫻桃',
    desc: '疊中立即大幅回補 +24px 寬度',
  },
  clock: {
    color: '#06B6D4',
    emoji: '⏰',
    name: '焦糖時鐘',
    desc: '擺鐘 65% 慢速，維持 5 次擺盪',
  },
  shield: {
    color: '#EA580C',
    emoji: '🛡️',
    name: '保命護盾',
    desc: '防禦 1 次失誤，強制修復不墜亡',
  },
};

export const DESSERT_NAMES: Record<DessertType, string> = {
  souffle_pancake: '金黃舒芙蕾鬆餅',
  strawberry_shortcake: '草莓鮮奶油蛋糕',
  matcha_millefeuille: '宇治抹茶千層派',
  macaron_pink: '覆盆子玫瑰馬卡龍',
  macaron_mint: '薄荷清爽馬卡龍',
  caramel_pudding: '琥珀焦糖布丁',
  blueberry_tart: '藍莓香酥果撻',
  chocolate_roll: '生巧克力生乳卷',
};

// Helper for rounded rectangles
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Draw the Porcelain Base Stand
export function drawBasePlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();

  // Shadow
  ctx.shadowColor = 'rgba(40, 20, 20, 0.25)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  // Stand Body (Pure porcelain cream with gold trim)
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.6, '#F8F5F0');
  grad.addColorStop(1, '#EFEAE1');

  ctx.fillStyle = grad;
  drawRoundRect(ctx, x, y, width, height, 8);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Gold rim trim
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Decorative Pearl Beads on bottom rim
  const pearlCount = Math.max(3, Math.floor(width / 18));
  ctx.fillStyle = '#FAF9F6';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1;
  const beadY = y + height - 4;
  for (let i = 0; i < pearlCount; i++) {
    const px = x + 10 + (i / (pearlCount - 1)) * (width - 20);
    ctx.beginPath();
    ctx.arc(px, beadY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Label text on stand
  ctx.fillStyle = '#8C7853';
  ctx.font = 'bold 11px var(--font-display, sans-serif)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('洋菓子特製台座', x + width / 2, y + height / 2 - 2);

  ctx.restore();
}

// Draw individual Japanese Sweet
export function drawDessertBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  type: DessertType,
  hasCreamDrips: boolean = false
) {
  ctx.save();

  switch (type) {
    case 'souffle_pancake': {
      // Golden fluffy double pancake
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#FFE8B2');
      grad.addColorStop(0.5, '#F5C77E');
      grad.addColorStop(1, '#E6A855');

      ctx.fillStyle = grad;
      drawRoundRect(ctx, x, y, width, height, 10);
      ctx.fill();

      // Middle pancake divide line
      ctx.strokeStyle = '#C98532';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + height * 0.5);
      ctx.lineTo(x + width - 4, y + height * 0.5);
      ctx.stroke();

      // Maple syrup glaze drip on top
      ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.beginPath();
      ctx.moveTo(x + 6, y);
      ctx.quadraticCurveTo(x + width * 0.25, y + 8, x + width * 0.5, y + 4);
      ctx.quadraticCurveTo(x + width * 0.75, y + 9, x + width - 6, y);
      ctx.closePath();
      ctx.fill();

      // Melting square butter cube on top center if wide enough
      if (width > 36) {
        const bSize = 12;
        const bx = x + width / 2 - bSize / 2;
        const by = y - 4;
        ctx.fillStyle = '#FFDD55';
        ctx.strokeStyle = '#E5B800';
        ctx.lineWidth = 1;
        drawRoundRect(ctx, bx, by, bSize, bSize, 3);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'strawberry_shortcake': {
      // Cream sponge sandwich
      // Sponge base
      ctx.fillStyle = '#FCE7C8';
      drawRoundRect(ctx, x, y, width, height, 6);
      ctx.fill();

      // Pure whipped cream top half
      ctx.fillStyle = '#FFFDF7';
      ctx.beginPath();
      ctx.rect(x, y, width, height * 0.45);
      ctx.fill();

      // Strawberry jelly middle strip
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(x + 2, y + height * 0.45, width - 4, 3);

      // Fresh strawberries on top
      if (width > 24) {
        const berryCount = Math.max(1, Math.min(5, Math.floor(width / 32)));
        for (let i = 0; i < berryCount; i++) {
          const sx = x + (i + 0.5) * (width / berryCount);
          const sy = y - 3;
          // Red strawberry
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();

          // Green leaf crown
          ctx.fillStyle = '#16A34A';
          ctx.beginPath();
          ctx.arc(sx, sy - 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'matcha_millefeuille': {
      // Uji matcha multi-layer crepes
      const layerH = height / 5;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#426848' : '#6A994E';
        ctx.fillRect(x, y + i * layerH, width, layerH);

        // Thin cream separator
        if (i > 0) {
          ctx.fillStyle = 'rgba(255, 255, 240, 0.7)';
          ctx.fillRect(x, y + i * layerH - 1, width, 1.5);
        }
      }

      // Powdered sugar dust on top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(x, y, width, 2);
      break;
    }

    case 'macaron_pink': {
      // Raspberry pink macaron with ruffled pied
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#FDA4AF');
      grad.addColorStop(0.4, '#FB7185');
      grad.addColorStop(0.5, '#E11D48'); // ganache filling
      grad.addColorStop(0.6, '#FB7185');
      grad.addColorStop(1, '#F43F5E');

      ctx.fillStyle = grad;
      drawRoundRect(ctx, x, y, width, height, 12);
      ctx.fill();

      // Ganache center line
      ctx.fillStyle = '#BE123C';
      ctx.fillRect(x + 4, y + height * 0.45, width - 8, height * 0.12);

      // Ruffled pied texture dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x + 6, y + 3, width - 12, 2);
      break;
    }

    case 'macaron_mint': {
      // Refreshing mint macaron
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#A7F3D0');
      grad.addColorStop(0.45, '#6EE7B7');
      grad.addColorStop(0.5, '#F0FDFA'); // mint cream filling
      grad.addColorStop(0.55, '#6EE7B7');
      grad.addColorStop(1, '#34D399');

      ctx.fillStyle = grad;
      drawRoundRect(ctx, x, y, width, height, 12);
      ctx.fill();

      // White mint cream center
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 4, y + height * 0.44, width - 8, height * 0.14);
      break;
    }

    case 'caramel_pudding': {
      // Tender flan custard body
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#92400E'); // top caramel sauce
      grad.addColorStop(0.3, '#FBBF24'); // custard body
      grad.addColorStop(1, '#F59E0B');

      ctx.fillStyle = grad;
      drawRoundRect(ctx, x, y, width, height, 8);
      ctx.fill();

      // Glossy caramel sauce pooling on top
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height * 0.28);
      ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.38, x, y + height * 0.28);
      ctx.closePath();
      ctx.fill();

      // High specular gloss arc
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x + width * 0.4, y + 4, Math.min(18, width * 0.25), 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'blueberry_tart': {
      // Baked crust bottom
      ctx.fillStyle = '#B45309';
      drawRoundRect(ctx, x, y, width, height, 6);
      ctx.fill();

      // Purple wild blueberry jelly filling
      ctx.fillStyle = '#581C87';
      ctx.fillRect(x + 2, y + 2, width - 4, height * 0.65);

      // Fresh blueberries on top
      if (width > 20) {
        const count = Math.max(1, Math.min(6, Math.floor(width / 26)));
        for (let i = 0; i < count; i++) {
          const bx = x + (i + 0.5) * (width / count);
          const by = y + 3;
          ctx.fillStyle = '#3B0764';
          ctx.beginPath();
          ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#A855F7';
          ctx.beginPath();
          ctx.arc(bx - 1, by - 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'chocolate_roll': {
      // Dark chocolate roll cake
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#451A03');
      grad.addColorStop(0.5, '#78350F');
      grad.addColorStop(1, '#3B1705');

      ctx.fillStyle = grad;
      drawRoundRect(ctx, x, y, width, height, 10);
      ctx.fill();

      // Cream spiral swirl inside
      ctx.strokeStyle = '#FFFBEB';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.ellipse(cx, cy, Math.min(width * 0.35, 22), height * 0.28, 0, 0, Math.PI * 1.6);
      ctx.stroke();

      // Cocoa powder top dusting
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x + 4, y + 2, width - 8, 2);
      break;
    }
  }

  // Draw natural cream drips if trimmed or perfect
  if (hasCreamDrips && width > 16) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    // Drip on right edge
    ctx.beginPath();
    ctx.arc(x + width - 3, y + height + 3, 3, 0, Math.PI * 2);
    ctx.fill();
    // Drip on left edge
    ctx.beginPath();
    ctx.arc(x + 3, y + height + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Falling Tumbling Debris
export function drawDebris(ctx: CanvasRenderingContext2D, debris: Debris) {
  ctx.save();
  ctx.translate(debris.x + debris.width / 2, debris.y + debris.height / 2);
  ctx.rotate(debris.rotation);
  ctx.globalAlpha = Math.max(0, Math.min(1, debris.opacity));

  drawDessertBlock(ctx, -debris.width / 2, -debris.height / 2, debris.width, debris.height, debris.dessertType, true);

  ctx.restore();
}

// Draw Mechanical Pendulum Wire & Ornament
export function drawPendulumArm(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  blockCenterX: number,
  blockTopY: number,
  targetTopY: number
) {
  ctx.save();

  // 1. Dotted Aim Line pointing down towards tower surface
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(blockCenterX, blockTopY + 28);
  ctx.lineTo(blockCenterX, targetTopY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Pendulum Wire (Polished Golden String)
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(blockCenterX, blockTopY);
  ctx.stroke();

  // 3. Top Anchor Pin / Mechanical Gear
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Clasp holding the sweet
  ctx.fillStyle = '#D97706';
  ctx.fillRect(blockCenterX - 5, blockTopY - 6, 10, 6);

  ctx.restore();
}

// Draw Power-Up Item on Tower Surface (Strictly meets Section 5 specifications)
export function drawPowerUpItem(
  ctx: CanvasRenderingContext2D,
  item: PowerUpItem,
  currentTime: number
) {
  if (item.collected) return;
  const config = ITEM_THEMES[item.type];
  if (!config) return;

  ctx.save();

  // Floating gentle bobbing animation
  const bob = Math.sin(currentTime * 0.005) * 4;
  const drawX = item.x;
  const drawY = item.y + bob;

  // 100% Solid Pure White circular plate (42px diameter)
  const radius = 21;

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // 2.5px Themed colored border
  ctx.strokeStyle = config.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Emoji icon in center
  ctx.font = '22px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.emoji, drawX, drawY + 1);

  // First Encounter Tooltip (Right side, fades out after 4.0s)
  if (item.firstEncounter) {
    const elapsed = (currentTime - item.spawnTime) / 1000;
    if (elapsed < 4.0) {
      let alpha = 1.0;
      if (elapsed > 3.0) {
        alpha = 1.0 - (elapsed - 3.0) / 1.0;
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const textStartX = drawX + radius + 12;

      // Line 1: Bold Name (Theme color + 4px white outline)
      ctx.font = 'bold 13px var(--font-display, sans-serif)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeText(config.name, textStartX, drawY - 2);
      ctx.fillStyle = config.color;
      ctx.fillText(config.name, textStartX, drawY - 2);

      // Line 2: Effect description (Dark roast coffee + 3.5px white outline)
      ctx.font = '500 11px var(--font-body, sans-serif)';
      ctx.textBaseline = 'top';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.strokeText(config.desc, textStartX, drawY + 2);
      ctx.fillStyle = '#38241B';
      ctx.fillText(config.desc, textStartX, drawY + 2);
    }
  }

  ctx.restore();
}

// Draw Floating Text (e.g. PERFECT! +8px, FEVER!, etc.)
export function drawFloatingText(ctx: CanvasRenderingContext2D, text: FloatingText) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, text.alpha));
  ctx.font = `${text.fontWeight || 'bold'} ${text.fontSize}px var(--font-display, sans-serif)`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // White outline
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeText(text.text, text.x, text.y);

  // Fill
  ctx.fillStyle = text.color;
  ctx.fillText(text.text, text.x, text.y);
  ctx.restore();
}

// Draw Particles & Confetti Ribbons
export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

  if (p.isRibbon && p.width && p.height) {
    ctx.translate(p.x, p.y);
    if (p.rotation !== undefined) {
      ctx.rotate(p.rotation);
    }
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
  } else {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
