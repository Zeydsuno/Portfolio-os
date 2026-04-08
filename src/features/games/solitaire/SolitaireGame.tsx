"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const SUIT_SYM: Record<Suit, string> = { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" };
const RED: Set<Suit> = new Set(["hearts", "diamonds"]);
const VAL_LABEL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const CARD_W = 62;
const CARD_H = 86;
const PILE_GAP = 6;
const FACE_DOWN_OFFSET = 12;
const FACE_UP_OFFSET = 18;

interface Card { suit: Suit; value: number; faceUp: boolean; }

type From =
  | { zone: "waste" }
  | { zone: "foundation"; idx: number }
  | { zone: "tableau"; col: number; cardIdx: number };

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: [Card[], Card[], Card[], Card[]];
  tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]];
  moves: number;
  won: boolean;
}

interface DragState {
  cards: Card[];
  from: From;
  ghostX: number;
  ghostY: number;
  offsetX: number;
  offsetY: number;
}

// ─── Game logic ──────────────────────────────────────────────────────────────

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (let v = 1; v <= 13; v++) deck.push({ suit, value: v, faceUp: false });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initGame(): GameState {
  const deck = shuffle(buildDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push({ ...deck[idx++], faceUp: row === col });
    }
  }
  return {
    stock: deck.slice(idx).map(c => ({ ...c, faceUp: false })),
    waste: [],
    foundations: [[], [], [], []],
    tableau: tableau as GameState["tableau"],
    moves: 0,
    won: false,
  };
}

function canPlaceFoundation(card: Card, found: Card[]): boolean {
  if (found.length === 0) return card.value === 1;
  const top = found[found.length - 1];
  return top.suit === card.suit && card.value === top.value + 1;
}

function canPlaceTableau(card: Card, col: Card[]): boolean {
  if (col.length === 0) return card.value === 13;
  const top = col[col.length - 1];
  return top.faceUp && RED.has(card.suit) !== RED.has(top.suit) && card.value === top.value - 1;
}

function checkWon(foundations: GameState["foundations"]): boolean {
  return foundations.every(f => f.length === 13);
}

function flipTopCard(col: Card[]): Card[] {
  if (col.length === 0 || col[col.length - 1].faceUp) return col;
  return [...col.slice(0, -1), { ...col[col.length - 1], faceUp: true }];
}

// ─── State mutations (pure) ───────────────────────────────────────────────────

function removeFromSource(state: GameState, from: From, count: number): GameState {
  if (from.zone === "waste") {
    return { ...state, waste: state.waste.slice(0, -1) };
  }
  if (from.zone === "foundation") {
    const newF = state.foundations.map((f, i) =>
      i === from.idx ? f.slice(0, -1) : f
    ) as GameState["foundations"];
    return { ...state, foundations: newF };
  }
  // tableau
  const { col, cardIdx } = from as { zone: "tableau"; col: number; cardIdx: number };
  const newT = state.tableau.map((c, i) => {
    if (i !== col) return c;
    return flipTopCard(c.slice(0, cardIdx));
  }) as GameState["tableau"];
  return { ...state, tableau: newT };
}

function placeOnFoundation(state: GameState, cards: Card[], foundIdx: number): GameState | null {
  if (cards.length !== 1) return null;
  if (!canPlaceFoundation(cards[0], state.foundations[foundIdx])) return null;
  const newF = state.foundations.map((f, i) =>
    i === foundIdx ? [...f, { ...cards[0], faceUp: true }] : f
  ) as GameState["foundations"];
  const won = checkWon(newF);
  return { ...state, foundations: newF, moves: state.moves + 1, won };
}

function placeOnTableauCol(state: GameState, cards: Card[], colIdx: number): GameState | null {
  if (!canPlaceTableau(cards[0], state.tableau[colIdx])) return null;
  const newT = state.tableau.map((col, i) =>
    i === colIdx ? [...col, ...cards.map(c => ({ ...c, faceUp: true }))] : col
  ) as GameState["tableau"];
  return { ...state, tableau: newT, moves: state.moves + 1 };
}

// ─── Card view ────────────────────────────────────────────────────────────────

