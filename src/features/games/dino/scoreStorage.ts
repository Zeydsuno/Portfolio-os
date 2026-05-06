import { createGameStorage } from "../shared/secureStorage";

const _storage = createGameStorage("dino_hs2", "dino_high_score");

export const saveHighScore = (score: number, sessionStart: number) =>
  _storage.save(score, sessionStart);

export const loadHighScore = () => _storage.load();
