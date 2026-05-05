export type Status = "waiting" | "playing" | "gameover";

export interface Cactus {
  x: number;
  variant: 0 | 1 | 2;
}

export interface Pterodactyl {
  x: number;
  y: number; // absolute canvas Y of top of pterodactyl
  frame: number; // wing animation frame
}

export interface Cloud {
  x: number;
  y: number;
  speedMultiplier: number;
  width: number;
  height: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface Tumbleweed {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  vy: number;
}

export interface Dust {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speedX: number;
  speedY: number;
  opacity: number;
}