interface CardProps {
  card: Card;
  dragging?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

function CardView({ card, dragging, onMouseDown, onDoubleClick, style }: CardProps) {
  const color = RED.has(card.suit) ? "#cc0000" : "#000";
  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{
        width: CARD_W,
        height: CARD_H,
        border: "1px solid #808080",
        borderRadius: 3,
        background: card.faceUp
          ? "#fff"
          : "repeating-linear-gradient(45deg,#1a4d9e,#1a4d9e 3px,#2b5fc7 3px,#2b5fc7 6px)",
        cursor: card.faceUp ? (dragging ? "grabbing" : "grab") : "default",
        position: "relative",
        boxShadow: dragging ? "3px 3px 8px rgba(0,0,0,0.5)" : "1px 1px 2px rgba(0,0,0,0.3)",
        flexShrink: 0,
        userSelect: "none",
        boxSizing: "border-box",
        opacity: dragging ? 0.85 : 1,
        ...style,
      }}
    >
      {card.faceUp && (
        <>
          <div style={{ position: "absolute", top: 2, left: 3, fontSize: 8, lineHeight: 1, color, ...FONT }}>
            <div>{VAL_LABEL[card.value]}</div>
            <div>{SUIT_SYM[card.suit]}</div>
          </div>
          <div style={{ position: "absolute", bottom: 2, right: 3, fontSize: 8, lineHeight: 1, color, ...FONT, transform: "rotate(180deg)" }}>
            <div>{VAL_LABEL[card.value]}</div>
            <div>{SUIT_SYM[card.suit]}</div>
          </div>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 18, color }}>
            {SUIT_SYM[card.suit]}
          </div>
        </>
      )}
    </div>
  );
}

