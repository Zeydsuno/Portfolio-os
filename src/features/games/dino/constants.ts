export const CANVAS_W = 560;
export const CANVAS_H = 190;
export const GROUND_Y = 150;

export const DINO_X = 60;
export const DINO_W = 52;
export const DINO_H = 64;
export const FRAME_W = 928;
export const FRAME_H = 928;

export const GRAVITY = 0.35;
export const JUMP_VY_INITIAL      = -6.5; // tap → ~60px peak, clears small cactus with room
export const JUMP_BOOST_PER_FRAME = 0.55; // > GRAVITY(0.35) → net -0.2/frame upward
export const JUMP_BOOST_MAX_FRAMES = 8;   // boost frames once hold threshold reached
export const JUMP_HOLD_THRESHOLD  = 8;   // must hold ~133ms before boost activates
export const BASE_SPEED = 3;
export const MAX_SPEED = 7.5;

export const PTERO_W = 40;
export const PTERO_H = 24;

// Heights pterodactyl can fly at (canvas Y of top)
export const PTERO_Y_OPTIONS = [
  GROUND_Y - 90, // high — need to duck
  GROUND_Y - 60, // mid  — need to duck
];

export const CACTUS_DIMS: { w: number; h: number }[] = [
  { w: 22, h: 40 },
  { w: 22, h: 48 },
  { w: 40, h: 42 },
];
