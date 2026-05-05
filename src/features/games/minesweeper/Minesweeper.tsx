"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;
const CELL_PX = 28;

interface Cell {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
}

type GameStatus = "playing" | "won" | "lost";

function FlagIcon() {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="0" width="2" height="14" fill="#000" />
      <polygon points="7,0 7,7 13,3.5" fill="#cc0000" />
      <rect x="2" y="13" width="9" height="2" fill="#000" />
    </svg>
  );
}

function MineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="4" fill="#000" />
      {[0, 45, 90, 135].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 7 + Math.cos(rad) * 4;
        const y1 = 7 + Math.sin(rad) * 4;
        const x2 = 7 + Math.cos(rad) * 7;
        const y2 = 7 + Math.sin(rad) * 7;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="1.5" />;
      })}
      <circle cx="5.5" cy="5.5" r="1" fill="#fff" />
    </svg>
  );
}

// Classic Minesweeper number colors
const NUMBER_COLORS: Record<number, string> = {
  1: "#0000ff",
  2: "#008000",
  3: "#ff0000",
  4: "#000080",
  5: "#800000",
  6: "#008080",
  7: "#000000",
  8: "#808080",
};

function createBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0,
    }))
  );

  // Place mines
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate adjacent mine counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[r][c].adjacentMines = count;
    }
  }

  return board;
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function revealCell(board: Cell[][], r: number, c: number): Cell[][] {
  const newBoard = cloneBoard(board);
  const stack: [number, number][] = [[r, c]];

  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    const cell = newBoard[cr][cc];
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;

    // Flood-fill for empty cells (0 adjacent mines)
    if (cell.adjacentMines === 0 && !cell.isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          stack.push([cr + dr, cc + dc]);
        }
      }
    }
  }

  return newBoard;
}

function checkWin(board: Cell[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine && !board[r][c].revealed) return false;
    }
  }
  return true;
}

function revealAllMines(board: Cell[][]): Cell[][] {
  const newBoard = cloneBoard(board);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newBoard[r][c].isMine) newBoard[r][c].revealed = true;
    }
  }
  return newBoard;
}