function EmptySlot({ label, style }: { label?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: CARD_W, height: CARD_H,
      border: "1px dashed #557755",
      borderRadius: 3,
      background: "rgba(0,0,0,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxSizing: "border-box",
      ...style,
    }}>
      {label && <span style={{ fontSize: 9, color: "#557755" }}>{label}</span>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SolitaireGame() {
  const [game, setGame] = useState<GameState>(initGame);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Refs for hit testing
  const wasteRef = useRef<HTMLDivElement>(null);
  const foundRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null, null, null]);

  // ── Drag handlers ────────────────────────────────────────────────────────

  const startDrag = useCallback((
    e: React.MouseEvent,
    cards: Card[],
    from: From,
  ) => {
    if (!cards[0].faceUp) return;
    e.stopPropagation(); // prevent react-rnd window drag
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDrag({
      cards,
      from,
      ghostX: e.clientX,
      ghostY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: MouseEvent) => {
      setDrag(d => d ? { ...d, ghostX: e.clientX, ghostY: e.clientY } : null);
    };

    const onUp = (e: MouseEvent) => {
      setDrag(null);
      if (!drag) return;

      const cx = e.clientX;
      const cy = e.clientY;

      const hit = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
      };

      // Try foundations
      for (let i = 0; i < 4; i++) {
        if (hit(foundRefs.current[i])) {
          const base = removeFromSource(drag.from.zone === "waste" ? game : game, game, drag.from);
          const result = placeOnFoundation(base, drag.cards, i);
          if (result) { setGame(result); return; }
          break;
        }
      }

      // Try tableau columns
      for (let i = 0; i < 7; i++) {
        if (hit(tabRefs.current[i])) {
          const base = removeFromSource(game, drag.from, drag.cards.length);
          const result = placeOnTableauCol(base, drag.cards, i);
          if (result) { setGame(result); return; }
          break;
        }
      }
      // No valid drop — cards snap back (drag just clears)
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, game]);

  // ── Game actions ─────────────────────────────────────────────────────────

  const clickStock = useCallback(() => {
    setGame(g => {
      if (g.stock.length === 0) {
        if (g.waste.length === 0) return g;
        return { ...g, stock: [...g.waste].reverse().map(c => ({ ...c, faceUp: false })), waste: [] };
      }
      const card = { ...g.stock[g.stock.length - 1], faceUp: true };
      return { ...g, stock: g.stock.slice(0, -1), waste: [...g.waste, card] };
    });
  }, []);

  const autoFoundation = useCallback((from: From, card: Card) => {
    setGame(g => {
      for (let i = 0; i < 4; i++) {
        if (canPlaceFoundation(card, g.foundations[i])) {
          const base = removeFromSource(g, from, 1);
          const result = placeOnFoundation(base, [card], i);
          if (result) return result;
        }
      }
      return g;
    });
  }, []);

  // ── Column height helper ─────────────────────────────────────────────────

  const colHeight = (col: Card[]): number => {
    if (col.length === 0) return CARD_H;
    return col.reduce((h, card, i) =>
      h + (i === col.length - 1 ? CARD_H : (card.faceUp ? FACE_UP_OFFSET : FACE_DOWN_OFFSET)), 0);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: "#1a6b3a",
        width: "100%", height: "100%",
        padding: 8,
        boxSizing: "border-box",
        display: "flex", flexDirection: "column",
        gap: 8,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Win overlay */}
      {game.won && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          zIndex: 200, gap: 16,
        }}>
          <div style={{ ...FONT, fontSize: 14, color: "#ffff00" }}>You Win!</div>
          <div style={{ ...FONT, fontSize: 9, color: "#fff" }}>{game.moves} moves</div>
          <button onClick={() => setGame(initGame())} style={{ ...FONT, fontSize: 9, padding: "6px 14px", cursor: "pointer" }}>
            New Game
          </button>
        </div>
      )}

      {/* Ghost card stack — portalled to body to escape .window-body zoom */}
      {drag && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed",
          left: drag.ghostX - drag.offsetX,
          top: drag.ghostY - drag.offsetY,
          zIndex: 9999,
          pointerEvents: "none",
        }}>
          {drag.cards.map((card, i) => (
            <div key={i} style={{ position: i === 0 ? "relative" : "absolute", top: i === 0 ? 0 : i * FACE_UP_OFFSET, left: 0, zIndex: i }}>
              <CardView card={card} dragging />
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* Top row */}
      <div style={{ display: "flex", gap: PILE_GAP, alignItems: "flex-start" }}>
        {/* Stock */}
        {game.stock.length > 0 ? (
          <CardView
            card={{ suit: "spades", value: 1, faceUp: false }}
            onMouseDown={(e) => { e.stopPropagation(); }}
            onDoubleClick={clickStock}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div onMouseDown={(e) => e.stopPropagation()} onClick={clickStock} style={{ cursor: "pointer" }}>
            <EmptySlot label="↺" />
          </div>
        )}
        {/* Stock — click area */}
        <div style={{ position: "absolute", width: CARD_W, height: CARD_H, cursor: "pointer" }} onClick={clickStock} />

        {/* Waste */}
        <div ref={wasteRef}>
          {game.waste.length > 0 ? (() => {
            const card = game.waste[game.waste.length - 1];
            const from: From = { zone: "waste" };
            return (
              <CardView
                card={card}
                onMouseDown={(e) => startDrag(e, [card], from)}
                onDoubleClick={() => autoFoundation(from, card)}
              />
            );
          })() : <EmptySlot />}
        </div>

        <div style={{ flex: 1 }} />

        {/* Foundations */}
        {game.foundations.map((found, i) => (
          <div
            key={i}
            ref={el => { foundRefs.current[i] = el; }}
          >
            {found.length > 0 ? (() => {
              const card = found[found.length - 1];
              const from: From = { zone: "foundation", idx: i };
              return (
                <CardView
                  card={card}
                  onMouseDown={(e) => startDrag(e, [card], from)}
                />
              );
            })() : (
              <EmptySlot label={["A♥", "A♦", "A♣", "A♠"][i]} />
            )}
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ display: "flex", gap: PILE_GAP, alignItems: "flex-start", flex: 1 }}>
        {game.tableau.map((col, colIdx) => {
          const h = colHeight(col);
          return (
            <div
              key={colIdx}
              ref={el => { tabRefs.current[colIdx] = el; }}
              style={{ position: "relative", width: CARD_W, height: Math.max(h, CARD_H), flexShrink: 0 }}
            >
              {col.length === 0 ? (
                <EmptySlot />
              ) : (
                col.map((card, ci) => {
                  const topOffset = col.slice(0, ci).reduce(
                    (sum, c) => sum + (c.faceUp ? FACE_UP_OFFSET : FACE_DOWN_OFFSET), 0
                  );
                  // Cards being dragged from this column are hidden
                  const isDragged = drag?.from.zone === "tableau"
                    && (drag.from as { zone: "tableau"; col: number; cardIdx: number }).col === colIdx
                    && ci >= (drag.from as { zone: "tableau"; col: number; cardIdx: number }).cardIdx;

                  return (
                    <div key={ci} style={{ position: "absolute", top: topOffset, left: 0, zIndex: ci }}>
                      <CardView
                        card={card}
                        style={{ opacity: isDragged ? 0 : 1 }}
                        onMouseDown={card.faceUp ? (e) => {
                          const from: From = { zone: "tableau", col: colIdx, cardIdx: ci };
                          startDrag(e, col.slice(ci), from);
                        } : undefined}
                        onDoubleClick={ci === col.length - 1 && card.faceUp ? () => {
                          autoFoundation({ zone: "tableau", col: colIdx, cardIdx: ci }, card);
                        } : undefined}
                      />
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...FONT, fontSize: 7, color: "#c8ffc8" }}>Moves: {game.moves}</span>
        <button
          onClick={() => setGame(initGame())}
          style={{ ...FONT, fontSize: 7, padding: "3px 8px", cursor: "pointer", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", background: "#c0c0c0" }}
        >
          New Game
        </button>
        <span style={{ ...FONT, fontSize: 7, color: "#c8ffc8" }}>Stock: {game.stock.length}</span>
      </div>
    </div>
  );
}
