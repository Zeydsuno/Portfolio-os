interface StoredValue {
  v: number;
  t: number;
  d: number;
  sig: string;
}

function getSecret(prefix: string): string {
  if (typeof window === "undefined") return `${prefix}_ssr`;
  const w = typeof screen !== "undefined" ? Math.min(screen.width, screen.height) : 320;
  return `${prefix}_${navigator.userAgent.slice(0, 32)}${w}`;
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export interface GameStorage {
  save: (value: number, sessionStart: number) => Promise<void>;
  load: () => Promise<number>;
}

export function createGameStorage(
  storageKey: string,
  legacyKey: string | null = null,
): GameStorage {
  const secret = () => getSecret(storageKey);

  async function sign(payload: Omit<StoredValue, "sig">): Promise<string> {
    return hmacSign(secret(), JSON.stringify(payload));
  }

  const storage: GameStorage = {
    async save(value, sessionStart) {
      if (typeof window === "undefined") return;
      const payload = { v: value, t: sessionStart, d: Date.now() - sessionStart };
      const sig = await sign(payload);
      localStorage.setItem(storageKey, JSON.stringify({ ...payload, sig }));
    },

    async load() {
      if (typeof window === "undefined") return 0;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const stored: StoredValue = JSON.parse(raw);
          const expected = await sign({ v: stored.v, t: stored.t, d: stored.d });
          if (expected !== stored.sig) {
            console.warn(`[GameStorage:${storageKey}] Integrity check failed — resetting.`);
            localStorage.removeItem(storageKey);
            return 0;
          }
          return stored.v;
        }
        if (legacyKey) {
          const legacy = localStorage.getItem(legacyKey);
          if (legacy) {
            const value = parseInt(legacy, 10);
            if (!isNaN(value) && value > 0) {
              await storage.save(value, Date.now() - 60_000);
              localStorage.removeItem(legacyKey);
              return value;
            }
          }
        }
        return 0;
      } catch {
        return 0;
      }
    },
  };

  return storage;
}