export default function Minesweeper() {
  const [board, setBoard] = useState(createBoard);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState(() =>
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("minesweeper_best_time") ?? "0", 10)
      : 0
  );
  const [flagMode, setFlagMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const startedRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const baseSize = COLS * CELL_PX;
      const newScale = Math.min(width / baseSize, height / baseSize);
      setScale(Math.max(0.1, newScale));
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const flagCount = board.flat().filter((c) => c.flagged).length;

  // Timer logic
  useEffect(() => {
    if (gameStatus !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
  }, [gameStatus]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startedRef.current = false;
    setBoard(createBoard());
    setGameStatus("playing");
    setTimer(0);
    setFlagMode(false);
  }, []);

  const handleClick = useCallback(
    (r: number, c: number) => {
      if (gameStatus !== "playing") return;
      const cell = board[r][c];

      if (flagMode) {
        if (cell.revealed) return;
        startTimer();
        const newBoard = cloneBoard(board);
        newBoard[r][c].flagged = !newBoard[r][c].flagged;
        setBoard(newBoard);
        return;
      }

      if (cell.revealed || cell.flagged) return;
      startTimer();

      if (cell.isMine) {
        setBoard(revealAllMines(board));
        setGameStatus("lost");
        return;
      }

      const newBoard = revealCell(board, r, c);
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setGameStatus("won");
        if (bestTime === 0 || timer < bestTime) {
          setBestTime(timer);
          localStorage.setItem("minesweeper_best_time", String(timer));
        }
      }
    },
    [board, gameStatus, flagMode, startTimer]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (gameStatus !== "playing") return;
      const cell = board[r][c];
      if (cell.revealed) return;

      startTimer();

      const newBoard = cloneBoard(board);
      newBoard[r][c].flagged = !newBoard[r][c].flagged;
      setBoard(newBoard);
    },
    [board, gameStatus, startTimer]
  );

  const smiley = gameStatus === "won" ? "B)" : gameStatus === "lost" ? "X(" : ":)";

  return (
    <div className="flex flex-col items-center gap-1 w-full h-full overflow-hidden" style={{ padding: "4px" }}>
      {/* Header: mine counter, smiley, timer */}
      <div
        className="flex items-center justify-between w-full"
        style={{
          padding: "4px 8px",
          background: "#c0c0c0",
          border: "2px inset",
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "12px",
            color: "#ff0000",
            background: "#000",
            padding: "2px 4px",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {String(MINE_COUNT - flagCount).padStart(3, "0")}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={resetGame} style={{ fontSize: "16px", padding: "2px 6px", cursor: "pointer" }}>
            {smiley}
          </button>
          <button onClick={() => setShowHelp(true)} style={{ fontSize: "11px", padding: "2px 5px", cursor: "pointer", fontFamily: "Tahoma, sans-serif" }}>
            ?
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "12px",
              color: "#ff0000",
              background: "#000",
              padding: "2px 4px",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {String(Math.min(timer, 999)).padStart(3, "0")}
          </span>
          {bestTime > 0 && (
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "6px", color: "#555", whiteSpace: "nowrap" }}>
              best {String(bestTime).padStart(3, "0")}s
            </span>
          )}
        </div>
      </div>

      {/* Mode toggle — mobile only */}
      {isNarrow && <div style={{ display: "flex", gap: "4px" }}>
        <button
          onClick={() => setFlagMode(false)}
          style={{
            flex: 1,
            padding: "4px",
            fontSize: "10px",
            fontFamily: "Tahoma, sans-serif",
            cursor: "pointer",
            boxShadow: !flagMode ? "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff" : undefined,
            fontWeight: !flagMode ? "bold" : "normal",
          }}
        >⬜ Dig</button>
        <button
          onClick={() => setFlagMode(true)}
          style={{
            flex: 1,
            padding: "4px",
            fontSize: "10px",
            fontFamily: "Tahoma, sans-serif",
            cursor: "pointer",
            boxShadow: flagMode ? "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff" : undefined,
            fontWeight: flagMode ? "bold" : "normal",
          }}
        >🚩 Flag</button>
      </div>}

      {/* Grid */}
      <div ref={wrapperRef} className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${CELL_PX}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_PX}px)`,
            border: "2px inset",
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                style={{
                  width: CELL_PX,
                  height: CELL_PX,
                  padding: 0,
                  fontSize: "12px",
                  fontFamily: "'Press Start 2P', cursive",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: gameStatus === "playing" ? "pointer" : "default",
                  color: cell.revealed && !cell.isMine
                    ? NUMBER_COLORS[cell.adjacentMines] || "#000"
                    : "#000",
                  backgroundColor: cell.revealed ? "#c0c0c0" : undefined,
                  border: cell.revealed ? "1px solid #808080" : undefined,
                }}
              >
                {cell.revealed
                  ? cell.isMine
                    ? <MineIcon />
                    : cell.adjacentMines > 0
                      ? cell.adjacentMines
                      : ""
                  : cell.flagged
                    ? <FlagIcon />
                    : ""}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
          onClick={() => setShowHelp(false)}
        >
          <div className="window" style={{ minWidth: 260, maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <div className="title-bar">
              <div className="title-bar-text">Minesweeper — How to Play</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setShowHelp(false)} />
              </div>
            </div>
            <div className="window-body" style={{ padding: "12px 16px", fontSize: 11, lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Controls</p>
              <div style={{ display: "flex", gap: 12, margin: "0 0 12px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>🖱️</div>
                  <div style={{ fontSize: 9 }}>Left click</div>
                  <div style={{ fontSize: 9, color: "#555" }}>Reveal cell</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>🚩</div>
                  <div style={{ fontSize: 9 }}>Right click</div>
                  <div style={{ fontSize: 9, color: "#555" }}>Flag mine</div>
                </div>
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Reading the numbers</p>
              {/* Mini grid example */}
              <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(4, 26px)", gap: 2, margin: "0 0 8px", fontFamily: "monospace", fontSize: 12 }}>
                {[
                  { v: "1", c: "#0000cc" }, { v: "1", c: "#0000cc" }, { v: "1", c: "#0000cc" }, { v: " ", c: "#000" },
                  { v: "1", c: "#0000cc" }, { v: "🚩", c: "#000" }, { v: "1", c: "#0000cc" }, { v: " ", c: "#000" },
                  { v: "1", c: "#0000cc" }, { v: "1", c: "#0000cc" }, { v: "1", c: "#0000cc" }, { v: " ", c: "#000" },
                ].map((cell, i) => (
                  <div key={i} style={{ width: 26, height: 26, border: "1px solid #808080", background: "#c0c0c0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: cell.c }}>
                    {cell.v}
                  </div>
                ))}
              </div>
              <p style={{ margin: "0 0 4px" }}>• Each number = mines touching that cell</p>
              <p style={{ margin: 0 }}>• Reveal all safe cells to <strong>win</strong> 🎉</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
