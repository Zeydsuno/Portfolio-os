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
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const startedRef = useRef(false);

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
  }, []);

  const handleClick = useCallback(
    (r: number, c: number) => {
      if (gameStatus !== "playing") return;
      const cell = board[r][c];
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
      }
    },
    [board, gameStatus, startTimer]
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
    <div className="flex flex-col items-center gap-1" style={{ padding: "4px" }}>
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
        <button
          onClick={resetGame}
          style={{
            fontSize: "16px",
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          {smiley}
        </button>
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
      </div>

      {/* Grid */}
      <div
        style={{
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
                  ? "*"
                  : cell.adjacentMines > 0
                    ? cell.adjacentMines
                    : ""
                : cell.flagged
                  ? "F"
                  : ""}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
