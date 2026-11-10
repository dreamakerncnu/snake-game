export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type DessertType =
  | 'souffle_pancake'
  | 'strawberry_shortcake'
  | 'matcha_millefeuille'
  | 'macaron_pink'
  | 'macaron_mint'
  | 'caramel_pudding'
  | 'blueberry_tart'
  | 'chocolate_roll';

export type ItemType = 'cherry' | 'clock' | 'shield';

export interface PowerUpItem {
  id: string;
  type: ItemType;
  x: number;
  y: number; // world coordinates
  layerIndex: number;
  collected: boolean;
  spawnTime: number; // timestamp when spawned
  firstEncounter: boolean;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dessertType: DessertType;
  layer: number;
  isBase?: boolean;
}

export interface Debris {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  dessertType: DessertType;
  opacity: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  isRibbon?: boolean;
  width?: number;
  height?: number;
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  fontSize: number;
  fontWeight?: string;
}

export interface GameStats {
  score: number; // layers stacked
  heightMeters: number;
  combo: number;
  maxCombo: number;
  bestScore: number;
  bestCombo: number;
  feverActive: boolean;
  hasShield: boolean;
  clockSwingsRemaining: number;
  currentTitle: string;
}

export interface MilestoneTier {
  layers: number;
  title: string;
  unlockedMsg: string;
}
